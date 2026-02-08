'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DigestContent {
  id: string;
  title: string;
  type: 'video' | 'article' | 'challenge' | 'live';
  thumbnailUrl?: string;
  duration?: number;
  slug: string;
  reason: string;
}

interface DigestStats {
  streak: number;
  xpYesterday: number;
  lessonsCompleted: number;
  rank: number;
  rankChange: number;
}

interface DailyDigest {
  date: string;
  greeting: string;
  quote: {
    text: string;
    author: string;
  };
  stats: DigestStats;
  recommendedContent: DigestContent[];
  challenge?: {
    id: string;
    title: string;
    deadline: string;
  };
  event?: {
    id: string;
    title: string;
    startsAt: string;
  };
}

// Digest modal/popup
export function DailyDigestModal({ 
  digest, 
  isOpen, 
  onClose 
}: { 
  digest: DailyDigest; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const hour = new Date().getHours();
  const timeEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto py-8">
      <div className="w-full max-w-lg mx-4 animate-scale-in">
        <div className="rounded-3xl border border-white/10 bg-deep-space overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              ✕
            </button>
            
            <p className="text-sm text-neon-cyan">{timeEmoji} {digest.greeting}</p>
            <h2 className="text-2xl font-bold text-white mt-1">Your Daily Digest</h2>
            <p className="text-sm text-gray-400">
              {new Date(digest.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Quote */}
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-gray-300 italic">&ldquo;{digest.quote.text}&rdquo;</p>
            <p className="text-sm text-gray-500 mt-1">— {digest.quote.author}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-cyan">{digest.stats.streak}</p>
              <p className="text-xs text-gray-500">Day Streak 🔥</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{digest.stats.xpYesterday}</p>
              <p className="text-xs text-gray-500">XP Yesterday</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{digest.stats.lessonsCompleted}</p>
              <p className="text-xs text-gray-500">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cat-eye">#{digest.stats.rank}</p>
              <p className="text-xs text-gray-500">
                {digest.stats.rankChange > 0 ? `↑${digest.stats.rankChange}` : 
                 digest.stats.rankChange < 0 ? `↓${Math.abs(digest.stats.rankChange)}` : '—'}
              </p>
            </div>
          </div>

          {/* Recommended content */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">🎯 Picked for You Today</h3>
            <div className="space-y-3">
              {digest.recommendedContent.map((content) => (
                <Link
                  key={content.id}
                  href={`/content/${content.slug}`}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors"
                >
                  <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    {content.thumbnailUrl ? (
                      <Image src={content.thumbnailUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {content.type === 'video' ? '🎬' : 
                         content.type === 'challenge' ? '🏆' : 
                         content.type === 'live' ? '🔴' : '📖'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{content.title}</p>
                    <p className="text-xs text-gray-500">{content.reason}</p>
                  </div>
                  {content.duration && (
                    <span className="text-xs text-gray-500">{content.duration}m</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Challenge/Event reminder */}
          {(digest.challenge || digest.event) && (
            <div className="px-6 pb-6 space-y-3">
              {digest.challenge && (
                <div className="rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🏆</span>
                    <span className="text-sm font-medium text-white">Weekly Challenge</span>
                  </div>
                  <p className="text-sm text-gray-300">{digest.challenge.title}</p>
                  <p className="text-xs text-orange-400 mt-1">
                    Ends {new Date(digest.challenge.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {digest.event && (
                <div className="rounded-xl bg-gradient-to-r from-neon-purple/20 to-pink-500/20 border border-neon-purple/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📅</span>
                    <span className="text-sm font-medium text-white">Upcoming Event</span>
                  </div>
                  <p className="text-sm text-gray-300">{digest.event.title}</p>
                  <p className="text-xs text-neon-purple mt-1">
                    {new Date(digest.event.startsAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white"
            >
              Start Learning →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini digest widget for dashboard
export function DigestWidget({ digest }: { digest: DailyDigest }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Good morning! ☀️</h3>
            <p className="text-sm text-gray-400">Here&apos;s your personalized picks</p>
          </div>
          <button
            onClick={() => setShowFull(true)}
            className="text-sm text-neon-cyan hover:underline"
          >
            View Full Digest
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <span>🔥</span>
            <span className="text-sm font-medium text-white">{digest.stats.streak} day streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <span>⚡</span>
            <span className="text-sm font-medium text-white">+{digest.stats.xpYesterday} XP</span>
          </div>
        </div>

        {/* Top pick */}
        {digest.recommendedContent[0] && (
          <Link
            href={`/content/${digest.recommendedContent[0].slug}`}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-white/10 p-3 hover:border-neon-cyan/30 transition-colors"
          >
            <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
              {digest.recommendedContent[0].thumbnailUrl && (
                <Image 
                  src={digest.recommendedContent[0].thumbnailUrl} 
                  alt="" 
                  fill 
                  className="object-cover" 
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-neon-cyan">🎯 Top Pick for You</p>
              <p className="font-medium text-white mt-1">{digest.recommendedContent[0].title}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Full digest modal */}
      <DailyDigestModal
        digest={digest}
        isOpen={showFull}
        onClose={() => setShowFull(false)}
      />
    </>
  );
}

// Notification preferences
export function DigestPreferences() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [digestTime, setDigestTime] = useState('08:00');

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <h3 className="font-semibold text-white mb-4">Daily Digest Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">Email Digest</p>
            <p className="text-xs text-gray-500">Receive a morning email summary</p>
          </div>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              emailEnabled ? 'bg-neon-cyan' : 'bg-white/10'
            }`}
          >
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
              emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">Push Notification</p>
            <p className="text-xs text-gray-500">Get notified on your device</p>
          </div>
          <button
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              pushEnabled ? 'bg-neon-cyan' : 'bg-white/10'
            }`}
          >
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
              pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div>
          <label className="block text-white mb-2">Delivery Time</label>
          <input
            type="time"
            value={digestTime}
            onChange={(e) => setDigestTime(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-neon-cyan/50 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
