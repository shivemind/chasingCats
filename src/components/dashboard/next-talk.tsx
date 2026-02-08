'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NextTalkProps {
  talk: {
    id: string;
    title: string;
    speaker: string;
    speakerTitle?: string;
    description: string;
    image?: string;
    scheduledAt: Date;
    slug: string;
  } | null;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: Date) {
  const difference = targetDate.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isLive: false,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg bg-deep-space/80 px-3 py-2 min-w-[60px] sm:min-w-[70px] text-center border border-white/10">
        <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function NextTalk({ talk }: NextTalkProps) {
  const countdown = useCountdown(talk?.scheduledAt ?? new Date());

  if (!talk) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="text-center py-8">
          <span className="text-4xl">📅</span>
          <p className="mt-4 text-white font-medium">No upcoming talks scheduled</p>
          <p className="text-sm text-gray-500">Check back soon for new events!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-white/10 to-white/5 p-4 sm:p-6 backdrop-blur-sm overflow-hidden relative">
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-neon-cyan/20 blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          {countdown.isLive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              LIVE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-neon-cyan/20 px-3 py-1 text-xs font-semibold text-neon-cyan">
              <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
              NEXT TALK
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{talk.title}</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Speaker Info */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold">
              {talk.speaker.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-white">{talk.speaker}</p>
              {talk.speakerTitle && (
                <p className="text-xs text-gray-400">{talk.speakerTitle}</p>
              )}
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto">
            <CountdownUnit value={countdown.days} label="days" />
            <span className="text-white/30 text-xl font-light">:</span>
            <CountdownUnit value={countdown.hours} label="hrs" />
            <span className="text-white/30 text-xl font-light">:</span>
            <CountdownUnit value={countdown.minutes} label="min" />
            <span className="text-white/30 text-xl font-light hidden sm:block">:</span>
            <div className="hidden sm:block">
              <CountdownUnit value={countdown.seconds} label="sec" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-400 line-clamp-2">{talk.description}</p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/events/${talk.slug}`}
            className="flex-1 rounded-xl bg-neon-cyan px-4 py-3 text-center font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(0,245,212,0.3)]"
          >
            {countdown.isLive ? 'Join Now' : 'Submit Your Questions'}
          </Link>
          <Link
            href="/events"
            className="rounded-xl border border-white/20 px-4 py-3 text-center font-semibold text-white hover:bg-white/10 transition-colors"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
}
