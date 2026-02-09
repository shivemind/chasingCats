'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface CatEye {
  id: number;
  x: number;
  y: number;
  scale: number;
  blinkDelay: number;
}

export function AnimatedHero() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [catEyes, setCatEyes] = useState<CatEye[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Initialize particles and cat eyes
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.3,
      color: ['#00f5d4', '#9b5de5', '#f72585', '#ffd700'][Math.floor(Math.random() * 4)],
    }));
    setParticles(newParticles);

    const newEyes: CatEye[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      scale: 0.5 + Math.random() * 0.5,
      blinkDelay: Math.random() * 5,
    }));
    setCatEyes(newEyes);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: ((p.x + p.speedX + 100) % 100),
          y: ((p.y + p.speedY + 100) % 100),
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Track mouse for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <section 
      className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-midnight via-deep-space to-black"
      onMouseMove={handleMouseMove}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-purple/20 via-transparent to-transparent animate-pulse-slow" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 245, 212, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0, 245, 212, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
        }}
      />

      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-sm transition-all duration-1000"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />
      ))}

      {/* Cat eyes scattered */}
      {catEyes.map(eye => (
        <div
          key={eye.id}
          className="absolute"
          style={{
            left: `${eye.x}%`,
            top: `${eye.y}%`,
            transform: `scale(${eye.scale}) translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
            animationDelay: `${eye.blinkDelay}s`,
          }}
        >
          <div className="flex gap-3 animate-blink" style={{ animationDelay: `${eye.blinkDelay}s` }}>
            <div className="h-4 w-2 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700,0_0_20px_#ffd700] animate-pulse" />
            <div className="h-4 w-2 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700,0_0_20px_#ffd700] animate-pulse" />
          </div>
        </div>
      ))}

      {/* Glowing orbs */}
      <div 
        className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-neon-cyan/20 blur-3xl animate-float"
        style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-neon-purple/20 blur-3xl animate-float"
        style={{ 
          animationDelay: '2s',
          transform: `translate(${mousePos.x * -50}px, ${mousePos.y * -50}px)` 
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container-section flex min-h-[90vh] flex-col items-center justify-center text-center">
        {/* Animated badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 backdrop-blur-sm animate-bounce-slow">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
          </span>
          <span className="text-sm font-medium text-neon-cyan">New: Live Safari Events</span>
        </div>

        {/* Title with gradient animation */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="block text-white">Community for</span>
          <span className="block bg-gradient-to-r from-neon-cyan via-brand to-neon-purple bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
            Cat Lovers
          </span>
        </h1>

        {/* Typing effect subtitle */}
        <p className="mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl md:text-2xl">
          Learn from world-class photographers. Capture 
          <span className="inline-block mx-2 text-neon-cyan font-semibold animate-pulse"> big cats </span>
          like never before.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/join"
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,212,0.5)] focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-midnight"
          >
            <span className="relative z-10">Start Learning</span>
            <span className="absolute inset-0 -z-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          
          <Link
            href="/library"
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-midnight"
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-125" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Preview
          </Link>
          
          <Link
            href="/experts"
            className="group flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/30 px-8 py-4 text-lg font-medium text-emerald-300 backdrop-blur-sm transition-all hover:bg-emerald-800/40 hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-midnight"
          >
            <span className="text-xl" aria-hidden="true">🦁</span>
            Expert Talks
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
          {[
            { value: '500+', label: 'Video Hours' },
            { value: '50K+', label: 'Students' },
            { value: '4.9★', label: 'Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile to prevent overlap */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
