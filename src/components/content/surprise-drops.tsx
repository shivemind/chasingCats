'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SurpriseDrop {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  type: 'video' | 'preset' | 'workshop' | 'ebook' | 'bundle';
  instructor?: string;
  droppedAt: string;
  expiresAt?: string;
  claimCount: number;
  maxClaims?: number;
  isClaimed: boolean;
  value: number;
}

// Surprise drop notification popup
export function SurpriseDropPopup({ 
  drop, 
  isOpen, 
  onClose,
  onClaim 
}: { 
  drop: SurpriseDrop; 
  isOpen: boolean; 
  onClose: () => void;
  onClaim: () => void;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isOpen) return null;

  const typeConfig = {
    video: { icon: '🎬', label: 'Exclusive Video' },
    preset: { icon: '🎨', label: 'Preset Pack' },
    workshop: { icon: '🎓', label: 'Live Workshop' },
    ebook: { icon: '📚', label: 'E-Book' },
    bundle: { icon: '🎁', label: 'Content Bundle' },
  };

  const config = typeConfig[drop.type];
  const spotsLeft = drop.maxClaims ? drop.maxClaims - drop.claimCount : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4">
        {!isRevealed ? (
          // Mystery box state
          <div className="relative animate-scale-in">
            <div className="rounded-3xl border-4 border-cat-eye/50 bg-deep-space p-8 text-center">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-cat-eye/20 blur-2xl" />
              
              <div className="relative">
                <div className="mx-auto h-32 w-32 relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cat-eye to-orange-500 animate-pulse" />
                  <div className="absolute inset-2 rounded-xl bg-deep-space flex items-center justify-center">
                    <span className="text-6xl animate-bounce">🎁</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mt-6">Surprise Drop!</h2>
                <p className="text-gray-400 mt-2">You&apos;ve received an exclusive reward</p>

                <button
                  onClick={() => setIsRevealed(true)}
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-cat-eye to-orange-500 py-4 text-lg font-bold text-black hover:opacity-90 transition-opacity"
                >
                  ✨ Reveal Your Reward
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Revealed state
          <div className="rounded-3xl border border-white/10 bg-deep-space overflow-hidden animate-scale-in">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white/50 hover:text-white"
            >
              ✕
            </button>

            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#00F5D4', '#B794F6', '#FFD700', '#FF6B6B'][i % 4],
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative">
              {/* Thumbnail */}
              <div className="relative aspect-video">
                {drop.thumbnailUrl ? (
                  <Image src={drop.thumbnailUrl} alt={drop.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cat-eye/20 to-orange-500/20">
                    <span className="text-8xl">{config.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent" />

                {/* Type badge */}
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-cat-eye px-3 py-1 text-xs font-bold text-black">
                    {config.icon} {config.label}
                  </span>
                </div>

                {/* Value badge */}
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs text-white">
                    ${drop.value} value
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white">{drop.title}</h2>
                <p className="text-gray-400 mt-2">{drop.description}</p>
                {drop.instructor && (
                  <p className="text-sm text-neon-cyan mt-2">by {drop.instructor}</p>
                )}

                {/* Scarcity */}
                {spotsLeft !== null && (
                  <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3">
                    <p className="text-red-400 text-sm font-medium">
                      ⚡ Only {spotsLeft} claims remaining!
                    </p>
                  </div>
                )}

                {/* CTA */}
                {drop.isClaimed ? (
                  <Link
                    href={`/content/${drop.id}`}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-neon-cyan py-4 font-bold text-black"
                  >
                    View Your Reward →
                  </Link>
                ) : (
                  <button
                    onClick={onClaim}
                    className="mt-6 w-full rounded-full bg-gradient-to-r from-cat-eye to-orange-500 py-4 font-bold text-black hover:opacity-90 transition-opacity"
                  >
                    🎉 Claim Now - FREE
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Surprise drop notification toast
export function SurpriseDropToast({ drop, onView }: { drop: SurpriseDrop; onView: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-40 animate-slide-up">
      <div className="flex items-center gap-4 rounded-2xl border border-cat-eye/30 bg-deep-space/95 backdrop-blur-md p-4 shadow-lg shadow-cat-eye/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cat-eye to-orange-500">
          <span className="text-2xl">🎁</span>
        </div>
        <div>
          <p className="text-xs text-cat-eye font-medium">SURPRISE DROP!</p>
          <p className="font-semibold text-white">{drop.title}</p>
        </div>
        <button
          onClick={onView}
          className="rounded-full bg-cat-eye px-4 py-2 text-sm font-bold text-black"
        >
          View
        </button>
      </div>
    </div>
  );
}

// Recent drops gallery
export function RecentDropsGallery({ drops }: { drops: SurpriseDrop[] }) {
  const claimedDrops = drops.filter(d => d.isClaimed);
  const availableDrops = drops.filter(d => !d.isClaimed);

  return (
    <div className="space-y-6">
      {/* Available drops */}
      {availableDrops.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-cat-eye animate-pulse" />
            <h3 className="text-lg font-semibold text-white">Unclaimed Drops</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {availableDrops.map((drop) => (
              <SurpriseDropCard key={drop.id} drop={drop} />
            ))}
          </div>
        </div>
      )}

      {/* Claimed drops */}
      {claimedDrops.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Your Collection</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {claimedDrops.map((drop) => (
              <SurpriseDropCard key={drop.id} drop={drop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual drop card
function SurpriseDropCard({ drop }: { drop: SurpriseDrop }) {
  const typeConfig = {
    video: { icon: '🎬', label: 'Video' },
    preset: { icon: '🎨', label: 'Preset' },
    workshop: { icon: '🎓', label: 'Workshop' },
    ebook: { icon: '📚', label: 'E-Book' },
    bundle: { icon: '🎁', label: 'Bundle' },
  };

  const config = typeConfig[drop.type];

  return (
    <Link
      href={`/content/${drop.id}`}
      className={`group rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] ${
        drop.isClaimed 
          ? 'border-white/10 bg-deep-space/50' 
          : 'border-cat-eye/30 bg-gradient-to-br from-cat-eye/10 to-orange-500/10'
      }`}
    >
      <div className="relative aspect-video">
        {drop.thumbnailUrl ? (
          <Image src={drop.thumbnailUrl} alt={drop.title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-white/5">
            <span className="text-4xl">{config.icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-space/80 via-transparent" />

        <div className="absolute top-2 left-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            drop.isClaimed ? 'bg-white/10 text-gray-400' : 'bg-cat-eye text-black'
          }`}>
            {config.label}
          </span>
        </div>

        {drop.isClaimed && (
          <div className="absolute top-2 right-2">
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
              ✓ Claimed
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-medium text-white group-hover:text-neon-cyan transition-colors">
          {drop.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Dropped {new Date(drop.droppedAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

// Enable surprise drops toggle
export function SurpriseDropsToggle({ 
  enabled, 
  onToggle 
}: { 
  enabled: boolean; 
  onToggle: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎁</span>
        <div>
          <p className="font-medium text-white">Surprise Drops</p>
          <p className="text-xs text-gray-500">Get notified about exclusive content drops</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-neon-cyan' : 'bg-white/10'
        }`}
      >
        <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}
