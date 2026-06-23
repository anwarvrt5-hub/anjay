/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  MEMBER = 'MEMBER',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum UidRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  generateCount: number;
  rareFound: number;
  joinDate: string;
  registrationKeyUsed?: string;
  dailyLimit: number;
  generatedToday: number;
}

export interface UidRecord {
  id: string;
  uid: string;
  email: string;
  password: string;
  rarity: UidRarity;
  generatedBy: string;
  timestamp: string;
}

export interface RegistrationKey {
  key: string;
  status: 'ACTIVE' | 'USED';
  createdBy: string;
  usedBy?: string;
  type: UserRole.PREMIUM | UserRole.ADMIN;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  username: string;
  details: string;
}

export interface AppStats {
  totalUsers: number;
  totalPremiumUsers: number;
  totalMemberUsers: number;
  totalAdminUsers: number;
  totalOwnerUsers: number;
  totalGenerated: number;
  rareFound: number;
  legendFound: number;
  mythicFound: number;
}
