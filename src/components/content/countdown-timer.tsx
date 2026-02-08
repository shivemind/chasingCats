'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ContentDrop {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  unlockAt: string;
  type: 'video' | 'workshop' | 'article' | 'course';
  isPremium: boolean;
  instructor?: string;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// Countdown digit display
function CountdownDigit({ value, label }: { value: number; label: string }) {
  const displayValue = value.toString().padStart(2, '0');

  return (
    <div className="text-center">
      <div className="relative">
        <div className="flex gap-1">
          {displayValue.split('').map((digit, i) => (
            <div 
              key={i}
              className="flex h-14 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-white/10 to-white/5 border border-white/10"
            >
              <span className="text-2xl font-bold text-white">{digit}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// Content unlock countdown card
export function ContentCountdownCard({ content }: { content: ContentDrop }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(content.unlockAt);

  const typeConfig = {
    video: { icon: '🎬', label: 'Video' },
    workshop: { icon: '🎓', label: 'Workshop' },
    article: { icon: '📖', label: 'Article' },
    course: { icon: '📚', label: 'Course' },
  };

  const config = typeConfig[content.type];

  if (isExpired) {
    return (
      <div className="group relative rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 overflow-hidden">
        <div className="relative aspect-video">
          {content.thumbnailUrl ? (
            <Image src={content.thumbnailUrl} alt={content.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
              <span className="text-6xl">{config.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-space/90 via-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
              🎉 NOW AVAILABLE
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white">{content.title}</h3>
          <a 
            href={`/content/${content.id}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-neon-cyan py-2 font-semibold text-black"
          >
            Watch Now →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video">
        {content.thumbnailUrl ? (
          <Image src={content.thumbnailUrl} alt={content.title} fill className="object-cover opacity-50" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <span className="text-6xl opacity-30">{config.icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-deep-space/50" />
        
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl">🔒</span>
            <p className="mt-2 text-sm text-gray-400">Unlocks in</p>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs text-white">
            {config.icon} {config.label}
          </span>
        </div>

        {/* Premium badge */}
        {content.isPremium && (
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-cat-eye px-3 py-1 text-xs font-bold text-black">
              PRO
            </span>
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="p-4">
        <h3 className="font-semibold text-white">{content.title}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{content.description}</p>
        {content.instructor && (
          <p className="text-xs text-neon-cyan mt-2">with {content.instructor}</p>
        )}
      </div>

      {/* Countdown */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-center gap-3">
          {days > 0 && <CountdownDigit value={days} label="Days" />}
          <CountdownDigit value={hours} label="Hours" />
          <span className="text-2xl font-bold text-white mb-4">:</span>
          <CountdownDigit value={minutes} label="Min" />
          <span className="text-2xl font-bold text-white mb-4">:</span>
          <CountdownDigit value={seconds} label="Sec" />
        </div>
      </div>

      {/* Notify button */}
      <div className="px-4 pb-4">
        <button className="w-full rounded-full border border-white/10 py-2 text-sm text-gray-400 hover:border-neon-cyan/50 hover:text-neon-cyan transition-colors">
          🔔 Notify Me
        </button>
      </div>
    </div>
  );
}

// Mini countdown for dashboard
export function MiniCountdown({ content }: { content: ContentDrop }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(content.unlockAt);

  if (isExpired) {
    return (
      <a 
        href={`/content/${content.id}`}
        className="flex items-center gap-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 p-3"
      >
        <span className="text-xl">🎉</span>
        <div className="flex-1">
          <p className="font-medium text-white text-sm">{content.title}</p>
          <p className="text-xs text-neon-cyan">Now available!</p>
        </div>
        <span className="text-white">→</span>
      </a>
    );
  }

  const timeString = days > 0 
    ? `${days}d ${hours}h`
    : `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
      <span className="text-xl">⏰</span>
      <div className="flex-1">
        <p className="font-medium text-white text-sm truncate">{content.title}</p>
        <p className="text-xs text-gray-400">Unlocks in {timeString}</p>
      </div>
    </div>
  );
}

// Drip content schedule
export function DripContentSchedule({ drops }: { drops: ContentDrop[] }) {
  const sortedDrops = [...drops].sort((a, b) => 
    new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Coming Soon</h2>
        <span className="text-sm text-gray-400">{drops.length} upcoming</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedDrops.map((drop) => (
          <ContentCountdownCard key={drop.id} content={drop} />
        ))}
      </div>
    </div>
  );
}

// Floating countdown banner
export function CountdownBanner({ content, onDismiss }: { content: ContentDrop; onDismiss: () => void }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(content.unlockAt);

  if (isExpired) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-slide-up">
      <div className="rounded-2xl border border-neon-purple/30 bg-deep-space/95 backdrop-blur-md p-4 shadow-lg shadow-neon-purple/10">
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-pink-500">
            <span className="text-xl">⏰</span>
          </div>
          <div>
            <p className="text-xs text-gray-400">Dropping soon</p>
            <p className="font-semibold text-white">{content.title}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-neon-cyan font-mono">
              {days > 0 && `${days}d `}{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
