/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UidRecord, UserRole } from '../types';
import { computeStats } from '../utils/storage';
import { Shield, Zap, TrendingUp, Award, Clock, Code, Activity, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  user: User;
  users: User[];
  uids: UidRecord[];
}

export default function DashboardView({ user, users, uids }: DashboardViewProps) {
  const stats = computeStats(users, uids);

  // Filter last 5 generated UIDs
  const lastGenerated = uids.slice(0, 5);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'UNCOMMON': return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'RARE': return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      case 'EPIC': return 'text-red-400 bg-red-950/40 border-red-800/40';
      case 'LEGENDARY': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'MYTHIC': return 'text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-800/40';
      default: return 'text-gray-400 bg-gray-950/40 border-gray-800/40';
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1b1010] to-[#0f0f0f] border border-[#ff2424]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(255,36,36,0.05)]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#ff2424]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#ff2424] animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-[#ff2424] font-mono">System Online</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              WELCOME BACK, <span className="text-[#ff2424] drop-shadow-[0_0_10px_rgba(255,36,36,0.4)]">{user.username}</span>
            </h1>
            <p className="text-xs text-[#9f9f9f] max-w-xl">
              Fictitious UID Generator v3 premium console activated. Enjoy elite algorithm access with lightning speed results. Never use generator results for actual online platforms.
            </p>
          </div>
          <div className="bg-[#181818]/80 border border-[#ff2424]/30 rounded px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] text-[#9f9f9f] uppercase tracking-widest font-mono">YOUR CLEARANCE</span>
            <span className={`text-md font-bold tracking-wider mt-1 ${
              user.role === UserRole.OWNER ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff2424] via-amber-400 to-[#ff4040]' :
              user.role === UserRole.ADMIN ? 'text-red-500' :
              user.role === UserRole.PREMIUM ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Generator Counter */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-4 relative group hover:border-[#ff2424]/30 transition-all duration-300">
          <div className="absolute top-2 right-2 text-[#ff2424]/20 group-hover:text-[#ff2424]/40 transition-colors">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] text-[#9f9f9f] tracking-widest uppercase font-mono">UID Generated</p>
          <p className="text-2xl font-bold text-white mt-1 group-hover:scale-[1.02] transition-transform origin-left">
            {stats.totalGenerated.toLocaleString()}
          </p>
          <div className="mt-2 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span>+100% active engine</span>
          </div>
        </div>

        {/* Rare found */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-4 relative group hover:border-[#ff2424]/30 transition-all duration-300">
          <div className="absolute top-2 right-2 text-[#ff2424]/20 group-hover:text-[#ff2424]/40 transition-colors">
            <Award size={24} />
          </div>
          <p className="text-[10px] text-[#9f9f9f] tracking-widest uppercase font-mono">Rare UID Obtained</p>
          <p className="text-2xl font-bold text-violet-400 mt-1">
            {stats.rareFound}
          </p>
          <div className="mt-2 text-[10px] text-[#9f9f9f] font-mono flex items-center gap-1">
            <span className="text-violet-400 font-bold">{((stats.rareFound / stats.totalGenerated) * 100).toFixed(3)}%</span>
            <span>overall success rate</span>
          </div>
        </div>

        {/* Account Role */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-4 relative group hover:border-[#ff2424]/30 transition-all duration-300">
          <div className="absolute top-2 right-2 text-[#ff2424]/20 group-hover:text-[#ff2424]/40 transition-colors">
            <Shield size={24} />
          </div>
          <p className="text-[10px] text-[#9f9f9f] tracking-widest uppercase font-mono">Authority Level</p>
          <p className="text-2xl font-bold text-white mt-1 uppercase">
            {user.role}
          </p>
          <div className="mt-2 text-[10px] text-[#9f9f9f] font-mono">
            {user.role === UserRole.MEMBER ? (
              <span className="text-[#ff2424] flex items-center gap-1 animate-pulse">
                Limit: {user.generatedToday}/50 generated
              </span>
            ) : (
              <span className="text-emerald-400">Unlimited mint pass active</span>
            )}
          </div>
        </div>

        {/* Last login */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-4 relative group hover:border-[#ff2424]/30 transition-all duration-300">
          <div className="absolute top-2 right-2 text-[#ff2424]/20 group-hover:text-[#ff2424]/40 transition-colors">
            <Clock size={24} />
          </div>
          <p className="text-[10px] text-[#9f9f9f] tracking-widest uppercase font-mono">Last Session Activity</p>
          <p className="text-2xl font-bold text-white mt-1">
            TODAY
          </p>
          <div className="mt-2 text-[10px] text-[#9f9f9f] font-mono leading-none">
            IP Secure | Active Proxy
          </div>
        </div>
      </div>

      {/* Analytical Visualizer Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Rarity Distribution Stats Chart */}
        <div className="lg:col-span-2 bg-[#181818]/75 border border-white/5 rounded-lg p-5">
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-mono mb-4 flex items-center gap-2 pb-2 border-b border-white/5">
            <Activity size={16} className="text-[#ff2424]" />
            RARITY DISTRIBUTION & PROBABILITY SPECTRUM
          </h2>

          <div className="space-y-4">
            {/* Common */}
            <div>
              <div className="flex justify-between text-xs text-[#9f9f9f] font-mono mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  COMMON
                </span>
                <span>Normal Probability / Sangat Sering</span>
              </div>
              <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{ width: '55%' }} />
              </div>
            </div>

            {/* Uncommon */}
            <div>
              <div className="flex justify-between text-xs text-[#9f9f9f] font-mono mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-blue-400">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  UNCOMMON
                </span>
                <span>Two-Of-A-Kind / Sering</span>
              </div>
              <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-blue-400 h-full rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" style={{ width: '30%' }} />
              </div>
            </div>

            {/* Rare */}
            <div>
              <div className="flex justify-between text-xs text-[#9f9f9f] font-mono mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-purple-400">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  RARE
                </span>
                <span>Three-Of-A-Kind / ~12.0%</span>
              </div>
              <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-purple-400 h-full rounded-full shadow-[0_0_8px_rgba(192,132,252,0.5)]" style={{ width: '12%' }} />
              </div>
            </div>

            {/* Epic */}
            <div>
              <div className="flex justify-between text-xs text-[#9f9f9f] font-mono mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-red-500">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  EPIC
                </span>
                <span>Four-Of-A-Kind / 1 : 100</span>
              </div>
              <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-red-500 h-full rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{ width: '2.5%' }} />
              </div>
            </div>

            {/* Legendary */}
            <div>
              <div className="flex justify-between text-xs text-[#9f9f9f] font-mono mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                  LEGENDARY
                </span>
                <span>Five-Of-A-Kind / 1 : 500 / {stats.legendFound} Minted</span>
              </div>
              <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-amber-400 h-full rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" style={{ width: '0.8%' }} />
              </div>
            </div>

            {/* Mythic */}
            <div>
              <div className="flex justify-between text-xs text-[#9f9f9f] font-mono mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-fuchsia-400 font-bold">
                  <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
                  MYTHIC
                </span>
                <span>Six-Of-A-Kind / 1 : 3000 / {stats.mythicFound} Minted</span>
              </div>
              <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" style={{ width: '0.2%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Mints Feed Column */}
        <div className="bg-[#181818]/75 border border-white/5 rounded-lg p-5">
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-mono mb-4 flex items-center gap-2 pb-2 border-b border-white/5">
            <Clock size={16} className="text-[#ff2424]" />
            LIVE SIMULATION STREAM
          </h2>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {lastGenerated.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-white/5 rounded">
                <p className="text-[11px] text-[#9f9f9f] font-mono italic">No items simulated yet</p>
                <p className="text-[9px] text-[#ff2424] font-mono mt-1">Execute /gen in generator tab</p>
              </div>
            ) : (
              lastGenerated.map((item) => (
                <div key={item.id} className="bg-[#121212] border border-white/5 hover:border-[#ff2424]/20 rounded p-2.5 flex justify-between items-center transition-all">
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs text-white tracking-wider flex items-center gap-1.5">
                      <span>{item.uid}</span>
                    </div>
                    <div className="text-[10px] text-[#9f9f9f] font-mono">
                      {item.email}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    <span className="text-[8px] text-[#9f9f9f] font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legal & Security Compliance Warning Panel */}
      <div className="bg-black/40 border border-amber-500/20 rounded p-4 flex gap-4 items-center">
        <div className="bg-amber-500/10 p-2 rounded text-amber-400">
          <Code size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-400 uppercase font-mono">Simulation Sandbox Agreement</h4>
          <p className="text-[10px] text-[#9f9f9f] leading-relaxed">
            All credentials (Gmail accounts, passwords, and 12-digit UIDs) generated by KINGWAR UID GENERATOR v3 are entirely fictitious, synthetic data points dynamically computed for layout and penetration test simulations. No actual credentials are extracted from or saved to live production servers. Usage of fictitious credentials to hijack or access actual systems is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
