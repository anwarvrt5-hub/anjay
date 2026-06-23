/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole, RegistrationKey, SystemLog, AppStats } from '../types';
import { playClick, playSuccess, playAlert } from '../utils/audio';
import { computeStats } from '../utils/storage';
import { Users, Key, Shield, Clock, Plus, Trash2, Award, Zap } from 'lucide-react';

interface AdminPanelViewProps {
  currentUser: User;
  users: User[];
  keys: RegistrationKey[];
  logs: SystemLog[];
  uids: any[];
  onAddKey: (newKey: RegistrationKey) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onKickUser: (userId: string) => void;
}

export default function AdminPanelView({
  currentUser,
  users,
  keys,
  logs,
  uids,
  onAddKey,
  onUpdateUserRole,
  onKickUser
}: AdminPanelViewProps) {
  const stats = computeStats(users, uids);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'keys' | 'logs'>('users');
  
  // States for key generator
  const [keyType, setKeyType] = useState<UserRole.PREMIUM | UserRole.ADMIN>(UserRole.PREMIUM);
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);

  // Generate random Registration Key following exact KWR-XXXX-XXXX specifications
  const handleGenerateKey = () => {
    playSuccess();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment1 = Array(4).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const segment2 = Array(4).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    const key = `KWR-${segment1}-${segment2}`;
    
    const newKeyRecord: RegistrationKey = {
      key,
      status: 'ACTIVE',
      createdBy: currentUser.username,
      type: keyType,
      createdAt: new Date().toISOString()
    };

    onAddKey(newKeyRecord);
    setGeneratedKeyResult(key);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER: return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 font-bold';
      case UserRole.ADMIN: return 'text-rose-500 font-bold';
      case UserRole.PREMIUM: return 'text-amber-400 font-bold';
      case UserRole.MEMBER: return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Top micro statistics widget layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Users distribution stats card */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-3 flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Simulated Users</span>
            <p className="text-xl font-mono font-bold text-white mt-1">{stats.totalUsers}</p>
          </div>
          <Users size={18} className="text-[#ff2424]/40" />
        </div>

        {/* Premium count card */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-3 flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Premium Clear</span>
            <p className="text-xl font-mono font-bold text-amber-400 mt-1">{stats.totalPremiumUsers}</p>
          </div>
          <Zap size={18} className="text-amber-400/40 animate-pulse" />
        </div>

        {/* Admins card */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-3 flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Sys Admins</span>
            <p className="text-xl font-mono font-bold text-rose-500 mt-1">{stats.totalAdminUsers}</p>
          </div>
          <Shield size={18} className="text-rose-500/40" />
        </div>

        {/* Legend counts card */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-3 flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Legendary found</span>
            <p className="text-xl font-mono font-bold text-amber-500 mt-1">{stats.legendFound}</p>
          </div>
          <Award size={18} className="text-amber-500/40" />
        </div>

        {/* Mythics card */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-3 flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Mythic found</span>
            <p className="text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400 mt-1">{stats.mythicFound}</p>
          </div>
          <p className="text-md font-mono text-fuchsia-400 animate-pulse">Ω</p>
        </div>
      </div>

      {/* Main Admin Section with Submenus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
        {/* SUB SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {/* Section titles */}
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#ff2424] font-bold px-3 mb-1">
            Core Admin Sections
          </div>

          <button
            onClick={() => { playClick(); setActiveSubTab('users'); }}
            className={`w-full py-2.5 px-4 font-mono text-xs uppercase text-left rounded transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === 'users' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424]' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
            }`}
          >
            <Users size={14} /> Simulated Users ({users.length})
          </button>

          <button
            onClick={() => { playClick(); setActiveSubTab('keys'); }}
            className={`w-full py-2.5 px-4 font-mono text-xs uppercase text-left rounded transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === 'keys' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424]' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
            }`}
          >
            <Key size={14} /> Generation Keys ({keys.length})
          </button>

          <button
            onClick={() => { playClick(); setActiveSubTab('logs'); }}
            className={`w-full py-2.5 px-4 font-mono text-xs uppercase text-left rounded transition flex items-center gap-2.5 cursor-pointer ${
              activeSubTab === 'logs' ? 'bg-[#ff2424]/10 text-[#ff2424] border-l-2 border-[#ff2424]' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
            }`}
          >
            <Clock size={14} /> Terminal Logs ({logs.length})
          </button>
        </div>

        {/* SUB CONTENT PANEL (9 cols) */}
        <div className="lg:col-span-9 bg-[#181818]/75 border border-white/5 rounded-lg overflow-hidden min-h-[350px] flex flex-col">
          {/* USER TAB */}
          {activeSubTab === 'users' && (
            <div className="flex-1 flex flex-col p-5">
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-mono pb-3 border-b border-white/5 mb-4 flex items-center gap-1.5">
                <Users size={16} className="text-[#ff2424]" />
                User Base Control Sheet
              </h3>

              <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[300px] custom-scrollbar">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-[10px] tracking-wider uppercase select-none">
                      <th className="pb-2 text-zinc-400">Username</th>
                      <th className="pb-2 text-zinc-400">Role Clearance</th>
                      <th className="pb-2 text-zinc-400">Total Uids</th>
                      <th className="pb-2 text-zinc-400">Rare Found</th>
                      <th className="pb-2 text-right pr-4 text-zinc-400">Action Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/90">
                    {users.map((u) => {
                      const isSelf = u.username === currentUser.username;
                      const uIsOwner = u.role === UserRole.OWNER;
                      const currentIsOwner = currentUser.role === UserRole.OWNER;
                      
                      // Owner can edit admin/all, Admin can only edit member/premium
                      const canEditRole = !isSelf && (currentIsOwner || (!uIsOwner && u.role !== UserRole.ADMIN));
                      const canKickUser = !isSelf && (currentIsOwner || (!uIsOwner && u.role !== UserRole.ADMIN));

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-2.5 font-bold tracking-wide flex items-center gap-2">
                            {u.username}
                            {isSelf && <span className="text-[8px] bg-emerald-950/40 text-emerald-400 px-1 rounded border border-emerald-900/10">YOU</span>}
                          </td>
                          <td className="py-2 rounded">
                            {canEditRole ? (
                              <select
                                value={u.role}
                                onChange={(e) => {
                                  playSuccess();
                                  onUpdateUserRole(u.id, e.target.value as UserRole);
                                }}
                                className="bg-[#121212] border border-white/10 text-white rounded text-[11px] px-2 py-0.5 focus:outline-none focus:border-[#ff2424] cursor-pointer"
                              >
                                {Object.values(UserRole).map((role) => {
                                  // Non-owners can't promote anyone to owner
                                  if (role === UserRole.OWNER && !currentIsOwner) return null;
                                  return (
                                    <option key={role} value={role}>
                                      {role}
                                    </option>
                                  );
                                })}
                              </select>
                            ) : (
                              <span className={`text-[11px] font-bold ${getRoleColor(u.role)}`}>
                                {u.role}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-zinc-400 font-bold">{u.generateCount}</td>
                          <td className="py-2.5 text-violet-400 font-bold">{u.rareFound}</td>
                          <td className="py-2.5 text-right pr-4">
                            {canKickUser ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Kick user "${u.username}" and terminate connection?`)) {
                                    playAlert();
                                    onKickUser(u.id);
                                  }
                                }}
                                className="p-1 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 rounded transition cursor-pointer"
                                title="Kick user"
                              >
                                <Trash2 size={12} />
                              </button>
                            ) : (
                              <span className="text-[9px] text-zinc-650 italic">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERATE KEY TAB */}
          {activeSubTab === 'keys' && (
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-mono pb-3 border-b border-white/5 flex items-center gap-1.5">
                  <Key size={16} className="text-[#ff2424]" />
                  Secure Key Generation Station
                </h3>

                <p className="text-[10px] text-[#9f9f9f] leading-relaxed max-w-xl">
                  Construct synthetic membership activation keys to distribute. Redeeming active keys will instantly upgrade standard MEMBER accounts to PREMIUM or admin status.
                </p>

                {/* Left/Right settings layout */}
                <div className="flex flex-col md:flex-row gap-6 mt-4">
                  {/* Select parameters */}
                  <div className="flex-1 space-y-3 bg-[#121212]/80 p-4 border border-white/5 rounded">
                    <div>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mb-1.5">Product clearance payload</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { playClick(); setKeyType(UserRole.PREMIUM); }}
                          className={`flex-1 py-1.5 font-mono text-[10px] rounded border transition ${
                            keyType === UserRole.PREMIUM ? 'bg-amber-400/10 border-amber-400/40 text-amber-400' : 'bg-transparent border-white/10 text-zinc-400'
                          }`}
                        >
                          PREMIUM MEMBER
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClick(); setKeyType(UserRole.ADMIN); }}
                          className={`flex-1 py-1.5 font-mono text-[10px] rounded border transition ${
                            keyType === UserRole.ADMIN ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' : 'bg-transparent border-white/10 text-zinc-400'
                          }`}
                        >
                          SYSTEM ADMIN
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateKey}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#ff2424] hover:bg-[#ff4040] font-mono text-xs uppercase font-bold text-white tracking-widest rounded transition cursor-pointer"
                    >
                      <Plus size={14} /> MINT REGISTRATION KEY
                    </button>
                  </div>

                  {/* Output generation */}
                  <div className="flex-1 bg-black/40 border border-white/5 rounded p-4 flex flex-col justify-center items-center text-center">
                    {generatedKeyResult ? (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-[#ff2424] font-mono font-bold animate-pulse">GENERATION COMPLETED</span>
                        <p className="text-xl font-mono text-white tracking-widest font-bold font-mono bg-black/80 border border-white/10 rounded px-4 py-2 select-all select-text cursor-text shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                          {generatedKeyResult}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKeyResult);
                            playSuccess();
                          }}
                          className="text-[9px] font-mono text-zinc-500 hover:text-white underline"
                        >
                          Copy and export
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-650 italic font-mono">
                        Select payload type and click Mint to create a 12-digit activation pattern.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stored keys spreadsheet view */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <span className="text-[9px] text-[#ff2424] uppercase tracking-widest font-mono font-bold block mb-2">Stored key pool</span>
                <div className="max-h-[120px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="text-zinc-600 border-b border-white/5 pb-1 select-none">
                        <th>Key Code</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Creator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-400">
                      {keys.map((k) => (
                        <tr key={k.key} className="hover:bg-white/[0.01]">
                          <td className="py-1 text-white font-semibold select-all font-mono">{k.key}</td>
                          <td className="py-1 uppercase text-[9px]">{k.type}</td>
                          <td className="py-1">
                            <span className={`text-[8px] font-extrabold px-1 rounded border-sm leading-none ${
                              k.status === 'ACTIVE' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/10' : 'bg-zinc-800 text-zinc-500 border-zinc-900'
                            }`}>
                              {k.status}
                            </span>
                          </td>
                          <td className="py-1 text-[9px]">{k.createdBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE SYSTEM LOGS */}
          {activeSubTab === 'logs' && (
            <div className="flex-1 p-5 flex flex-col">
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-mono pb-3 border-b border-white/5 mb-4 flex items-center gap-1.5">
                <Clock size={16} className="text-[#ff2424]" />
                Internal System Audit Trail
              </h3>

              <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar bg-black/40 border border-white/5 rounded p-3 font-mono text-[10px] space-y-1.5">
                {logs.map((log) => (
                  <div key={log.id} className="leading-relaxed hover:bg-white/[0.01] p-0.5 rounded transition">
                    <span className="text-zinc-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className="text-[#ff2424] font-bold">{log.action}</span> -{' '}
                    <span className="text-white font-semibold">{log.username}</span>:{' '}
                    <span className="text-zinc-400">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
