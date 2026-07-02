/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Resident } from '../types';

export const SEED_RESIDENTS: Resident[] = [
  {
    id: 'res-1',
    name: 'Rahul Jain',
    mobile: '9829012345',
    flatNumber: 'A-203',
    email: 'rahul.jain@example.com',
    address: 'Mahaviram Apartment, Flat A-203, Udaipur, Rajasthan, 313001',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    familyMembers: [
      { id: 'fm-1-1', relationship: 'Wife', name: 'Pooja Jain' },
      { id: 'fm-1-2', relationship: 'Son', name: 'Aryan Jain' },
      { id: 'fm-1-3', relationship: 'Daughter', name: 'Riya Jain' }
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'res-2',
    name: 'Mahavir Singh',
    mobile: '9414056789',
    flatNumber: 'B-105',
    email: 'mahavir.singh@example.com',
    address: 'Mahaviram Apartment, Flat B-105, Udaipur, Rajasthan, 313001',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    familyMembers: [
      { id: 'fm-2-1', relationship: 'Wife', name: 'Sita Devi' },
      { id: 'fm-2-2', relationship: 'Son', name: 'Rahul Singh' },
      { id: 'fm-2-3', relationship: 'Daughter-in-law', name: 'Preeti Singh' }
    ],
    createdAt: '2026-01-16T11:30:00Z',
    updatedAt: '2026-01-16T11:30:00Z'
  },
  {
    id: 'res-3',
    name: 'Priya Mehta',
    mobile: '9928011223',
    flatNumber: 'A-401',
    email: 'priya.mehta@example.com',
    address: 'Mahaviram Apartment, Flat A-401, Udaipur, Rajasthan, 313001',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    familyMembers: [
      { id: 'fm-3-1', relationship: 'Husband', name: 'Sanjay Mehta' },
      { id: 'fm-3-2', relationship: 'Son', name: 'Kabir Mehta' }
    ],
    createdAt: '2026-01-18T09:15:00Z',
    updatedAt: '2026-01-18T09:15:00Z'
  },
  {
    id: 'res-4',
    name: 'Sanjay Sharma',
    mobile: '9887012345',
    flatNumber: 'C-302',
    email: 'sanjay.sharma@example.com',
    address: 'Mahaviram Apartment, Flat C-302, Udaipur, Rajasthan, 313001',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
    familyMembers: [
      { id: 'fm-4-1', relationship: 'Wife', name: 'Anita Sharma' },
      { id: 'fm-4-2', relationship: 'Mother', name: 'Kausalya Sharma' },
      { id: 'fm-4-3', relationship: 'Son', name: 'Harsh Sharma' }
    ],
    createdAt: '2026-02-01T14:20:00Z',
    updatedAt: '2026-02-01T14:20:00Z'
  },
  {
    id: 'res-5',
    name: 'Anita Gupta',
    mobile: '9460012345',
    flatNumber: 'B-304',
    email: 'anita.gupta@example.com',
    address: 'Mahaviram Apartment, Flat B-304, Udaipur, Rajasthan, 313001',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    familyMembers: [
      { id: 'fm-5-1', relationship: 'Husband', name: 'Ramesh Gupta' },
      { id: 'fm-5-2', relationship: 'Daughter', name: 'Sneha Gupta' },
      { id: 'fm-5-3', relationship: 'Son', name: 'Amit Gupta' }
    ],
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-05T08:00:00Z'
  },
  {
    id: 'res-6',
    name: 'Vikram Rathore',
    mobile: '9414112233',
    flatNumber: 'C-101',
    email: 'vikram.rathore@example.com',
    address: 'Mahaviram Apartment, Flat C-101, Udaipur, Rajasthan, 313001',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
    familyMembers: [
      { id: 'fm-6-1', relationship: 'Wife', name: 'Kiran Rathore' },
      { id: 'fm-6-2', relationship: 'Son', name: 'Yuvraj Rathore' }
    ],
    createdAt: '2026-02-10T16:45:00Z',
    updatedAt: '2026-02-10T16:45:00Z'
  }
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
];
