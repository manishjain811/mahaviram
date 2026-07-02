/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Menu, User, Phone, MapPin, Mail, 
  Plus, Trash2, ArrowRight, ArrowLeft, LogOut, Info, 
  CheckCircle, ShieldAlert, Sparkles, UserPlus, LogIn, Edit, 
  Map, PhoneCall, HelpCircle, ExternalLink, MessageSquare, 
  Lock, Calendar, Bell, Shield, Compass, ChevronRight,
  Camera, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import DeviceFrame from './components/DeviceFrame';
import { 
  M3Button, M3TextField, M3Card, M3Dropdown, 
  M3CircularProgress, CameraGallerySimulator 
} from './components/MaterialComponents';
import { Resident, FamilyMember, Screen, SearchByOption } from './types';
import { SEED_RESIDENTS } from './data/seedData';

export default function App() {
  // --- DATABASE & SESSION STATES ---
  const [residents, setResidents] = useState<Resident[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('GUEST_HOME');
  
  // --- SEARCH STATES ---
  const [searchBy, setSearchBy] = useState<SearchByOption>('Name');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Resident[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  
  // --- AUTH INPUT STATES ---
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  
  // --- SIGN UP / EDIT RESIDENT INPUT STATES ---
  const [editId, setEditId] = useState<string | null>(null); // null means creating a new profile
  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputFlat, setInputFlat] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [inputPhoto, setInputPhoto] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  // --- UI STATES ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null); // To show splash checkmarks

  // --- DATABASE & CONNECTION STATES ---
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    statusMessage: 'Checking Database Connection...',
    mode: 'Local Sandbox'
  });

  // --- FETCH RESIDENTS FROM BACKEND ---
  const fetchResidents = async () => {
    try {
      const res = await fetch('/api/residents');
      if (res.ok) {
        const data = await res.json();
        setResidents(data);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.error('Failed to fetch residents from backend, falling back to local storage:', e);
      const storedResidents = localStorage.getItem('mahaviram_residents');
      if (storedResidents) {
        try {
          setResidents(JSON.parse(storedResidents));
        } catch (err) {
          setResidents(SEED_RESIDENTS);
        }
      } else {
        setResidents(SEED_RESIDENTS);
        localStorage.setItem('mahaviram_residents', JSON.stringify(SEED_RESIDENTS));
      }
    }
  };

  // --- FETCH DATABASE CONNECTION STATUS ---
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          connected: data.connected,
          statusMessage: data.statusMessage,
          mode: data.mode
        });
      }
    } catch (e) {
      console.error('Failed to fetch db status:', e);
    }
  };

  // --- INITIALIZE DATA AND SESSION ---
  useEffect(() => {
    fetchDbStatus();
    fetchResidents();

    const sessionUserId = localStorage.getItem('mahaviram_session_user');
    if (sessionUserId) {
      setCurrentUserId(sessionUserId);
      setCurrentScreen('SEARCH');
    } else {
      setCurrentScreen('GUEST_HOME');
    }
  }, []);

  // --- BACKEND / LOCAL FALLBACK PERSISTENCE ENGINE ---
  const saveResidentsToDb = async (updatedResidents: Resident[]) => {
    setResidents(updatedResidents);
    localStorage.setItem('mahaviram_residents', JSON.stringify(updatedResidents));
  };

  // --- TRIGGER TOASTS ---
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- RESET DATABASE TO INITIAL SEED ---
  const handleResetDatabase = async () => {
    if (window.confirm('This will restore all default residents and erase custom accounts. Do you want to proceed?')) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          showToast('Database reset to defaults successfully!', 'success');
        } else {
          showToast('Database reset requested (local cache cleared)', 'info');
        }
      } catch (err) {
        console.error(err);
        showToast('Database reset locally', 'success');
      }
      localStorage.clear();
      await fetchResidents();
      setCurrentUserId(null);
      setCurrentScreen('GUEST_HOME');
      setSelectedResident(null);
      setSearchQuery('');
      setHasSearched(false);
      setIsLoading(false);
    }
  };

  // --- LOG OUT ACTION ---
  const handleLogout = () => {
    localStorage.removeItem('mahaviram_session_user');
    setCurrentUserId(null);
    setCurrentScreen('GUEST_HOME');
    setIsDrawerOpen(false);
    setSelectedResident(null);
    setSearchQuery('');
    setHasSearched(false);
    showToast('Signed out successfully!', 'success');
  };

  // --- SIMULATED PHONE AUTH OTP FLOW ---
  const handleRequestOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPhone) {
      setLoginError('Mobile Number is required');
      return;
    }
    if (loginPhone.length < 10) {
      setLoginError('Enter a valid 10-digit mobile number');
      return;
    }

    // Check if resident exists
    const exists = residents.some(r => r.mobile === loginPhone);
    if (!exists) {
      setLoginError('This mobile number is not registered in Mahaviram directory');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setSimulatedOtp(generatedOtp);
      setOtpSent(true);
      showToast(`SMS OTP sent! Simulated OTP is: ${generatedOtp}`, 'info');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!otpCode) {
      setLoginError('Enter the 4-digit code');
      return;
    }

    if (otpCode === simulatedOtp || otpCode === '1234' || loginPassword === '123456') {
      // Find user
      const resident = residents.find(r => r.mobile === loginPhone);
      if (resident) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setCurrentUserId(resident.id);
          localStorage.setItem('mahaviram_session_user', resident.id);
          setSuccessAnimation('Welcome back!');
          setTimeout(() => {
            setSuccessAnimation(null);
            setCurrentScreen('SEARCH');
            setLoginPhone('');
            setOtpCode('');
            setOtpSent(false);
          }, 1500);
        }, 1000);
      } else {
        setLoginError('Authentication failed');
      }
    } else {
      setLoginError('Invalid OTP code. Try "1234" or the simulated code.');
    }
  };

  // --- SIGN UP & EDIT PROFILE VALIDATIONS & SAVE ---
  const validateResidentInputs = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!inputName.trim()) {
      errors.name = 'Full Name is required';
    }
    
    if (!inputPhone.trim()) {
      errors.phone = 'Mobile Number is required';
    } else if (inputPhone.trim().length !== 10 || !/^\d+$/.test(inputPhone)) {
      errors.phone = 'Phone must be a valid 10-digit number';
    } else {
      // Prevent duplicate mobile
      const isDuplicate = residents.some(r => r.mobile === inputPhone && r.id !== editId);
      if (isDuplicate) {
        errors.phone = 'This mobile number is already registered';
      }
    }

    if (!inputFlat.trim()) {
      errors.flat = 'Flat Number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveResident = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateResidentInputs()) {
      showToast('Please correct validation errors', 'error');
      return;
    }

    setIsLoading(true);

    const payload = {
      name: inputName.trim(),
      mobile: inputPhone.trim(),
      flatNumber: inputFlat.trim().toUpperCase(),
      email: inputEmail.trim(),
      address: inputAddress.trim() || `Mahaviram Apartment, Flat ${inputFlat.trim().toUpperCase()}, Udaipur, Rajasthan, 313001`,
      photoUrl: inputPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
      familyMembers: familyMembers,
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/residents/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/residents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const savedData = await res.json();
        await fetchResidents();

        if (editId) {
          setSuccessAnimation('Profile Updated!');
          if (selectedResident && selectedResident.id === editId) {
            setSelectedResident(savedData);
          }
          setTimeout(() => {
            setSuccessAnimation(null);
            if (currentUserId === editId) {
              setCurrentScreen('SEARCH');
            } else {
              setCurrentScreen('RESIDENT_PROFILE');
            }
          }, 1500);
        } else {
          setCurrentUserId(savedData.id);
          localStorage.setItem('mahaviram_session_user', savedData.id);
          setSuccessAnimation('Account Created!');
          setTimeout(() => {
            setSuccessAnimation(null);
            setCurrentScreen('SEARCH');
          }, 1500);
        }
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to save resident profile', 'error');
      }
    } catch (err: any) {
      console.error('Save API error, using local fallback:', err);
      // Fallback to offline local storage write
      if (editId) {
        const updated = residents.map((r) => {
          if (r.id === editId) {
            return {
              ...r,
              name: inputName.trim(),
              mobile: inputPhone.trim(),
              flatNumber: inputFlat.trim().toUpperCase(),
              email: inputEmail.trim(),
              address: inputAddress.trim() || `Mahaviram Apartment, Flat ${inputFlat.trim().toUpperCase()}, Udaipur, Rajasthan, 313001`,
              photoUrl: inputPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
              familyMembers: familyMembers,
              updatedAt: new Date().toISOString()
            };
          }
          return r;
        });

        saveResidentsToDb(updated);
        setSuccessAnimation('Profile Saved Offline!');
        
        if (selectedResident && selectedResident.id === editId) {
          const matching = updated.find(r => r.id === editId);
          if (matching) setSelectedResident(matching);
        }

        setTimeout(() => {
          setSuccessAnimation(null);
          if (currentUserId === editId) {
            setCurrentScreen('SEARCH');
          } else {
            setCurrentScreen('RESIDENT_PROFILE');
          }
        }, 1500);

      } else {
        const newResident: Resident = {
          id: `res-${Date.now()}`,
          name: inputName.trim(),
          mobile: inputPhone.trim(),
          flatNumber: inputFlat.trim().toUpperCase(),
          email: inputEmail.trim(),
          address: inputAddress.trim() || `Mahaviram Apartment, Flat ${inputFlat.trim().toUpperCase()}, Udaipur, Rajasthan, 313001`,
          photoUrl: inputPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
          familyMembers: familyMembers,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: true
        };

        const updated = [newResident, ...residents];
        saveResidentsToDb(updated);
        
        setCurrentUserId(newResident.id);
        localStorage.setItem('mahaviram_session_user', newResident.id);

        setSuccessAnimation('Account Created Offline!');
        setTimeout(() => {
          setSuccessAnimation(null);
          setCurrentScreen('SEARCH');
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- PREPARE INPUT FORM FOR CREATION OR EDITING ---
  const prepareFormForEditing = (resident: Resident) => {
    setEditId(resident.id);
    setInputName(resident.name);
    setInputPhone(resident.mobile);
    setInputFlat(resident.flatNumber);
    setInputEmail(resident.email);
    setInputAddress(resident.address);
    setInputPhoto(resident.photoUrl);
    setFamilyMembers([...resident.familyMembers]);
    setValidationErrors({});
    setCurrentScreen('EDIT_PROFILE');
  };

  const prepareFormForSignUp = () => {
    setEditId(null);
    setInputName('');
    setInputPhone('');
    setInputFlat('');
    setInputEmail('');
    setInputAddress('');
    setInputPhoto('');
    setFamilyMembers([]);
    setValidationErrors({});
    setCurrentScreen('SIGN_UP');
  };

  // --- SEARCH ACTION ---
  const handleSearch = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/residents?query=${encodeURIComponent(query)}&searchBy=${encodeURIComponent(searchBy)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        throw new Error('API Search failed');
      }
    } catch (err) {
      console.error('Search API error, doing local filtering fallback:', err);
      const filtered = residents.filter((res) => {
        if (searchBy === 'Name') {
          return res.name.toLowerCase().includes(query);
        } else if (searchBy === 'Flat Number') {
          return res.flatNumber.toLowerCase().includes(query);
        } else if (searchBy === 'Mobile Number') {
          return res.mobile.toLowerCase().includes(query);
        }
        return false;
      });
      setSearchResults(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FAMILY MEMBERS ACTIONS ---
  const addFamilyRow = () => {
    setFamilyMembers([
      ...familyMembers,
      { id: `fam-${Date.now()}-${Math.random()}`, relationship: 'Son', name: '' }
    ]);
  };

  const updateFamilyRow = (id: string, field: 'relationship' | 'name', value: string) => {
    const updated = familyMembers.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setFamilyMembers(updated);
  };

  const deleteFamilyRow = (id: string) => {
    setFamilyMembers(familyMembers.filter(r => r.id !== id));
  };

  // Find currently logged-in user details
  const loggedInUser = residents.find(r => r.id === currentUserId);

  return (
    <DeviceFrame onResetDatabase={handleResetDatabase}>
      {/* Dynamic Overlay Success Screen Animation */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/95 text-white z-200 flex flex-col items-center justify-center p-6 text-center select-none rounded-[30px]"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <CheckCircle className="w-24 h-24 text-accent mb-6 stroke-[2.5]" />
            </motion.div>
            <h2 className="font-display font-bold text-2xl tracking-tight mb-2">
              {successAnimation}
            </h2>
            <p className="text-sm text-primary-light font-medium">Processing secure society authorization...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="absolute top-12 inset-x-6 z-150 select-none"
          >
            <div className={`p-4 rounded-2xl m3-shadow-2 flex items-center gap-3 border ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : toastMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-primary-light border-blue-200 text-primary-dark'
            }`}>
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">{toastMessage.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          GUEST HOME SCREEN
          ======================================================== */}
      {currentScreen === 'GUEST_HOME' && (
        <div className="flex-1 flex flex-col justify-between p-6 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(248,249,250,0.92), rgba(248,249,250,0.95)), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400')` }}>
          
          {/* Top Header */}
          <div className="flex flex-col items-center text-center mt-12 gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary text-primary flex items-center justify-center m3-shadow-1">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl tracking-tight text-primary">
                Mahaviram Apartment
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Udaipur, Rajasthan
              </p>
            </div>
          </div>

          {/* Central Actions */}
          <div className="flex flex-col gap-4 max-w-sm w-full mx-auto my-8">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 text-center m3-shadow-1 mb-2">
              <span className="text-accent text-xs font-black uppercase tracking-wider block mb-1">
                Welcome To Our Society Directory
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect securely with residents, search flat directories, and manage profiles from a fast offline-ready console.
              </p>
            </div>

            <M3Button 
              id="guest-btn-signup"
              onClick={prepareFormForSignUp} 
              variant="filled" 
              className="w-full shadow-lg"
              icon={<UserPlus className="w-4 h-4" />}
            >
              Sign Up Resident Profile
            </M3Button>

            <M3Button 
              id="guest-btn-signin"
              onClick={() => setCurrentScreen('SIGN_IN')} 
              variant="outlined" 
              className="w-full"
              icon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Directory
            </M3Button>
          </div>

          {/* Version Footer */}
          <div className="text-center pb-4 text-[10px] text-slate-400 font-mono tracking-wider">
            APP VERSION 1.0.0 • POWERED BY GOOGLE DEEPMIND
          </div>
        </div>
      )}

      {/* ========================================================
          SIGN IN SCREEN
          ======================================================== */}
      {currentScreen === 'SIGN_IN' && (
        <div className="flex-1 flex flex-col bg-surface-bg p-6">
          {/* Top Bar Navigation */}
          <div className="flex items-center gap-2 mb-8">
            <button 
              onClick={() => {
                setOtpSent(false);
                setLoginError('');
                setCurrentScreen('GUEST_HOME');
              }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-display font-bold text-sm text-slate-700">Go Back</span>
          </div>

          {/* Banner */}
          <div className="mb-6">
            <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">
              {otpSent ? 'Enter OTP Verification' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {otpSent 
                ? `Enter the verification code sent to ${loginPhone}`
                : 'Sign in to access Mahaviram resident directory directories.'}
            </p>
          </div>

          {/* Main Login Form */}
          <div className="flex-grow flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              {!otpSent ? (
                <>
                  <M3TextField
                    id="signin-phone"
                    label="Mobile Number"
                    value={loginPhone}
                    onChange={(val) => setLoginPhone(val.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    icon={<Phone className="w-4 h-4" />}
                    error={loginError}
                  />

                  {/* Dummy Password hint for ease of check */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 text-center text-xs text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-600 block mb-1">💡 Demo Sandbox Mode</span>
                    Simulates actual mobile OTP verification instantly on requesting. You can use any preloaded phone number like <span className="font-mono font-bold text-primary">9829012345</span> (Rahul Jain).
                  </div>
                </>
              ) : (
                <>
                  <M3TextField
                    id="signin-otp"
                    label="Enter OTP Code"
                    value={otpCode}
                    onChange={(val) => setOtpCode(val.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 1234"
                    icon={<Lock className="w-4 h-4" />}
                    error={loginError}
                  />

                  {simulatedOtp && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                      <p className="text-xs text-amber-800 font-medium">
                        Simulated SMS Gateway Dispatch:
                      </p>
                      <p className="text-sm font-bold text-amber-900 mt-1 select-all tracking-wider font-mono">
                        OTP Code: {simulatedOtp}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="mt-8 flex flex-col gap-3">
              {isLoading ? (
                <M3CircularProgress />
              ) : !otpSent ? (
                <M3Button
                  id="signin-btn-get-otp"
                  onClick={handleRequestOtp}
                  variant="filled"
                  icon={<PhoneCall className="w-4 h-4" />}
                >
                  Send OTP Verification Code
                </M3Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <M3Button
                    id="signin-btn-verify-otp"
                    onClick={handleVerifyOtp}
                    variant="filled"
                  >
                    Verify & Access Directory
                  </M3Button>
                  <M3Button
                    id="signin-btn-resend"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    variant="text"
                    className="text-slate-500 font-semibold"
                  >
                    Change Mobile Number
                  </M3Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SIGN UP / EDIT PROFILE FORM SCREEN
          ======================================================== */}
      {(currentScreen === 'SIGN_UP' || currentScreen === 'EDIT_PROFILE') && (
        <div className="flex-1 flex flex-col bg-surface-bg p-6">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (editId) {
                    if (currentUserId === editId) {
                      setCurrentScreen('SEARCH');
                    } else {
                      setCurrentScreen('RESIDENT_PROFILE');
                    }
                  } else {
                    setCurrentScreen('GUEST_HOME');
                  }
                }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display font-bold text-sm text-slate-700">
                {editId ? 'Edit Profile' : 'Resident Sign Up'}
              </h3>
            </div>
          </div>

          <div className="flex-grow flex flex-col overflow-y-auto">
            {/* Header Text */}
            <div className="mb-6">
              <h2 className="font-display font-black text-xl text-slate-900 tracking-tight">
                {editId ? 'Modify Details' : 'Register Profile'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {editId ? 'Update fields below to apply changes instantly.' : 'Complete the mandatory fields to join the directory.'}
              </p>
            </div>

            {/* Profile Picture Circle */}
            <div className="flex flex-col items-center gap-2.5 mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-2 border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center shadow-md">
                  {inputPhoto ? (
                    <img 
                      src={inputPhoto} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <button
                  id="profile-btn-pick-photo"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white hover:bg-primary-dark rounded-full shadow-lg active:scale-95 transition-all"
                  title="Change Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-500 font-semibold">Profile Photo (Optional)</span>
            </div>

            {/* Form Fields */}
            <form className="flex flex-col gap-4">
              <M3TextField
                id="form-name"
                label="Full Name"
                value={inputName}
                onChange={setInputName}
                placeholder="e.g. Rahul Jain"
                required
                error={validationErrors.name}
              />

              <M3TextField
                id="form-phone"
                label="Mobile Number"
                value={inputPhone}
                onChange={(val) => setInputPhone(val.replace(/\D/g, '').slice(0, 10))}
                placeholder="10 digit number"
                required
                error={validationErrors.phone}
                disabled={!!editId && currentUserId === editId} // Prevent phone change if editing self (acts as identifier)
              />

              <M3TextField
                id="form-flat"
                label="Flat Number"
                value={inputFlat}
                onChange={setInputFlat}
                placeholder="e.g. A-203"
                required
                error={validationErrors.flat}
              />

              <M3TextField
                id="form-email"
                label="Email Address"
                value={inputEmail}
                onChange={setInputEmail}
                placeholder="e.g. name@example.com"
                type="email"
              />

              <M3TextField
                id="form-address"
                label="Address"
                value={inputAddress}
                onChange={setInputAddress}
                placeholder="Optional detailed address"
              />

              {/* FAMILY DETAILS ROW */}
              <div className="border-t border-slate-200 mt-6 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900">Family Members</h4>
                    <p className="text-[10px] text-slate-400">Map relatives residing in same flat</p>
                  </div>
                  <M3Button
                    id="form-btn-add-family"
                    onClick={(e) => { e.preventDefault(); addFamilyRow(); }}
                    variant="tonal"
                    className="py-2 px-3 text-xs"
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Relative
                  </M3Button>
                </div>

                <div className="flex flex-col gap-3">
                  {familyMembers.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400">No family members registered yet.</p>
                    </div>
                  ) : (
                    familyMembers.map((row, index) => (
                      <div key={row.id} className="flex gap-2 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100 animate-fadeIn">
                        {/* Dropdown relation */}
                        <div className="w-1/3">
                          <select
                            value={row.relationship}
                            onChange={(e) => updateFamilyRow(row.id, 'relationship', e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2 py-2.5 outline-none font-semibold text-slate-700"
                          >
                            {['Father', 'Mother', 'Husband', 'Wife', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Name input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Enter person's name"
                            value={row.name}
                            onChange={(e) => updateFamilyRow(row.id, 'name', e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 outline-none text-slate-800 placeholder-slate-400"
                          />
                        </div>

                        {/* Trash delete */}
                        <button
                          type="button"
                          onClick={() => deleteFamilyRow(row.id)}
                          className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
            <M3Button
              variant="outlined"
              onClick={() => {
                if (editId) {
                  if (currentUserId === editId) {
                    setCurrentScreen('SEARCH');
                  } else {
                    setCurrentScreen('RESIDENT_PROFILE');
                  }
                } else {
                  setCurrentScreen('GUEST_HOME');
                }
              }}
              className="flex-1 py-3"
            >
              Cancel
            </M3Button>

            {isLoading ? (
              <div className="flex-1 flex justify-center"><M3CircularProgress size="small" /></div>
            ) : (
              <M3Button
                id="form-btn-save"
                onClick={handleSaveResident}
                variant="filled"
                className="flex-1 py-3"
                icon={<CheckCircle className="w-4 h-4" />}
              >
                {editId ? 'Save Changes' : 'Complete Setup'}
              </M3Button>
            )}
          </div>

          {/* Picture Picker Camera Dialog Modal */}
          <CameraGallerySimulator
            isOpen={isPhotoPickerOpen}
            onClose={() => setIsPhotoPickerOpen(false)}
            onSelectPhoto={(url) => {
              setInputPhoto(url);
              showToast('Avatar selected successfully!', 'success');
            }}
          />
        </div>
      )}

      {/* ========================================================
          SEARCH / HOMEPAGE MAIN DIRECTORY SCREEN
          ======================================================== */}
      {currentScreen === 'SEARCH' && (
        <div className="flex-1 flex flex-col bg-surface-bg select-none relative">
          
          {/* Main Top Header Navigation Bar */}
          <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30 m3-shadow-1">
            <div className="flex items-center gap-3">
              <button
                id="search-btn-drawer"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
                title="Navigation Drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
                  Mahaviram Apartment
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Udaipur • Directory</p>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full px-1.5 py-0.5">
                    <span className={`w-1 h-1 rounded-full ${dbStatus.connected ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[8px] text-slate-500 font-mono font-bold uppercase">{dbStatus.connected ? 'Live DB' : 'Sandbox'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick self-profile shortcut if logged in */}
            {loggedInUser && (
              <button
                onClick={() => {
                  setSelectedResident(loggedInUser);
                  setCurrentScreen('RESIDENT_PROFILE');
                }}
                className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden"
              >
                <img 
                  src={loggedInUser.photoUrl} 
                  alt={loggedInUser.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            )}
          </div>

          {/* Main Body Grid */}
          <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
            
            {/* Quick banner summary card */}
            <div className="bg-primary text-white p-5 rounded-2xl m3-shadow-2 relative overflow-hidden flex flex-col gap-2">
              <div className="absolute -right-6 -bottom-6 text-white/5">
                <Building2 className="w-28 h-28" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-primary-light uppercase">MAHAVIRAM SOCIETY HUB</span>
              <h3 className="font-display font-black text-lg">Members Directory</h3>
              <p className="text-xs text-primary-light leading-relaxed">
                Search verified residents, flats numbers, and key committee leads instantly below.
              </p>
            </div>

            {/* Search Settings Card */}
            <M3Card variant="elevated" className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent/20 text-accent rounded-lg">
                  <Search className="w-4 h-4" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800">Advanced Directory Search</h4>
              </div>

              {/* Selector Search By Dropdown */}
              <M3Dropdown
                id="search-by-dropdown"
                label="Search Criteria"
                options={['Name', 'Flat Number', 'Mobile Number']}
                selected={searchBy}
                onSelect={(opt) => setSearchBy(opt as SearchByOption)}
              />

              {/* Search text query field */}
              <M3TextField
                id="search-input"
                label={`Enter ${searchBy}`}
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  searchBy === 'Name' ? 'e.g. Rahul' :
                  searchBy === 'Flat Number' ? 'e.g. A-203' : 'e.g. 98290'
                }
                trailingIcon={searchQuery ? (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}>
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                ) : null}
              />

              {isLoading ? (
                <M3CircularProgress />
              ) : (
                <M3Button
                  id="search-btn-submit"
                  onClick={() => handleSearch()}
                  variant="filled"
                  icon={<Search className="w-4 h-4" />}
                >
                  Search Residents
                </M3Button>
              )}
            </M3Card>

            {/* SEARCH RESULTS LISTING */}
            {hasSearched && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span>Search Matches ({searchResults.length})</span>
                  {searchResults.length > 0 && <span className="text-[10px] text-primary capitalize font-semibold font-sans">Tap item to view</span>}
                </h4>

                {searchResults.length === 0 ? (
                  /* No Resident Found - Beautiful Empty State */
                  <div className="text-center py-8 px-4 bg-white rounded-2xl border border-slate-200 m3-shadow-1 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-sm text-slate-800">No resident found</h5>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        We couldn't find any residents matching "{searchQuery}" under {searchBy}. Try broadening your search.
                      </p>
                    </div>
                    <M3Button
                      id="search-again-btn"
                      variant="tonal"
                      onClick={() => { setSearchQuery(''); setHasSearched(false); }}
                      className="text-xs py-2 px-4"
                    >
                      Clear Search & Browse
                    </M3Button>
                  </div>
                ) : (
                  /* Results cards list */
                  <div className="flex flex-col gap-3">
                    {searchResults.map((resident) => (
                      <motion.div
                        key={resident.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <M3Card 
                          onClick={() => {
                            setSelectedResident(resident);
                            setCurrentScreen('RESIDENT_PROFILE');
                          }}
                          variant="outlined"
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                              <img 
                                src={resident.photoUrl} 
                                alt={resident.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="text-left">
                              <h5 className="font-display font-bold text-sm text-slate-800 leading-snug">{resident.name}</h5>
                              <p className="text-xs font-mono font-medium text-primary flex items-center gap-1 mt-0.5">
                                <span className="px-1.5 py-0.5 bg-primary/10 rounded-md font-bold">{resident.flatNumber}</span>
                                <span className="text-slate-400 font-sans">•</span>
                                <span className="text-slate-500 font-sans font-normal">{resident.mobile}</span>
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </M3Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DIRECTORY BROWSE FOR BETTER UX BEFORE SEARCH */}
            {!hasSearched && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Quick Resident Directory
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">Total: {residents.length}</span>
                </div>

                <div className="flex flex-col gap-3">
                  {residents.slice(0, 4).map((resident) => (
                    <M3Card
                      key={resident.id}
                      onClick={() => {
                        setSelectedResident(resident);
                        setCurrentScreen('RESIDENT_PROFILE');
                      }}
                      variant="outlined"
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                          <img 
                            src={resident.photoUrl} 
                            alt={resident.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-left">
                          <h5 className="font-display font-bold text-sm text-slate-800 leading-snug">{resident.name}</h5>
                          <p className="text-xs font-mono font-medium text-primary flex items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-primary/10 rounded-md font-bold">{resident.flatNumber}</span>
                            <span className="text-slate-400 font-sans">•</span>
                            <span className="text-slate-500 font-sans font-normal">{resident.mobile}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </M3Card>
                  ))}

                  {residents.length > 4 && (
                    <p className="text-center text-[10px] text-slate-400 font-medium italic">
                      + {residents.length - 4} more residents. Use Search bar above to find specific members.
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* NAV DRAWER PANEL SLIDE-IN (Material 3 style) */}
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute inset-0 bg-slate-950 z-40 rounded-[30px]"
                />

                {/* Left Panel Menu Drawer */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="absolute left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col justify-between py-6 rounded-l-[30px]"
                >
                  <div className="flex flex-col gap-6">
                    {/* Drawer Profile Header Section */}
                    <div className="px-6 pb-6 border-b border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden shadow-sm">
                          {loggedInUser ? (
                            <img 
                              src={loggedInUser.photoUrl} 
                              alt={loggedInUser.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          Active User
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-base text-slate-900 leading-tight">
                          {loggedInUser ? loggedInUser.name : 'Guest User'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {loggedInUser ? `Flat ${loggedInUser.flatNumber} • ${loggedInUser.mobile}` : 'Udaipur Society Directory'}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Drawer Menu items */}
                    <nav className="flex flex-col gap-1 px-3">
                      <button
                        onClick={() => { setCurrentScreen('SEARCH'); setIsDrawerOpen(false); }}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                          currentScreen === 'SEARCH' 
                            ? 'bg-primary-light text-primary-dark' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-4.5 h-4.5" />
                        <span>Society Directory</span>
                      </button>

                      <button
                        id="drawer-btn-edit-profile"
                        onClick={() => {
                          if (loggedInUser) {
                            prepareFormForEditing(loggedInUser);
                          } else {
                            showToast('Please Sign Up first to edit profile', 'error');
                          }
                          setIsDrawerOpen(false);
                        }}
                        className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <Edit className="w-4.5 h-4.5 text-slate-500" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        id="drawer-btn-contact"
                        onClick={() => { setCurrentScreen('CONTACT_US'); setIsDrawerOpen(false); }}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                          currentScreen === 'CONTACT_US' 
                            ? 'bg-primary-light text-primary-dark' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin className="w-4.5 h-4.5 text-slate-500" />
                        <span>Contact Us</span>
                      </button>

                      <div className="border-t border-slate-100 my-3 pt-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 block mb-2">FUTURE EXPANSIONS</span>
                        {[
                          { name: 'Visitor Management', icon: <Compass className="w-4 h-4" /> },
                          { name: 'Complaints Ledger', icon: <MessageSquare className="w-4 h-4" /> },
                          { name: 'Society Notices', icon: <Bell className="w-4 h-4" /> },
                          { name: 'Maintenance Pay', icon: <Shield className="w-4 h-4" /> },
                          { name: 'Events Calendar', icon: <Calendar className="w-4 h-4" /> },
                        ].map((item, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between px-4 py-2.5 opacity-50 cursor-not-allowed text-slate-500 select-none"
                            title="Feature locked for expansion"
                          >
                            <div className="flex items-center gap-3 text-xs font-semibold">
                              {item.icon}
                              <span>{item.name}</span>
                            </div>
                            <Lock className="w-3 h-3 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </nav>
                  </div>

                  {/* Drawer Database Status and Logout Action Footer */}
                  <div className="px-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    {/* Database status block in Drawer */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">DATABASE ENGINE</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${dbStatus.connected ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                          {dbStatus.connected ? 'Live MongoDB' : 'Local Fallback'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug font-medium">
                        {dbStatus.statusMessage}
                      </p>
                      {!dbStatus.connected && (
                        <p className="text-[8px] text-slate-400 leading-normal">
                          Set the <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-700">MONGODB_URI</code> secret key to link MongoDB Atlas.
                        </p>
                      )}
                    </div>

                    <button
                      id="drawer-btn-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out Account
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* ========================================================
          RESIDENT PROFILE DETAIL SCREEN
          ======================================================== */}
      {currentScreen === 'RESIDENT_PROFILE' && selectedResident && (
        <div className="flex-1 flex flex-col bg-surface-bg relative">
          
          {/* Header background with solid accent */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between text-white sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentScreen('SEARCH')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-display font-bold text-sm">Resident Profile</span>
            </div>

            {/* Quick edit if it is their own profile, or let anyone edit for high usability sandbox */}
            <button
              id="profile-btn-edit"
              onClick={() => prepareFormForEditing(selectedResident)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="flex-grow p-6 flex flex-col overflow-y-auto">
            
            {/* Top User Header info */}
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="w-28 h-28 rounded-full border-4 border-white m3-shadow-2 overflow-hidden bg-slate-100 shadow-lg">
                <img 
                  src={selectedResident.photoUrl} 
                  alt={selectedResident.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="font-display font-black text-xl text-slate-900 tracking-tight">{selectedResident.name}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-primary-light text-primary-dark font-black text-xs rounded-full m3-shadow-1">
                  Flat No: {selectedResident.flatNumber}
                </span>
              </div>
            </div>

            {/* Main Contact Metadata Cards */}
            <div className="flex flex-col gap-3 mb-6">
              <M3Card variant="outlined" className="flex items-center gap-4 py-3.5 px-4 bg-white">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">Mobile Number</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 font-mono select-all">{selectedResident.mobile}</p>
                </div>
                <a 
                  href={`tel:${selectedResident.mobile}`}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors border border-slate-200"
                  title="Make direct phone call"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </M3Card>

              <M3Card variant="outlined" className="flex items-center gap-4 py-3.5 px-4 bg-white">
                <div className="p-2 bg-secondary/10 text-secondary-dark rounded-xl">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">Email Address</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 select-all">{selectedResident.email || 'Not specified'}</p>
                </div>
                {selectedResident.email && (
                  <a 
                    href={`mailto:${selectedResident.email}`}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors border border-slate-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </M3Card>

              <M3Card variant="outlined" className="flex items-start gap-4 py-3.5 px-4 bg-white">
                <div className="p-2 bg-accent/10 text-accent rounded-xl mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase text-slate-400">Detailed Address</span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 select-all">{selectedResident.address}</p>
                </div>
              </M3Card>
            </div>

            {/* FAMILY MEMBERS LISTINGS */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-display font-black text-sm text-slate-800 uppercase tracking-wider mb-3">
                Family Members ({selectedResident.familyMembers.length})
              </h4>

              {selectedResident.familyMembers.length === 0 ? (
                <div className="text-center py-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">No registered family members for this flat directory.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedResident.familyMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="bg-white border border-slate-100 px-4 py-3.5 rounded-2xl flex items-center justify-between m3-shadow-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border">
                          {member.relationship.slice(0, 1)}
                        </div>
                        <div className="text-left">
                          <h6 className="text-xs font-bold text-slate-800 leading-none">{member.name}</h6>
                          <span className="inline-block mt-0.5 text-[9px] text-slate-400 uppercase font-black tracking-widest">{member.relationship}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">Co-Resident</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          CONTACT US SCREEN
          ======================================================== */}
      {currentScreen === 'CONTACT_US' && (
        <div className="flex-1 flex flex-col bg-surface-bg select-none">
          
          {/* Header navigation */}
          <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30 m3-shadow-1">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentScreen('SEARCH')}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-display font-bold text-sm text-slate-700">Contact Us</span>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Main title */}
            <div>
              <h2 className="font-display font-black text-xl text-slate-900 tracking-tight">Mahaviram Apartment</h2>
              <p className="text-xs text-slate-500 mt-1">Udaipur Society Administration & Security Hub</p>
            </div>

            {/* Details and placeholders */}
            <div className="flex flex-col gap-3">
              <M3Card variant="outlined" className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase text-slate-400">Society Location</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                    Mahaviram Apartment, Opp. Shubh Labh Complex, Sector 14, Udaipur, Rajasthan, India - 313001.
                  </p>
                </div>
              </M3Card>

              <M3Card variant="outlined" className="flex items-start gap-3.5">
                <PhoneCall className="w-5 h-5 text-secondary mt-0.5" />
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase text-slate-400">Security / Admin Phone</span>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed mt-1">
                    +91 94140 12345 (Administration President)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    +91 294 2481055 (Security Gate Checkpoint)
                  </p>
                </div>
              </M3Card>

              <M3Card variant="outlined" className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase text-slate-400">Official Society Email</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                    contact@mahaviramapartment.com
                  </p>
                </div>
              </M3Card>
            </div>

            {/* Custom high-fidelity interactive map representation drawing */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">GPS MAP LOCATOR</span>
              
              <div className="w-full h-52 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative flex flex-col justify-between p-4 m3-shadow-1">
                {/* Simulated GPS Navigation Screen drawing */}
                <div className="absolute inset-0 bg-sky-950/20 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[size:20px_20px]" />
                
                {/* Decorative Roads */}
                <div className="absolute h-6 bg-slate-800/60 top-1/3 left-0 right-0 -rotate-2 transform z-0" />
                <div className="absolute w-6 bg-slate-800/60 left-1/2 top-0 bottom-0 rotate-12 transform z-0" />

                {/* Satellite Landmark Marker */}
                <div className="absolute left-[54%] top-[34%] z-10 flex flex-col items-center">
                  <div className="animate-bounce">
                    <MapPin className="w-8 h-8 text-rose-500 fill-rose-500" />
                  </div>
                  <div className="w-2.5 h-1 bg-black/40 rounded-full blur-[1px]" />
                </div>

                {/* Lake Fatehsagar/Pichola representation label */}
                <div className="absolute right-4 bottom-4 px-2 py-1 bg-sky-500/15 border border-sky-400/20 text-sky-400 rounded-md text-[9px] font-bold z-10 uppercase tracking-wider">
                  Udaipur Sector 14
                </div>

                {/* Header label in Map */}
                <div className="z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5 border self-start">
                  <Map className="w-3.5 h-3.5 text-primary" />
                  <span>Map Grounding Active</span>
                </div>

                {/* Footer labels */}
                <div className="z-10 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800/60">
                    24.5854° N, 73.7125° E
                  </span>
                  
                  <a 
                    href="https://maps.google.com/?q=Udaipur+Rajasthan" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-2 py-1 bg-primary text-white font-bold text-[9px] rounded-md flex items-center gap-1 uppercase tracking-wider hover:bg-primary-dark transition-all"
                  >
                    Open <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </DeviceFrame>
  );
}
