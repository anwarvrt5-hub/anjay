/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synth implementation to prevent needing external MP3 loads.
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Create audio context
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Crisp mechanical mechanical keyboard click
export function playClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Short metal mechanical click
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {
    console.warn('Audio click state error:', e);
  }
}

// Success chime
export function playSuccess() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Low tone then high tone
    [
      { f: 523.25, d: 0.1, delay: 0 }, // C5
      { f: 659.25, d: 0.1, delay: 0.08 }, // E5
      { f: 783.99, d: 0.25, delay: 0.16 }, // G5
    ].forEach((tone) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(tone.f, now + tone.delay);
      
      gainNode.gain.setValueAtTime(0.05, now + tone.delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + tone.delay + tone.d);

      osc.start(now + tone.delay);
      osc.stop(now + tone.delay + tone.d);
    });
  } catch (e) {
    console.warn('Audio success error:', e);
  }
}

// Sci-fi sweep when generator starts or accesses granted
export function playAccessGranted() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('Audio check error:', e);
  }
}

// Low warning buzz sound
export function playAlert() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    console.warn('Audio alert error:', e);
  }
}

// Cyber digital single beep
export function playDigitBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Graceful fail
  }
}
