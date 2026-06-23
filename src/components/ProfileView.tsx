/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole, RegistrationKey } from '../types';
import { playClick, playSuccess, playAlert } from '../utils/audio';
import { Shield, UserCheck, Calendar, Key, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updated: User) => void;
  keys: RegistrationKey[];
  onUseKey: (keyStr: string) => UserRole | null;
}

export default function ProfileView({ user, onUserUpdate, keys, onUseKey }: ProfileViewProps) {
  const [upgradeKey, setUpgradeKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeKey.trim()) return;

    playClick();
    const resultRole = onUseKey(upgradeKey.trim());

    if (resultRole) {
      playSuccess();
      setStatusMsg({
        text: `ACCESS GRANTED: Account promoted to ${resultRole}! Enjoy limitless generator capacity.`,
        error: false
      });
      setUpgradeKey('');
    } else {
      playAlert();
      setStatusMsg({
        text: 'UPGRADE ERROR: Invalid or already utilized Registration Key sequence.',
        error: true
      });
    }
  };

  const getUserBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'from-red-500 via-amber-400 to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case UserRole.ADMIN:
        return 'from-red-600 to-[#ff2424] text-white shadow-[0_0_10px_rgba(255,36,36,0.3)]';
      case UserRole.PREMIUM:
        return 'from-amber-500 to-yellow-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case UserRole.MEMBER:
        return 'from-zinc-700 to-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-2">
      {/* LEFT: User Profile overview (5 cols) */}
      <div className="lg:col-span-5 bg-[#181818]/75 border border-white/5 rounded-lg p-6 flex flex-col justify-between shadow-xl">
        <div className="space-y-6">
          {/* Avatar and Info */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${getUserBadgeStyle(user.role)} flex items-center justify-center text-3xl font-bold font-mono tracking-wider shadow-lg select-none mb-3`}>
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            
            <h2 className="text-lg font-bold text-white tracking-wide font-sans">{user.username}</h2>
            
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/10 rounded-full">
              <Shield size={12} className="text-[#ff2424]" />
              <span className="text-[9px] uppercase tracking-wider font-bold font-mono text-zinc-300">ROLE: {user.role}</span>
            </div>
          </div>

          {/* Details metadata */}
          <div className="space-y-4 font-mono text-xs text-[#9f9f9f]">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1.5"><Calendar size={13} /> Join Date</span>
              <span className="text-white">{user.joinDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1.5"><ArrowUpRight size={13} /> Total Generated UIDs</span>
              <span className="text-white font-bold">{user.generateCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-500 flex items-center gap-1.5"><CheckCircle2 size={13} /> Rare UIDs Minted</span>
              <span className="text-white font-bold text-violet-400">{user.rareFound}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500 flex items-center gap-1.5"><Lock size={13} /> Daily Quota Capacity</span>
              <span className="text-white">
                {user.role === UserRole.MEMBER ? `${user.generatedToday} / 50 generated today` : 'Unlimited Premium Power'}
              </span>
            </div>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-8 pt-4 border-t border-white/5 text-[9px] font-mono text-zinc-650 flex items-center justify-between">
          <span>CONSOLE USER ID: KW-UID-{user.id}</span>
          <span className="text-emerald-500">ACTIVE CLIENT SECURED</span>
        </div>
      </div>

      {/* RIGHT: Membership benefits and Simulated Key upgrading (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Tier Information card */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-6">
          <h3 className="text-xs font-semibold text-white tracking-widest font-mono uppercase border-b border-white/5 pb-3 mb-4">
            Membership Tier Specs & Power Rates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Specs */}
            <div className={`p-4 rounded border ${user.role === UserRole.MEMBER ? 'bg-[#ff2424]/5 border-[#ff2424]/20' : 'bg-black/30 border-white/5'}`}>
              <h4 className="text-xs text-white uppercase font-bold font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                MEMBER ROLE
              </h4>
              <p className="text-[10px] text-[#9f9f9f] mt-2 leading-relaxed">
                Basic clearance. Caps at 50 simulated generations per day. Access to standard generator and history tabs with CSV export. Daily limit refreshes automatically.
              </p>
            </div>

            {/* Premium Specs */}
            <div className={`p-4 rounded border ${user.role === UserRole.PREMIUM ? 'bg-amber-400/5 border-amber-400/20' : 'bg-black/30 border-white/5'}`}>
              <h4 className="text-xs text-amber-400 uppercase font-bold font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                PREMIUM ELITE
              </h4>
              <p className="text-[10px] text-[#9f9f9f] mt-2 leading-relaxed">
                Infinite clearance. Multi-thread generating capability with ZERO limits. High probability parameters. Access to tactical command terminal console and advanced CSV tables.
              </p>
            </div>
          </div>
        </div>

        {/* Key Upgrading simulator */}
        {user.role === UserRole.MEMBER && (
          <div className="bg-gradient-to-r from-[#1b1010] to-[#0f0f0f] border border-[#ff2424]/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xs font-semibold text-white tracking-widest font-mono uppercase flex items-center gap-1.5 mb-2">
              <Key size={14} className="text-[#ff2424] animate-pulse" />
              UPGRADE ACCOUNT STATUS
            </h3>
            <p className="text-[10px] text-[#9f9f9f] leading-relaxed mb-4">
              Enter an active Premium/Admin Registration Key (fictitious seed key is <span className="text-[#ff2424] font-mono">KWR-X92L-61PQ</span> or request keys from Administrators) to bypass member limitations.
            </p>

            <form onSubmit={handleUpgrade} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="KWR-XXXX-XXXX"
                  value={upgradeKey}
                  onChange={(e) => setUpgradeKey(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#121212] border border-white/10 hover:border-[#ff2424]/20 focus:border-[#ff2424] focus:ring-0 focus:outline-none rounded text-white text-xs px-3 py-2 font-mono"
                />
                <button
                  type="submit"
                  disabled={!upgradeKey.trim()}
                  className="px-4 py-2 bg-[#ff2424] font-mono hover:bg-[#ff4040] text-white text-xs uppercase font-bold tracking-wider rounded transition cursor-pointer disabled:opacity-40"
                >
                  UPGRADE
                </button>
              </div>

              {statusMsg && (
                <div className={`p-2.5 rounded border text-[10px] font-mono ${
                  statusMsg.error ? 'bg-rose-950/40 text-rose-400 border-rose-900/30' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                }`}>
                  {statusMsg.text}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
