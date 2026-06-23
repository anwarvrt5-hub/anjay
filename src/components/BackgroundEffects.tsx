/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 60;

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        decay: 0.002
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      // Clear background with soft transparent mask for subtle trail
      ctx.fillStyle = 'rgba(13, 13, 13, 1)';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw glowing grid network
      ctx.strokeStyle = 'rgba(255, 36, 36, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 45;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw ambient neon radial glows
      const glow1X = width * 0.2;
      const glow1Y = height * 0.3;
      const r1 = Math.min(width, height) * 0.4;
      const gradient1 = ctx.createRadialGradient(glow1X, glow1Y, 0, glow1X, glow1Y, r1);
      gradient1.addColorStop(0, 'rgba(255, 36, 36, 0.07)');
      gradient1.addColorStop(1, 'rgba(13, 13, 13, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.8;
      const glow2Y = height * 0.7;
      const r2 = Math.min(width, height) * 0.5;
      const gradient2 = ctx.createRadialGradient(glow2X, glow2Y, 0, glow2X, glow2Y, r2);
      gradient2.addColorStop(0, 'rgba(255, 36, 36, 0.04)');
      gradient2.addColorStop(1, 'rgba(13, 13, 13, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      // 3. Render and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries loop
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 64, 64, ${p.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 36, 36, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 4. Draw horizontal custom scanline scanning downward
      const scanTime = Date.now() * 0.0003;
      const scanY = (scanTime % 1) * height;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.strokeStyle = `rgba(255, 36, 36, 0.15)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {/* Absolute scanline retro glass overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 18, 18, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
}
