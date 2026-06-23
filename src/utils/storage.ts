/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole, UidRecord, RegistrationKey, SystemLog, AppStats } from '../types';
import { generateSeedHistory } from './generator';

const STORAGE_KEYS = {
  USERS: 'kw_users',
  KEYS: 'kw_keys',
  LOGS: 'kw_logs',
  UIDS: 'kw_uids',
  LOGGED_IN: 'kw_current_user',
};

// Initial default keys
const DEFAULT_KEYS: RegistrationKey[] = [
  { key: 'KWR-PREM-8891', status: 'ACTIVE', type: UserRole.PREMIUM, createdBy: 'SYSTEM', createdAt: new Date().toISOString() },
  { key: 'KWR-PREM-2231', status: 'ACTIVE', type: UserRole.PREMIUM, createdBy: 'SYSTEM', createdAt: new Date().toISOString() },
  { key: 'KWR-ADMN-9921', status: 'ACTIVE', type: UserRole.ADMIN, createdBy: 'SYSTEM', createdAt: new Date().toISOString() },
  { key: 'KWR-X92L-61PQ', status: 'ACTIVE', type: UserRole.PREMIUM, createdBy: 'admin', createdAt: new Date().toISOString() },
];

export const INITIAL_USERS: User[] = [
  { id: '1', username: 'ANWAR', role: UserRole.OWNER, generateCount: 1542, rareFound: 32, joinDate: '2026', dailyLimit: -1, generatedToday: 0 },
  { id: '2', username: 'kingwar', role: UserRole.ADMIN, generateCount: 881, rareFound: 14, joinDate: '2026', dailyLimit: -1, generatedToday: 0 },
  { id: '3', username: 'premium_user', role: UserRole.PREMIUM, generateCount: 421, rareFound: 8, joinDate: '2026', dailyLimit: -1, generatedToday: 0 },
  { id: '4', username: 'member_user', role: UserRole.MEMBER, generateCount: 12, rareFound: 0, joinDate: '2026', dailyLimit: 50, generatedToday: 0 },
];

// Seed Logs
const DEFAULT_LOGS: SystemLog[] = [
  { id: 'l1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), action: 'LOGIN', username: 'ANWAR', details: 'ANWAR successfully authenticated as OWNER via Override Hook.' },
  { id: 'l2', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), action: 'SYSTEM_BOOT', username: 'SYSTEM', details: 'KINGWAR UID GENERATOR v3 online.' },
  { id: 'l3', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), action: 'ROLE_UPDATE', username: 'kingwar', details: 'Promoted user premium_user to PREMIUM.' },
];

// Retrieve or Seed stored state
export function getLocalStorageState() {
  if (typeof window === 'undefined') {
    return { users: [], keys: [], logs: [], uids: [], currentUser: null };
  }

  // 1. Users
  let usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  let users: User[] = [];
  if (!usersStr) {
    users = [...INITIAL_USERS];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } else {
    users = JSON.parse(usersStr);
  }

  // 2. Keys
  let keysStr = localStorage.getItem(STORAGE_KEYS.KEYS);
  let keys: RegistrationKey[] = [];
  if (!keysStr) {
    keys = [...DEFAULT_KEYS];
    localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(keys));
  } else {
    keys = JSON.parse(keysStr);
  }

  // 3. Logs
  let logsStr = localStorage.getItem(STORAGE_KEYS.LOGS);
  let logs: SystemLog[] = [];
  if (!logsStr) {
    logs = [...DEFAULT_LOGS];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } else {
    logs = JSON.parse(logsStr);
  }

  // 4. UIDs
  let uidsStr = localStorage.getItem(STORAGE_KEYS.UIDS);
  let uids: UidRecord[] = [];
  if (!uidsStr) {
    uids = generateSeedHistory(25);
    localStorage.setItem(STORAGE_KEYS.UIDS, JSON.stringify(uids));
  } else {
    uids = JSON.parse(uidsStr);
  }

  // 5. Current User
  let currentStr = localStorage.getItem(STORAGE_KEYS.LOGGED_IN);
  let currentUser: User | null = currentStr ? JSON.parse(currentStr) : null;

  return { users, keys, logs, uids, currentUser };
}

export function saveStateToStorage(state: {
  users?: User[];
  keys?: RegistrationKey[];
  logs?: SystemLog[];
  uids?: UidRecord[];
  currentUser?: User | null;
}) {
  if (typeof window === 'undefined') return;

  if (state.users !== undefined) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
  }
  if (state.keys !== undefined) {
    localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(state.keys));
  }
  if (state.logs !== undefined) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
  }
  if (state.uids !== undefined) {
    localStorage.setItem(STORAGE_KEYS.UIDS, JSON.stringify(state.uids));
  }
  if (state.currentUser !== undefined) {
    if (state.currentUser === null) {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
    } else {
      localStorage.setItem(STORAGE_KEYS.LOGGED_IN, JSON.stringify(state.currentUser));
    }
  }
}

export function addSystemLog(action: string, username: string, details: string, currentLogs: SystemLog[]): SystemLog[] {
  const newLog: SystemLog = {
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    username,
    details
  };
  const updated = [newLog, ...currentLogs];
  saveStateToStorage({ logs: updated });
  return updated;
}

// Calculate runtime stats from dynamic storage
export function computeStats(users: User[], uids: UidRecord[]): AppStats {
  const totalUsers = users.length;
  const totalPremiumUsers = users.filter(u => u.role === UserRole.PREMIUM).length;
  const totalMemberUsers = users.filter(u => u.role === UserRole.MEMBER).length;
  const totalAdminUsers = users.filter(u => u.role === UserRole.ADMIN).length;
  const totalOwnerUsers = users.filter(u => u.role === UserRole.OWNER).length;

  const totalGenerated = 124621 + uids.length; // Baseline + simulator increments
  
  // Calculate specific occurrences of high ranks in simulated database
  const rareFound = 328 + uids.filter(u => u.rarity !== 'COMMON').length;
  const legendFound = uids.filter(u => u.rarity === 'LEGENDARY').length;
  const mythicFound = uids.filter(u => u.rarity === 'MYTHIC').length;

  return {
    totalUsers,
    totalPremiumUsers,
    totalMemberUsers,
    totalAdminUsers,
    totalOwnerUsers,
    totalGenerated,
    rareFound,
    legendFound,
    mythicFound
  };
}
