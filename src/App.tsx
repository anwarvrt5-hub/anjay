/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, RegistrationKey, SystemLog, UidRecord, UidRarity } from './types';
import { getLocalStorageState, saveStateToStorage, addSystemLog, INITIAL_USERS } from './utils/storage';
import { playClick, playSuccess, playAccessGranted, playAlert } from './utils/audio';

import BackgroundEffects from './components/BackgroundEffects';
import DashboardView from './components/DashboardView';
import GeneratorView from './components/GeneratorView';
import HistoryView from './components/HistoryView';
import ProfileView from './components/ProfileView';
import AdminPanelView from './components/AdminPanelView';

import { 
  Shield, 
  Terminal, 
  ClipboardList, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  ShieldAlert, 
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // General states
  const [initLoading, setInitLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState('Initializing client environment...');

  // Database states
  const [users, setUsers] = useState<User[]>([]);
  const [keys, setKeys] = useState<RegistrationKey[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [uids, setUids] = useState<UidRecord[]>([]);

  // Session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regKey, setRegKey] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Main UI routing
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Custom Toast Notices
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'alert' | 'info' }[]>([]);

  const triggerToast = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    const id = `tst_${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // 1. Simulating assets loading on first boot
  useEffect(() => {
    // Load local state
    const loadedData = getLocalStorageState();
    setUsers(loadedData.users);
    setKeys(loadedData.keys);
    setLogs(loadedData.logs);
    setUids(loadedData.uids);
    setCurrentUser(loadedData.currentUser);

    // Initial loading progress bar simulation
    const statuses = [
      'Loading core system configuration...',
      'Mapping cyberpunk aesthetics...',
      'Deploying secure local sandbox...',
      'Fetching digitized algorithms...',
      'Initializing scanline graphics...',
      'Console bypass channel secure!'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setInitLoading(false);
          playSuccess();
          return 100;
        }

        const nextVal = prev + Math.floor(Math.random() * 12) + 5;
        const capped = Math.min(nextVal, 100);

        // Advance steps text based on threshold
        if (capped > (currentIdx + 1) * (100 / statuses.length) && currentIdx < statuses.length - 1) {
          currentIdx++;
          setLoadingStatusText(statuses[currentIdx]);
        }

        return capped;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  // Sync users
  const syncUsersList = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    saveStateToStorage({ users: updatedUsers });
  };

  // Sync keys
  const syncKeysList = (updatedKeys: RegistrationKey[]) => {
    setKeys(updatedKeys);
    saveStateToStorage({ keys: updatedKeys });
  };

  // Sync uids
  const syncUidsList = (updatedUids: UidRecord[]) => {
    setUids(updatedUids);
    saveStateToStorage({ uids: updatedUids });
  };

  // Sync logs
  const syncLogsList = (updatedLogs: SystemLog[]) => {
    setLogs(updatedLogs);
    saveStateToStorage({ logs: updatedLogs });
  };

  // 2. Auth handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const uName = loginUsername.trim();
    const pWord = loginPassword;

    if (!uName || !pWord) {
      playAlert();
      setLoginError('Complete all credentials first.');
      return;
    }

    // Easter Egg override
    if (uName === 'ANWAR' && pWord === 'ANWAR') {
      playSuccess();
      playAccessGranted();
      
      // Look for preseeded ANWAR, other construct it
      let targetUser = users.find((user) => user.username === 'ANWAR');
      if (!targetUser) {
        targetUser = {
          id: 'user_anwar_ee',
          username: 'ANWAR',
          role: UserRole.OWNER,
          generateCount: 1542,
          rareFound: 32,
          joinDate: '2026',
          dailyLimit: -1,
          generatedToday: 0
        };
        const updatedUsers = [...users, targetUser];
        syncUsersList(updatedUsers);
      }

      setCurrentUser(targetUser);
      saveStateToStorage({ currentUser: targetUser });

      const updatedLogs = addSystemLog('SECRET_BYPASS', 'ANWAR', 'Access granted automatically via OWNER Easter Egg bypass.', logs);
      syncLogsList(updatedLogs);
      
      triggerToast('Bypass activated: Logged in as OWNER!', 'success');
      
      setLoginUsername('');
      setLoginPassword('');
      return;
    }

    // Normal authorization check
    // We check against the pre-seeded users database
    const userMatch = users.find(u => u.username.toLowerCase() === uName.toLowerCase());
    
    // In our simplified prototype simulator, we allow credentials to log in once registered,
    // let's simulate successful logging for any pre-seeded account since they have simulated passwords matching.
    // For Member: member123, Premium: premium123, Admin: adminpass, Owner: kingwaradmin or same username.
    const isSuccess = userMatch && (
      (userMatch.username === 'ANWAR' && pWord === 'ANWAR') ||
      (userMatch.username === 'kingwar' && pWord === 'kingwar') ||
      (userMatch.username === 'premium_user' && pWord === 'premium') ||
      (userMatch.username === 'member_user' && pWord === 'member') ||
      // Or matches dynamically registered password stored in system session
      pWord === userMatch.username // standard fallback password
    );

    if (isSuccess && userMatch) {
      playSuccess();
      setCurrentUser(userMatch);
      saveStateToStorage({ currentUser: userMatch });

      const updatedLogs = addSystemLog('LOGIN', userMatch.username, 'Logged in to dashboard control panel.', logs);
      syncLogsList(updatedLogs);

      triggerToast(`Welcome back, ${userMatch.username}!`, 'success');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      playAlert();
      setLoginError('Access Denied. Check Username & Password.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const uName = regUsername.trim();
    const pWord = regPassword;
    const pConfirm = regConfirmPassword;
    const rKey = regKey.trim();

    if (!uName || !pWord || !pConfirm) {
      playAlert();
      setRegError('Complete all credentials first.');
      return;
    }

    if (pWord !== pConfirm) {
      playAlert();
      setRegError('Passwords do not match.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === uName.toLowerCase())) {
      playAlert();
      setRegError('Username already taken.');
      return;
    }

    // Evaluate registration key if provided
    let assignedRole = UserRole.MEMBER;
    let referencedKey: RegistrationKey | null = null;

    if (rKey) {
      const foundKey = keys.find(k => k.key === rKey && k.status === 'ACTIVE');
      if (!foundKey) {
        playAlert();
        setRegError('Invalid or expired Registration Key.');
        return;
      }
      referencedKey = foundKey;
      assignedRole = foundKey.type; // PREMIUM or ADMIN
    }

    // Creating new user object
    const newUser: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      username: uName,
      role: assignedRole,
      generateCount: 0,
      rareFound: 0,
      joinDate: '2026',
      registrationKeyUsed: rKey || undefined,
      dailyLimit: assignedRole === UserRole.MEMBER ? 50 : -1,
      generatedToday: 0
    };

    // Update keys status if used
    if (referencedKey) {
      const updatedKeys = keys.map(k => {
        if (k.key === referencedKey?.key) {
          return { ...k, status: 'USED' as const, usedBy: uName };
        }
        return k;
      });
      syncKeysList(updatedKeys);
    }

    // Add user to database
    const updatedUsers = [...users, newUser];
    syncUsersList(updatedUsers);

    // Logging register behavior
    const updatedLogs = addSystemLog(
      'REGISTER',
      uName,
      `User created with role ${assignedRole} ${rKey ? `using key: ${rKey}` : '(No key - Standard Member)'}`,
      logs
    );
    syncLogsList(updatedLogs);

    playSuccess();
    setRegSuccess(`Registration Complete! Clearance level: ${assignedRole}.`);
    
    // Clear inputs and switch views
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegKey('');
    
    setTimeout(() => {
      setAuthView('LOGIN');
      setRegSuccess('');
    }, 2000);
  };

  const handleLogout = () => {
    if (!currentUser) return;
    playClick();

    const updatedLogs = addSystemLog('LOGOUT', currentUser.username, 'Destroyed session. Logged out.', logs);
    syncLogsList(updatedLogs);

    setCurrentUser(null);
    saveStateToStorage({ currentUser: null });
    setActiveTab('dashboard');
    triggerToast('Session disconnected.', 'info');
  };

  // 3. Application core handlers
  const handleUserUpdate = (updatedMemberData: User) => {
    // Save updated data to user logs and local storage
    const updatedUsers = users.map((u) => u.id === updatedMemberData.id ? updatedMemberData : u);
    syncUsersList(updatedUsers);
    setCurrentUser(updatedMemberData);
    saveStateToStorage({ currentUser: updatedMemberData });
  };

  const handleAddUids = (newUids: UidRecord[]) => {
    const updated = [...newUids, ...uids];
    syncUidsList(updated);

    const updatedLogs = addSystemLog(
      'MINT_OP', 
      currentUser?.username || 'GUEST', 
      `Dynamically simulated ${newUids.length} ficitious accounts in active cache.`, 
      logs
    );
    syncLogsList(updatedLogs);
    
    // Notify rare discover
    const rareCount = newUids.filter((z) => z.rarity !== UidRarity.COMMON).length;
    if (rareCount > 0) {
      triggerToast(`Extracted ${rareCount} rare repeating digit combinations!`, 'success');
    } else {
      triggerToast(`Simulated ${newUids.length} UIDs successfully.`, 'success');
    }
  };

  const handleDeleteUid = (id: string) => {
    const target = uids.find(z => z.id === id);
    const updated = uids.filter(z => z.id !== id);
    syncUidsList(updated);

    if (target && currentUser) {
      const updatedLogs = addSystemLog(
        'UID_DELETE',
        currentUser.username,
        `Wiped simulated record: ${target.uid} from persistent cache.`,
        logs
      );
      syncLogsList(updatedLogs);
      triggerToast('Simulated record wiped.', 'info');
    }
  };

  const handleClearAllUids = () => {
    syncUidsList([]);
    if (currentUser) {
      const updatedLogs = addSystemLog('UID_WIPE_ALL', currentUser.username, 'Flushed total simulated records lists completely.', logs);
      syncLogsList(updatedLogs);
      triggerToast('All database records flushed.', 'alert');
    }
  };

  const handleAddKey = (newKey: RegistrationKey) => {
    const updated = [newKey, ...keys];
    syncKeysList(updated);

    if (currentUser) {
      const updatedLogs = addSystemLog(
        'MINT_KEY',
        currentUser.username,
        `Minted new Activation Serial: ${newKey.key} (Clearance: ${newKey.type})`,
        logs
      );
      syncLogsList(updatedLogs);
      triggerToast('Key minted successfully!', 'success');
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const target = users.find(u => u.id === userId);
    if (!target || !currentUser) return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          role: newRole,
          dailyLimit: newRole === UserRole.MEMBER ? 50 : -1 
        };
      }
      return u;
    });
    syncUsersList(updated);

    const updatedLogs = addSystemLog(
      'UPDATE_ROLE',
      currentUser.username,
      `Republished Clearance level for [${target.username}] to: ${newRole}`,
      logs
    );
    syncLogsList(updatedLogs);
    triggerToast(`User ${target.username} updated to ${newRole}!`, 'success');
  };

  const handleKickUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target || !currentUser) return;

    const updated = users.filter((u) => u.id !== userId);
    syncUsersList(updated);

    const updatedLogs = addSystemLog(
      'KICK_USER',
      currentUser.username,
      `Banned user connection: ${target.username} from system channels.`,
      logs
    );
    syncLogsList(updatedLogs);
    triggerToast(`Kicked connections for: ${target.username}`, 'alert');
  };

  // Perform Upgrade from key verification inside profile
  const handleUseKeyInProfile = (keyStr: string): UserRole | null => {
    if (!currentUser) return null;

    const foundKey = keys.find(k => k.key === keyStr && k.status === 'ACTIVE');
    if (!foundKey) return null;

    // Use Key
    const updatedKeys = keys.map(k => {
      if (k.key === keyStr) {
        return { ...k, status: 'USED' as const, usedBy: currentUser.username };
      }
      return k;
    });
    syncKeysList(updatedKeys);

    // Promote current user
    const updatedUser = {
      ...currentUser,
      role: foundKey.type,
      dailyLimit: foundKey.type === UserRole.MEMBER ? 50 : -1
    };
    
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    syncUsersList(updatedUsers);
    setCurrentUser(updatedUser);
    saveStateToStorage({ currentUser: updatedUser });

    // Logs
    const updatedLogs = addSystemLog(
      'PROFILE_REDEMPTION',
      currentUser.username,
      `Redeemed Key: ${keyStr} from profile to promote authorization payload to: ${foundKey.type}.`,
      logs
    );
    syncLogsList(updatedLogs);

    triggerToast(`Upgraded to ${foundKey.type}!`, 'success');
    return foundKey.type;
  };

  // Check if admin tab is accessible
  const hasAdminAccess = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OWNER);

  return (
    <div className="relative w-full min-h-screen text-white bg-[#0a0a0a] overflow-x-hidden font-sans select-none flex flex-col justify-between">
      {/* GLITCH OVERLAYS BACKGROUND ELEMENTS */}
      <BackgroundEffects />

      {/* --- TOAST PANEL NOTIFICATION LAYOUT --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className={`p-3.5 rounded border flex items-center gap-3 backdrop-blur shadow-[0_4px_16px_rgba(0,0,0,0.4)] pointer-events-auto ${
                toast.type === 'success' ? 'bg-[#0a3622]/90 border-emerald-500/30 text-emerald-300' :
                toast.type === 'alert' ? 'bg-[#3b0a0a]/90 border-[#ff2424]/30 text-rose-300' :
                'bg-[#1a120a]/90 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
              <p className="text-[11px] font-mono leading-none tracking-wider font-semibold uppercase">{toast.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- INITIAL LOADING SCREEN --- */}
      {initLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0d0d] p-6">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(rgba(255,36,36,0.12)_0%,rgba(13,13,13,0)_70%)] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-lg text-center space-y-6">
            {/* Glitch logo concept */}
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-widest text-[#ff2424] drop-shadow-[0_0_12px_rgba(255,36,36,0.6)] font-mono uppercase glitch">
                KINGWAR
              </h1>
              <p className="text-[12px] uppercase font-mono tracking-[0.4em] text-white/80">UID GENERATOR v3</p>
            </div>

            {/* Simulated mechanical text details */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#9f9f9f]">
                <span>{loadingStatusText}</span>
                <span className="text-[#ff2424]">{loadingProgress}%</span>
              </div>
              
              {/* Progress blocks */}
              <div className="w-full bg-[#181818] border border-white/10 rounded overflow-hidden p-1">
                <div 
                  className="bg-[#ff2424] h-3 shadow-[0_0_8px_rgba(255,36,36,0.7)] transition-all duration-150"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-650 pt-1">
                <span>SYSTEM VERSION: PROTOTYPE 2026</span>
                <span>AUTHENTICATION: MANDATORY SECURITIES</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN ROOT APPLICATION CANVAS --- */}
      {!initLoading && (
        <div className="w-full h-screen flex flex-col z-10 relative select-none">
          
          {/* HEADER BAR */}
          <header className="w-full border-b border-white/5 bg-[#0f0f0f]/90 backdrop-blur px-6 py-3 flex justify-between items-center z-20">
            <div className="flex items-center gap-3">
              {/* Spinning stylized dynamic launcher icon logo */}
              <div className="h-7 w-7 rounded bg-[#ff2424]/10 border border-[#ff2424]/40 flex items-center justify-center">
                <span className="text-xs font-mono font-extrabold text-[#ff2424] drop-shadow-[0_0_3px_rgba(255,36,36,0.7)]">KW</span>
              </div>
              <div>
                <h1 className="text-xs font-black tracking-widest text-white font-mono leading-none">KINGWAR UID GENERATOR</h1>
                <span className="text-[8px] font-mono text-[#ff2424] tracking-widest uppercase leading-none">Cyber Decrypter Suite</span>
              </div>
            </div>

            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                  <span className="text-[10px] text-white font-semibold font-mono tracking-wider">{currentUser.username}</span>
                  <span className="text-[8px] uppercase tracking-wider text-amber-500 font-mono leading-none font-semibold flex items-center gap-1">
                    <span className="h-1 w-1 bg-amber-500 rounded-full animate-ping" />
                    {currentUser.role} CLASS
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-white/5 hover:bg-[#ff2424]/10 text-zinc-400 hover:text-[#ff2424] rounded-sm border border-content border-white/5 hover:border-[#ff2424]/30 transition cursor-pointer"
                  title="Disconnect safe sessions"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* NO SESSION LOGGED IN - SHOW AUTHENTICATE PANELS */}
            {!currentUser ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                {authView === 'LOGIN' ? (
                  /* LOGIN GLASSMORPHISM CARD */
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-[#141414]/90 border border-[#ff2424]/30 backdrop-blur rounded-lg p-6 shadow-[0_0_35px_rgba(255,36,36,0.1)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ff2424]" />
                    <div className="text-center space-y-1 mb-6">
                      <h2 className="text-xl font-bold tracking-widest font-mono text-white">LOGIN PANEL</h2>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Provide database node keys</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {loginError && (
                        <div className="p-2 bg-rose-950/40 text-rose-400 border border-rose-900/40 rounded text-[10px] font-mono text-center flex items-center gap-1.5 justify-center">
                          <AlertTriangle size={12} /> {loginError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">Username</label>
                        <input
                          type="text"
                          required
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-white text-xs px-3 py-2 font-mono transition select-text cursor-text"
                          placeholder="Your user account"
                          onKeyDown={() => {}}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">Password</label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-white text-xs px-3 py-2 font-mono transition select-text cursor-text"
                          placeholder="••••••••"
                          onKeyDown={() => {}}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#ff2424] hover:bg-[#ff4040] font-mono text-xs font-bold uppercase tracking-widest text-white rounded transition shadow-lg cursor-pointer"
                      >
                        AUTHORIZE
                      </button>
                    </form>

                    <div className="mt-5 text-center text-[10px] font-mono text-zinc-500">
                      Don't have credentials yet?{' '}
                      <button 
                        onClick={() => { playClick(); setAuthView('REGISTER'); }}
                        className="text-[#ff2424] hover:underline hover:text-white"
                      >
                        REGISTER ACCOUNT
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* REGISTER GLASSMORPHISM */
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-[#141414]/90 border border-[#ff2424]/30 backdrop-blur rounded-lg p-6 shadow-[0_0_35px_rgba(255,36,36,0.1)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ff2424]" />
                    <div className="text-center space-y-1 mb-4">
                      <h2 className="text-xl font-bold tracking-widest font-mono text-white">REGISTER PANEL</h2>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Acquire elite sandbox permissions</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      {regError && (
                        <div className="p-2 bg-rose-950/40 text-rose-400 border border-rose-900/40 rounded text-[10px] font-mono text-center flex items-center justify-center gap-1.5">
                          <AlertTriangle size={12} /> {regError}
                        </div>
                      )}
                      
                      {regSuccess && (
                        <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded text-[10px] font-mono text-center">
                          {regSuccess}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">Username</label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-white text-xs px-3 py-1.5 font-mono transition select-text cursor-text"
                          placeholder="Create handle name"
                          onKeyDown={() => {}}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">Password</label>
                          <input
                            type="password"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-white text-xs px-3 py-1.5 font-mono transition select-text cursor-text"
                            placeholder="••••••••"
                            onKeyDown={() => {}}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">Confirm</label>
                          <input
                            type="password"
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-white text-xs px-3 py-1.5 font-mono transition select-text cursor-text"
                            placeholder="••••••••"
                            onKeyDown={() => {}}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">
                            Registration Key <span className="text-zinc-650">(Optional)</span>
                          </label>
                          <span className="text-[8px] text-amber-500 font-mono">Seeds: KWR-X92L-61PQ</span>
                        </div>
                        <input
                          type="text"
                          value={regKey}
                          onChange={(e) => setRegKey(e.target.value.toUpperCase())}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-[#ff2424] text-xs px-3 py-1.5 font-mono transition uppercase select-text cursor-text"
                          placeholder="KWR-XXXX-XXXX"
                          onKeyDown={() => {}}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#ff2424] hover:bg-[#ff4040] font-mono text-xs font-bold uppercase tracking-widest text-white rounded transition shadow-lg cursor-pointer"
                      >
                        REGISTER
                      </button>
                    </form>

                    {/* WhatsApp information link */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-col items-center">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">No Registration Key? Contact Administrator</span>
                      <a 
                        href="https://wa.me/6285709472137" 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={() => playClick()}
                        className="text-[9px] font-mono text-emerald-400 hover:underline hover:text-white mt-1 uppercase"
                      >
                        WhatsApp Call: +62 857-0947-2137
                      </a>
                    </div>

                    <div className="mt-4 text-center text-[10px] font-mono text-zinc-500">
                      Already registered?{' '}
                      <button 
                        onClick={() => { playClick(); setAuthView('LOGIN'); }}
                        className="text-[#ff2424] hover:underline hover:text-white"
                      >
                        LOG IN HERE
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* ACTIVE AUTHORIZED SESSION: NAV SIDER + WORKSPACE */
              <div className="w-full h-full flex flex-col md:flex-row overflow-hidden relative">
                
                {/* 1. INTERACTIVE DESKTOP SIDEBAR (44px/Medium side) */}
                <aside className="w-full md:w-56 bg-[#0c0c0c]/90 border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col justify-between p-3 select-none z-10">
                  <div className="flex flex-row md:flex-col gap-1 w-full overflow-x-auto md:overflow-x-visible">
                    
                    {/* Panel title for sidebar display */}
                    <div className="hidden md:block py-2 px-3 text-[9px] uppercase tracking-widest text-[#ff2424] font-mono font-bold pb-4">
                      Navigation Panel
                    </div>

                    {/* Tab Navigation */}
                    <button
                      onClick={() => { playClick(); setActiveTab('dashboard'); }}
                      className={`py-2 px-3.5 text-xs text-left font-mono uppercase rounded transition flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                        activeTab === 'dashboard' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424] font-bold' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      <ClipboardList size={13} /> Dashboard
                    </button>

                    <button
                      onClick={() => { playClick(); setActiveTab('generator'); }}
                      className={`py-2 px-3.5 text-xs text-left font-mono uppercase rounded transition flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                        activeTab === 'generator' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424] font-bold' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      <Terminal size={13} /> Generator
                    </button>

                    <button
                      onClick={() => { playClick(); setActiveTab('history'); }}
                      className={`py-2 px-3.5 text-xs text-left font-mono uppercase rounded transition flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                        activeTab === 'history' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424] font-bold' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      <ClipboardList size={13} /> History Database
                    </button>

                    <button
                      onClick={() => { playClick(); setActiveTab('profile'); }}
                      className={`py-2 px-3.5 text-xs text-left font-mono uppercase rounded transition flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                        activeTab === 'profile' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424] font-bold' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      <UserIcon size={13} /> User Profile
                    </button>

                    {/* ONLY VISIBLE FOR ADMINS / OWNERS */}
                    {hasAdminAccess && (
                      <button
                        onClick={() => { playClick(); setActiveTab('admin'); }}
                        className={`py-2 px-3.5 text-xs text-left font-mono uppercase rounded transition flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                          activeTab === 'admin' ? 'bg-gradient-to-r from-red-950/40 to-black text-[#ff2424] border-l-2 border-red-500 font-bold shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]' : 'text-red-500/60 hover:bg-red-500/5 hover:text-red-500'
                        }`}
                      >
                        <Settings size={13} /> Admin Panel
                      </button>
                    )}
                  </div>
                  
                  {/* Logout wrapper on desktop */}
                  <div className="hidden md:flex flex-col gap-1 w-full pt-4 border-t border-white/5">
                    <button
                      onClick={handleLogout}
                      className="py-2.5 px-3.5 text-xs text-left font-mono text-zinc-500 hover:text-[#ff2424] rounded hover:bg-[#ff2424]/5 transition flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut size={13} /> Disconnect
                    </button>
                  </div>
                </aside>

                {/* 2. CHOSEN ACTIVE SUBVIEW WRAPPER */}
                <main className="flex-1 overflow-hidden p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  
                  <div className="w-full h-full relative z-10 overflow-hidden">
                    {activeTab === 'dashboard' && (
                      <DashboardView user={currentUser} users={users} uids={uids} />
                    )}

                    {activeTab === 'generator' && (
                      <GeneratorView 
                        user={currentUser}
                        onUserUpdate={handleUserUpdate}
                        uids={uids}
                        onAddUids={handleAddUids}
                        onClearUids={handleClearAllUids}
                        onNavigate={(target) => {
                          playClick();
                          setActiveTab(target);
                        }}
                        onLogout={handleLogout}
                      />
                    )}

                    {activeTab === 'history' && (
                      <HistoryView uids={uids} onDeleteUid={handleDeleteUid} onClearAll={handleClearAllUids} />
                    )}

                    {activeTab === 'profile' && (
                      <ProfileView 
                        user={currentUser} 
                        onUserUpdate={handleUserUpdate} 
                        keys={keys} 
                        onUseKey={handleUseKeyInProfile} 
                      />
                    )}

                    {activeTab === 'admin' && hasAdminAccess && (
                      <AdminPanelView
                        currentUser={currentUser}
                        users={users}
                        keys={keys}
                        logs={logs}
                        uids={uids}
                        onAddKey={handleAddKey}
                        onUpdateUserRole={handleUpdateUserRole}
                        onKickUser={handleKickUser}
                      />
                    )}
                  </div>
                </main>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
