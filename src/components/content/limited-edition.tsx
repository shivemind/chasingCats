'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LimitedContent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  instructor: string;
  duration: number;
  expiresAt: string;
  totalSpots?: number;
  claimedSpots?: number;
  type: 'workshop' | 'masterclass' | 'bundle';
  originalPrice: number;
  currentPrice: number;
  slug: string;
}

// Limited edition content card
export function LimitedEditionCard({ content }: { content: LimitedContent }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(content.expiresAt).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isExpired: false,
      };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [content.expiresAt]);

  if (timeLeft.isExpired) return null;

  const spotsLeft = content.totalSpots && content.claimedSpots 
    ? content.totalSpots - content.claimedSpots 
    : null;
  const discount = Math.round((1 - content.currentPrice / content.originalPrice) * 100);

  return (
    <div className="group relative rounded-2xl border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 overflow-hidden animate-pulse-border">
      {/* Urgency banner */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 py-1 px-3 text-center text-xs font-bold text-white z-10">
        ⚡ LIMITED TIME OFFER - {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s LEFT
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video mt-6">
        {content.thumbnailUrl ? (
          <Image src={content.thumbnailUrl} alt={content.title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent" />

        {/* Discount badge */}
        <div className="absolute top-4 right-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
          -{discount}%
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <span className="inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400 mb-2">
          🔥 {content.type.toUpperCase()}
        </span>
        <h3 className="text-xl font-bold text-white">{content.title}</h3>
        <p className="text-sm text-gray-400 mt-2">{content.description}</p>
        <p className="text-xs text-neon-cyan mt-2">with {content.instructor} • {content.duration}h</p>

        {/* Spots remaining */}
        {spotsLeft !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Spots remaining</span>
              <span className="text-red-400 font-bold">{spotsLeft} left!</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                style={{ width: `${((content.claimedSpots || 0) / (content.totalSpots || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold text-white">${content.currentPrice}</span>
          <span className="text-lg text-gray-500 line-through">${content.originalPrice}</span>
        </div>

        {/* CTA */}
        <Link
          href={`/content/${content.slug}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 py-3 font-bold text-white hover:opacity-90 transition-opacity"
        >
          🔒 Claim Before It&apos;s Gone
        </Link>
      </div>
    </div>
  );
}

// Limited edition banner for homepage
export function LimitedEditionBanner({ content, onDismiss }: { content: LimitedContent; onDismiss: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(content.expiresAt).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isExpired: false,
      };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [content.expiresAt]);

  if (timeLeft.isExpired) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-500 to-orange-500 py-3 px-4">
      <button
        onClick={onDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
      >
        ✕
      </button>
      
      <div className="flex items-center justify-center gap-4 text-white">
        <span className="text-lg">🔥</span>
        <span className="font-semibold">{content.title}</span>
        <span className="text-sm opacity-80">ends in</span>
        <span className="font-mono font-bold bg-black/20 px-2 py-1 rounded">
          {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <Link 
          href={`/content/${content.slug}`}
          className="rounded-full bg-white px-4 py-1 text-sm font-bold text-red-500 hover:bg-gray-100"
        >
          Get It Now →
        </Link>
      </div>
    </div>
  );
}

// Vault of expired limited content
export function ExpiredContentVault({ expiredContent }: { expiredContent: LimitedContent[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔐</span>
        <div>
          <h3 className="font-semibold text-white">The Vault</h3>
          <p className="text-xs text-gray-400">Missed these? They might return...</p>
        </div>
      </div>

      <div className="space-y-3">
        {expiredContent.map((content) => (
          <div 
            key={content.id}
            className="flex items-center gap-3 rounded-xl bg-white/5 p-3 opacity-60"
          >
            <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-white/10 grayscale">
              {content.thumbnailUrl && (
                <Image src={content.thumbnailUrl} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">{content.title}</p>
              <p className="text-xs text-gray-500">Expired • Was ${content.currentPrice}</p>
            </div>
            <button className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-400">
              🔔 Notify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
