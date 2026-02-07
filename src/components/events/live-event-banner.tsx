'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LiveEvent {
  id: string;
  title: string;
  slug: string;
  zoomLink: string | null;
  startTime: Date;
  endTime: Date | null;
  host: string | null;
}

interface LiveEventBannerProps {
  event: LiveEvent | null;
}

export function LiveEventBanner({ event }: LiveEventBannerProps) {
  const [isLive, setIsLive] = useState(false);
  const [timeUntilLive, setTimeUntilLive] = useState<string | null>(null);

  useEffect(() => {
    if (!event) return;

    const checkLiveStatus = () => {
      const now = new Date();
      const start = new Date(event.startTime);
      const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2hr duration

      if (now >= start && now <= end) {
        setIsLive(true);
        setTimeUntilLive(null);
      } else if (now < start) {
        setIsLive(false);
        const diff = start.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours < 24) {
          setTimeUntilLive(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
        } else {
          setTimeUntilLive(null);
        }
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  if (isLive) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg">
        <div className="container-section flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            {/* Pulsing LIVE badge */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
              </span>
              <span className="text-sm font-bold uppercase tracking-wider">LIVE NOW</span>
            </div>
            <span className="hidden sm:inline text-sm font-medium">{event.title}</span>
          </div>
          
          {event.zoomLink ? (
            <a
              href={event.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-bold text-red-600 transition-all hover:scale-105 hover:shadow-xl"
            >
              <svg className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
              Join Now
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          ) : (
            <Link
              href={`/events/${event.slug}`}
              className="rounded-full bg-white px-6 py-2 text-sm font-bold text-red-600 transition hover:scale-105"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (timeUntilLive) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-neon-purple via-neon-cyan to-brand text-white">
        <div className="container-section flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              STARTING IN {timeUntilLive}
            </span>
            <span className="hidden sm:inline text-sm">{event.title}</span>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="text-sm font-semibold hover:underline"
          >
            Set Reminder →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

// Compact version for dashboard/cards
export function LiveBadge({ isLive }: { isLive: boolean }) {
  if (!isLive) return null;
  
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      LIVE
    </span>
  );
}
