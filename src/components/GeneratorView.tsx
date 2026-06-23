/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, UidRecord, UserRole, UidRarity } from '../types';
import { generateSMRUid } from '../utils/generator';
import { playClick, playSuccess, playAccessGranted, playAlert, playDigitBeep } from '../utils/audio';
import { Terminal as TerminalIcon, Copy, Trash2, Check, RefreshCw, Eye, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GeneratorViewProps {
  user: User;
  onUserUpdate: (updated: User) => void;
  uids: UidRecord[];
  onAddUids: (newUids: UidRecord[]) => void;
  onClearUids: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

interface ConsoleLine {
  id: string;
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warn';
  timestamp: string;
}

export default function GeneratorView({
  user,
  onUserUpdate,
  uids,
  onAddUids,
  onClearUids,
  onNavigate,
  onLogout
}: GeneratorViewProps) {
  // Input command state
  const [command, setCommand] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<ConsoleLine[]>([
    { id: '1', text: 'KINGWAR UID GENERATOR v3.0 [Version 10.0.22662]', type: 'success', timestamp: new Date().toLocaleTimeString() },
    { id: '2', text: 'System terminal active. Type /help to list core instructions.', type: 'output', timestamp: new Date().toLocaleTimeString() },
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [newlyGenerated, setNewlyGenerated] = useState<UidRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<UidRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto scroll references
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const newMintsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory]);

  const addLine = (text: string, type: 'input' | 'output' | 'error' | 'success' | 'warn' = 'output') => {
    setConsoleHistory(prev => [
      ...prev,
      {
        id: `line_${Math.random().toString(36).substr(2, 9)}`,
        text,
        type,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Check limits
  const checkDailyLimit = (requestedCount: number): boolean => {
    if (user.role === UserRole.MEMBER) {
      const remaining = Math.max(0, 50 - user.generatedToday);
      if (remaining <= 0) {
        playAlert();
        addLine(`ERROR: Daily limit reached (50/50). Upgrade to PREMIUM for limitless power.`, 'error');
        return false;
      }
      if (requestedCount > remaining) {
        playAlert();
        addLine(`ERROR: Requested count (${requestedCount}) exceeds your remaining quota of ${remaining}.`, 'error');
        return false;
      }
    }
    return true;
  };

  // Perform multi-item simulation minting
  const runSimulatedGeneration = async (count: number, forceRarity?: UidRarity) => {
    setIsGenerating(true);
    setNewlyGenerated([]);
    playAccessGranted();
    
    addLine(`Command Accepted. Preparing engine for ${count} fictitious UID generations...`, 'success');
    
    const steps = [
      'Initializing algorithm channels...',
      'Mapping digit probabilities...',
      'Bypassing firewall vectors...',
      'Cracking generator entropy...',
      'Saving fake accounts back to client pool...',
      'Mints successfully created!'
    ];

    // Loop steps
    for (let s = 0; s < steps.length; s++) {
      setLoadingStepText(steps[s]);
      playDigitBeep();
      setGenerateProgress(((s + 1) / steps.length) * 100);
      
      // Delay to simulate computation
      await new Promise(resolve => setTimeout(resolve, s === 4 ? 600 : 300));
    }

    // Now, let's create the items and append them with staggered animations
    const mintedBuffer: UidRecord[] = [];
    let containsRare = false;

    for (let c = 0; c < count; c++) {
      const newRec = generateSMRUid(user.username, forceRarity);
      if (newRec.rarity !== UidRarity.COMMON) {
        containsRare = true;
      }
      mintedBuffer.push(newRec);
    }

    // Add elements to state with a visual typewriter timer stream
    for (let i = 0; i < mintedBuffer.length; i++) {
      const item = mintedBuffer[i];
      setNewlyGenerated(prev => [item, ...prev]);
      playClick();
      addLine(`+ MINTED: ${item.uid} | ${item.email} | [${item.rarity}]`, item.rarity === 'COMMON' ? 'output' : 'success');
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Save back to master db
    onAddUids(mintedBuffer);

    // Update user stats
    const newlyRareCount = mintedBuffer.filter(r => r.rarity !== UidRarity.COMMON).length;
    const updatedUser = {
      ...user,
      generateCount: user.generateCount + count,
      rareFound: user.rareFound + newlyRareCount,
      generatedToday: user.role === UserRole.MEMBER ? user.generatedToday + count : user.generatedToday
    };
    onUserUpdate(updatedUser);

    playSuccess();
    addLine(`COMPLETED: Mapped and persistent generated ${count} items securely.`, 'success');
    
    if (containsRare) {
      addLine(`ALERT: Rare high-tier repeating numbers discovered in this cycle! Check stats panel.`, 'warn');
    }

    setIsGenerating(false);
    setGenerateProgress(0);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;

    playClick();
    addLine(`> ${cmd}`, 'input');
    setCommand('');

    // Parse command
    const parts = cmd.split(' ');
    const primary = parts[0].toLowerCase();
    const arg = parts[1];

    switch (primary) {
      case '/help':
        addLine('--- KINGWAR TERMINAL COMMAND INDEX ---', 'success');
        addLine('/gen [count]   - Simulate specific fictitious accounts (e.g. /gen 5)');
        addLine('/help          - Review full terminal index commands');
        addLine('/profile       - Open active profile metrics instantly');
        addLine('/history       - Navigate directly to master list spreadsheet');
        addLine('/stats         - Launch live statistics spectrum overview');
        addLine('/clear         - Wipe currently printed console log output');
        addLine('/logout        - Safely log out from active terminal shell');
        break;

      case '/clear':
        setConsoleHistory([]);
        break;

      case '/profile':
        addLine('Redirecting to Profile Panel...', 'success');
        setTimeout(() => onNavigate('profile'), 400);
        break;

      case '/history':
        addLine('Redirecting to History Database...', 'success');
        setTimeout(() => onNavigate('history'), 400);
        break;

      case '/stats':
        addLine('Redirecting to Analytics Charts...', 'success');
        setTimeout(() => onNavigate('stats'), 400);
        break;

      case '/logout':
        addLine('Destroying sessions and logging out...', 'warn');
        setTimeout(() => onLogout(), 600);
        break;

      case '/gen': {
        const amt = parseInt(arg, 10);
        if (isNaN(amt) || amt <= 0) {
          playAlert();
          addLine('ERROR: Invalid amount parameters. Use format /gen [count] (e.g. /gen 5)', 'error');
        } else if (amt > 100) {
          playAlert();
          addLine('ERROR: Maximum single cycle simulation capacity is capped at 100.', 'error');
        } else {
          // Verify limit limits
          if (checkDailyLimit(amt)) {
            runSimulatedGeneration(amt);
          }
        }
        break;
      }

      default:
        playAlert();
        addLine(`ERROR: Unknown Command "${primary}". Type /help to see all functional paths.`, 'error');
        break;
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSuccess();
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getRarityBadgeStyle = (rarity: UidRarity) => {
    switch (rarity) {
      case UidRarity.COMMON:
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
      case UidRarity.UNCOMMON:
        return 'bg-blue-950/60 text-blue-400 border-blue-800/40';
      case UidRarity.RARE:
        return 'bg-purple-950/60 text-purple-400 border-purple-800/40';
      case UidRarity.EPIC:
        return 'bg-red-950/60 text-red-500 border-red-800/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
      case UidRarity.LEGENDARY:
        return 'bg-amber-950/80 text-amber-400 border-amber-800 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse';
      case UidRarity.MYTHIC:
        return 'bg-gradient-to-r from-red-650 via-purple-600 to-indigo-700 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold tracking-widest';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-2">
      {/* LEFT: Cyber Terminal (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-black/80 border border-white/5 rounded-lg overflow-hidden shadow-2xl relative">
        {/* Terminal Header */}
        <div className="bg-[#121212] border-b border-white/5 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon size={14} className="text-[#ff2424]" />
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/70">console@kingwar: ~</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          </div>
        </div>

        {/* Terminal Logs Output */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] min-h-[300px] h-96 custom-scrollbar bg-[#050505]/95">
          {consoleHistory.map((line) => (
            <div key={line.id} className="flex gap-2 leading-relaxed">
              <span className="text-[#9f9f9f] select-none text-[9px] mt-0.5 font-sans">[{line.timestamp}]</span>
              <span className={`
                ${line.type === 'input' ? 'text-[#ff2424]' : ''}
                ${line.type === 'success' ? 'text-emerald-400' : ''}
                ${line.type === 'error' ? 'text-rose-500 font-semibold' : ''}
                ${line.type === 'warn' ? 'text-amber-400 font-bold' : ''}
                ${line.type === 'output' ? 'text-[#9f9f9f]' : ''}
              `}>
                {line.text}
              </span>
            </div>
          ))}

          {/* Generator execution display */}
          {isGenerating && (
            <div className="border border-[#ff2424]/30 bg-[#ff2424]/5 rounded p-3 my-2 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white font-semibold flex items-center gap-1.5 font-mono">
                  <span className="h-1.5 w-1.5 bg-[#ff2424] animate-ping rounded-full" />
                  {loadingStepText}
                </span>
                <span className="text-[#ff2424] font-mono">{Math.round(generateProgress)}%</span>
              </div>
              <div className="w-full bg-[#121212] rounded h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-[#ff2424] h-full shadow-[0_0_10px_rgba(255,36,36,0.8)] transition-all duration-300" 
                  style={{ width: `${generateProgress}%` }}
                />
              </div>
              <div className="font-mono text-[9px] text-[#9f9f9f] flex justify-between">
                <span>CHANNEL: MULTI-THREAD-SECURE</span>
                <span>DATA INTEGRITY SECURED</span>
              </div>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Console command input */}
        <form onSubmit={handleCommandSubmit} className="bg-[#090909] border-t border-white/5 p-3 flex gap-2 items-center">
          <span className="text-[#ff2424] font-mono font-bold select-none">{'>'}</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? 'Computing simulation...' : 'Type /gen 5 or /help...'}
            className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 font-mono text-[11px] placeholder-white/20 select-text cursor-text"
            onKeyDown={() => {}}
          />
          <button
            type="submit"
            disabled={isGenerating || !command.trim()}
            className="px-3 py-1 bg-[#ff2424]/10 border border-[#ff2424]/30 text-[#ff2424] text-[10px] font-mono uppercase rounded hover:bg-[#ff2424] hover:text-white transition duration-200 disabled:opacity-40"
          >
            EXEC
          </button>
        </form>
      </div>

      {/* RIGHT: Quick Controls + Newly Minted stream results lists (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-[#181818]/75 border border-white/5 rounded-lg overflow-hidden">
        {/* Header toolbar */}
        <div className="bg-[#121212] border-b border-white/5 px-4 py-3 flex justify-between items-center">
          <h2 className="text-xs font-semibold text-white font-mono tracking-widest uppercase flex items-center gap-1.5">
            <RefreshCw className={`text-[#ff2424] ${isGenerating ? 'animate-spin' : ''}`} size={14} />
            MINTED FIELD CHIPS ({newlyGenerated.length})
          </h2>
          {newlyGenerated.length > 0 && (
            <button
              onClick={() => {
                playAlert();
                setNewlyGenerated([]);
              }}
              className="text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 font-mono hover:underline"
            >
              <Trash2 size={12} /> Clear Stream
            </button>
          )}
        </div>

        {/* Results Chips Flow */}
        <div ref={newMintsRef} className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[460px] custom-scrollbar bg-[#0f0f0f]/50">
          {newlyGenerated.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/5 rounded m-2 select-none">
              <ShieldAlert className="text-zinc-600 mb-2" size={32} />
              <p className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">Stream Standby</p>
              <p className="text-[10px] font-mono text-[#9f9f9f] mt-1 max-w-xs">
                Run <span className="text-[#ff2424]">/gen 5</span> in the terminal console to dynamically mint fictitious credentials and stream them here in real-time.
              </p>
              
              {/* Shortcut buttons */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button
                  onClick={() => { if (checkDailyLimit(1)) runSimulatedGeneration(1); }}
                  disabled={isGenerating}
                  className="px-2 py-1 bg-white/5 hover:bg-[#ff2424]/10 border border-white/10 hover:border-[#ff2424]/30 text-white hover:text-[#ff2424] font-mono text-[9px] rounded-sm transition"
                >
                  Simulate 1
                </button>
                <button
                  onClick={() => { if (checkDailyLimit(5)) runSimulatedGeneration(5); }}
                  disabled={isGenerating}
                  className="px-2 py-1 bg-white/5 hover:bg-[#ff2424]/10 border border-white/10 hover:border-[#ff2424]/30 text-white hover:text-[#ff2424] font-mono text-[9px] rounded-sm transition"
                >
                  Simulate 5
                </button>
                <button
                  onClick={() => { if (checkDailyLimit(20)) runSimulatedGeneration(20); }}
                  disabled={isGenerating}
                  className="px-2 py-1 bg-white/5 hover:bg-[#ff2424]/10 border border-white/10 hover:border-[#ff2424]/30 text-white hover:text-[#ff2424] font-mono text-[9px] rounded-sm transition"
                >
                  Simulate 20
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {newlyGenerated.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#181818] border border-white/5 hover:border-[#ff2424]/20 rounded-md p-3 flex justify-between items-center shadow-lg transition-all group"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-xs text-white tracking-widest font-bold flex items-center gap-2">
                      <span>{item.uid}</span>
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border leading-none ${getRarityBadgeStyle(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#9f9f9f] font-mono truncate max-w-[180px]">
                      {item.email}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        setSelectedRecord(item);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-[#9f9f9f] hover:text-white rounded border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      title="Inspect Simulated Item"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => handleCopyText(item.uid, item.id)}
                      className="p-1.5 bg-white/5 hover:bg-[#ff2424]/10 text-zinc-500 hover:text-[#ff2424] rounded border border-white/10 hover:border-[#ff2424]/30 transition-all cursor-pointer"
                      title="Copy UID"
                    >
                      {copiedId === item.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* POPUP / MODAL INSPECTOR DETAIL */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#181818] border border-[#ff2424]/40 rounded-lg p-6 shadow-[0_0_30px_rgba(255,36,36,0.15)] relative overflow-hidden"
            >
              {/* Scanline border decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff2424] to-transparent" />

              <h3 className="text-sm font-bold font-mono tracking-widest text-[#ff2424] uppercase mb-4 flex items-center gap-2">
                <Award size={16} /> SIMULATED DECRYPTION RESULTS
              </h3>

              <div className="space-y-4">
                {/* UID Container */}
                <div className="space-y-1 bg-black/40 border border-white/5 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-[#9f9f9f] uppercase tracking-wider">Simulated UID</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getRarityBadgeStyle(selectedRecord.rarity)}`}>
                      {selectedRecord.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-md font-mono font-bold text-white tracking-widest">{selectedRecord.uid}</span>
                    <button
                      onClick={() => handleCopyText(selectedRecord.uid, 'm-uid')}
                      className="p-1 bg-white/5 hover:bg-[#ff2424]/10 text-zinc-500 hover:text-[#ff2424] rounded border border-white/10 hover:border-[#ff2424]/30 transition"
                    >
                      {copiedId === 'm-uid' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                {/* Email Container */}
                <div className="space-y-1 bg-black/40 border border-white/5 rounded p-3">
                  <span className="text-[9px] font-mono text-[#9f9f9f] uppercase tracking-wider">Simulated Gmail</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-mono text-white/90">{selectedRecord.email}</span>
                    <button
                      onClick={() => handleCopyText(selectedRecord.email, 'm-gmail')}
                      className="p-1 bg-white/5 hover:bg-[#ff2424]/10 text-zinc-500 hover:text-[#ff2424] rounded border border-white/10 hover:border-[#ff2424]/30 transition"
                    >
                      {copiedId === 'm-gmail' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                {/* Password Container */}
                <div className="space-y-1 bg-black/40 border border-white/5 rounded p-3">
                  <span className="text-[9px] font-mono text-[#9f9f9f] uppercase tracking-wider">Simulated Password</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-mono text-white/90">{selectedRecord.password}</span>
                    <button
                      onClick={() => handleCopyText(selectedRecord.password, 'm-pass')}
                      className="p-1 bg-white/5 hover:bg-[#ff2424]/10 text-zinc-500 hover:text-[#ff2424] rounded border border-white/10 hover:border-[#ff2424]/30 transition"
                    >
                      {copiedId === 'm-pass' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom control */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    playSuccess();
                    handleCopyText(`UID: ${selectedRecord.uid}\nGmail: ${selectedRecord.email}\nPassword: ${selectedRecord.password}`, 'm-all');
                  }}
                  className="px-3 py-1.5 bg-[#ff2424]/10 hover:bg-[#ff2424] text-[#ff2424] hover:text-white border border-[#ff2424]/30 font-mono text-[10px] uppercase rounded transition cursor-pointer"
                >
                  {copiedId === 'm-all' ? 'Copied Full decrypted text' : 'Copy All'}
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setSelectedRecord(null);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#9f9f9f] hover:text-white border border-white/10 rounded font-mono text-[10px] uppercase transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
