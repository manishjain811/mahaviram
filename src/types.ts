/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FamilyMember {
  id: string;
  relationship: string;
  name: string;
}

export interface Resident {
  id: string;
  name: string;
  mobile: string;
  flatNumber: string;
  email: string;
  address: string;
  photoUrl: string;
  familyMembers: FamilyMember[];
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean; // To distinguish user-created records from initial seed
}

export type SearchByOption = 'Name' | 'Flat Number' | 'Mobile Number';

export type Screen = 
  | 'GUEST_HOME' 
  | 'SIGN_IN' 
  | 'SIGN_UP' 
  | 'SEARCH' 
  | 'RESIDENT_PROFILE' 
  | 'EDIT_PROFILE' 
  | 'CONTACT_US'
  | 'FUTURE_MODULES';
