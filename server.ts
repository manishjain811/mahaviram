/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { SEED_RESIDENTS } from "./src/data/seedData";
import { Resident } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- DATABASE STATE ---
let dbClient: MongoClient | null = null;
let dbConnected = false;
let dbError: string | null = null;
let dbStatusMessage = "Initializing Connection...";

// In-memory fallback sandbox database
let memoryResidents: Resident[] = [...SEED_RESIDENTS];

// Try connecting to MongoDB if MONGODB_URI is provided
const MONGODB_URI = process.env.MONGODB_URI;

async function initDatabase() {
  if (!MONGODB_URI || MONGODB_URI.includes("MY_GEMINI_API_KEY") || MONGODB_URI.includes("username:password")) {
    dbConnected = false;
    dbStatusMessage = "Offline Sandbox (No MONGODB_URI set in Secrets)";
    console.log("⚠️ MONGODB_URI is not configured. Running in Local Memory Sandbox mode.");
    return;
  }

  try {
    console.log("🔌 Attempting connection to MongoDB...");
    dbClient = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await dbClient.connect();
    dbConnected = true;
    dbStatusMessage = "Connected to Live MongoDB Atlas!";
    dbError = null;
    console.log("✅ Successfully connected to MongoDB Database!");

    // Check if the collection is empty, and seed it if needed
    const db = dbClient.db();
    const count = await db.collection("residents").countDocuments();
    if (count === 0) {
      console.log("🌱 Database is empty. Seeding initial residents list...");
      await db.collection("residents").insertMany(SEED_RESIDENTS);
    }
  } catch (error: any) {
    dbConnected = false;
    dbError = error.message || String(error);
    dbStatusMessage = "Connection Failed (Falling back to local sandbox)";
    console.error("❌ MongoDB connection error:", error);
  }
}

// Get the active collection or fallback data
async function getResidentsCollection() {
  if (dbConnected && dbClient) {
    return dbClient.db().collection<Resident>("residents");
  }
  return null;
}

// Initialize on start
initDatabase();

// --- API ENDPOINTS ---

// 1. Get database connectivity status
app.get("/api/db-status", (req, res) => {
  res.json({
    connected: dbConnected,
    statusMessage: dbStatusMessage,
    error: dbError,
    uriConfigured: !!MONGODB_URI && !MONGODB_URI.includes("username:password"),
    mode: dbConnected ? "MongoDB Atlas" : "Local Sandbox"
  });
});

// 2. Reset database endpoint (restores seeds)
app.post("/api/reset", async (req, res) => {
  try {
    const col = await getResidentsCollection();
    if (col) {
      await col.deleteMany({});
      await col.insertMany(SEED_RESIDENTS);
      console.log("🌱 Live MongoDB database re-seeded successfully.");
    } else {
      memoryResidents = [...SEED_RESIDENTS];
      console.log("🌱 Local memory database re-seeded successfully.");
    }
    res.json({ success: true, message: "Database reset to initial seeds successfully!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reset database" });
  }
});

// 3. Search or list residents
app.get("/api/residents", async (req, res) => {
  try {
    const query = (req.query.query as string || "").trim().toLowerCase();
    const searchBy = req.query.searchBy as string || "Name";

    let list: Resident[] = [];
    const col = await getResidentsCollection();

    if (col) {
      list = await col.find({}).toArray();
    } else {
      list = [...memoryResidents];
    }

    if (query) {
      list = list.filter((res) => {
        if (searchBy === "Name") {
          return res.name.toLowerCase().includes(query);
        } else if (searchBy === "Flat Number") {
          return res.flatNumber.toLowerCase().includes(query);
        } else if (searchBy === "Mobile Number") {
          return res.mobile.toLowerCase().includes(query);
        }
        return false;
      });
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch residents" });
  }
});

// 4. Create new resident
app.post("/api/residents", async (req, res) => {
  try {
    const { name, mobile, flatNumber, email, address, photoUrl, familyMembers } = req.body;

    if (!name || !mobile || !flatNumber) {
      return res.status(400).json({ error: "Name, Mobile, and Flat Number are mandatory" });
    }

    // Check for duplicate mobile
    let isDuplicate = false;
    const col = await getResidentsCollection();

    if (col) {
      const existing = await col.findOne({ mobile });
      if (existing) isDuplicate = true;
    } else {
      isDuplicate = memoryResidents.some(r => r.mobile === mobile);
    }

    if (isDuplicate) {
      return res.status(400).json({ error: "Mobile number is already registered" });
    }

    const newResident: Resident = {
      id: `res-${Date.now()}`,
      name: name.trim(),
      mobile: mobile.trim(),
      flatNumber: flatNumber.trim().toUpperCase(),
      email: (email || "").trim(),
      address: (address || "").trim(),
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      familyMembers: familyMembers || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true
    };

    if (col) {
      await col.insertOne(newResident);
    } else {
      memoryResidents.unshift(newResident);
    }

    console.log(`✅ Registered new resident profile: ${newResident.name}`);
    res.status(201).json(newResident);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create resident" });
  }
});

// 5. Update existing resident
app.put("/api/residents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, flatNumber, email, address, photoUrl, familyMembers } = req.body;

    if (!name || !mobile || !flatNumber) {
      return res.status(400).json({ error: "Name, Mobile, and Flat Number are mandatory" });
    }

    // Check for duplicate mobile (excluding current id)
    let isDuplicate = false;
    const col = await getResidentsCollection();

    if (col) {
      const existing = await col.findOne({ mobile, id: { $ne: id } });
      if (existing) isDuplicate = true;
    } else {
      isDuplicate = memoryResidents.some(r => r.mobile === mobile && r.id !== id);
    }

    if (isDuplicate) {
      return res.status(400).json({ error: "Mobile number is already registered to another user" });
    }

    let updatedResident: Resident | null = null;

    if (col) {
      const existingDoc = await col.findOne({ id });
      if (!existingDoc) {
        return res.status(404).json({ error: "Resident not found" });
      }

      updatedResident = {
        ...existingDoc,
        name: name.trim(),
        mobile: mobile.trim(),
        flatNumber: flatNumber.trim().toUpperCase(),
        email: (email || "").trim(),
        address: (address || "").trim(),
        photoUrl: photoUrl || existingDoc.photoUrl,
        familyMembers: familyMembers || [],
        updatedAt: new Date().toISOString()
      };

      await col.updateOne({ id }, { $set: updatedResident });
    } else {
      const index = memoryResidents.findIndex(r => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Resident not found" });
      }

      updatedResident = {
        ...memoryResidents[index],
        name: name.trim(),
        mobile: mobile.trim(),
        flatNumber: flatNumber.trim().toUpperCase(),
        email: (email || "").trim(),
        address: (address || "").trim(),
        photoUrl: photoUrl || memoryResidents[index].photoUrl,
        familyMembers: familyMembers || [],
        updatedAt: new Date().toISOString()
      };

      memoryResidents[index] = updatedResident;
    }

    console.log(`✅ Updated resident profile: ${updatedResident.name}`);
    res.json(updatedResident);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update resident" });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Mahaviram Directory Server running at http://localhost:${PORT}`);
  });
}

startServer();
