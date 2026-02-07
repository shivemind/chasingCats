'use client';

import { useEffect } from 'react';

// Badge definitions
export const BADGES = {
  // Viewing achievements
  first_video: {
    id: 'first_video',
    name: 'First Steps',
    description: 'Watch your first video',
    icon: '🎬',
    color: 'from-blue-500 to-cyan-500',
    requirement: { type: 'videos_watched', count: 1 },
  },
  binge_watcher: {
    id: 'binge_watcher',
    name: 'Binge Watcher',
    description: 'Watch 10 videos',
    icon: '📺',
    color: 'from-purple-500 to-pink-500',
    requirement: { type: 'videos_watched', count: 10 },
  },
  dedicated_learner: {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Watch 50 videos',
    icon: '🎓',
    color: 'from-yellow-500 to-orange-500',
    requirement: { type: 'videos_watched', count: 50 },
  },
  
  // Event achievements
  first_event: {
    id: 'first_event',
    name: 'Event Explorer',
    description: 'Attend your first live event',
    icon: '🎪',
    color: 'from-green-500 to-emerald-500',
    requirement: { type: 'events_attended', count: 1 },
  },
  event_regular: {
    id: 'event_regular',
    name: 'Event Regular',
    description: 'Attend 5 live events',
    icon: '⭐',
    color: 'from-amber-500 to-yellow-500',
    requirement: { type: 'events_attended', count: 5 },
  },
  
  // Membership achievements
  founding_member: {
    id: 'founding_member',
    name: 'Founding Member',
    description: 'One of the first 100 members',
    icon: '🏆',
    color: 'from-yellow-400 to-amber-600',
    requirement: { type: 'special', count: 0 },
  },
  loyal_cat: {
    id: 'loyal_cat',
    name: 'Loyal Cat',
    description: 'Member for 6 months',
    icon: '😺',
    color: 'from-neon-cyan to-neon-purple',
    requirement: { type: 'membership_months', count: 6 },
  },
  
  // Engagement achievements
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Join an event before it starts',
    icon: '🌅',
    color: 'from-orange-400 to-red-500',
    requirement: { type: 'early_joins', count: 1 },
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Watch content after midnight',
    icon: '🦉',
    color: 'from-indigo-500 to-purple-600',
    requirement: { type: 'night_views', count: 1 },
  },
  
  // Special badges
  cat_whisperer: {
    id: 'cat_whisperer',
    name: 'Cat Whisperer',
    description: 'Complete all cat photography courses',
    icon: '🐱',
    color: 'from-pink-500 to-rose-500',
    requirement: { type: 'courses_completed', count: 5 },
  },
} as const;

export type BadgeId = keyof typeof BADGES;
export type Badge = typeof BADGES[BadgeId];

interface UserBadge {
  badgeId: BadgeId;
  earnedAt: string;
  progress?: number; // 0-100
}

// Badge Display Component
export function BadgeDisplay({ 
  badge, 
  earned = false,
  progress = 0,
  size = 'md' 
}: { 
  badge: Badge; 
  earned?: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-12 w-12 text-xl',
    md: 'h-16 w-16 text-2xl',
    lg: 'h-24 w-24 text-4xl',
  };

  return (
    <div className="group relative">
      <div 
        className={`relative flex items-center justify-center rounded-full ${sizeClasses[size]} transition-all duration-300 ${
          earned 
            ? `bg-gradient-to-br ${badge.color} shadow-lg hover:scale-110 hover:shadow-xl` 
            : 'bg-white/5 border border-white/10 grayscale opacity-50'
        }`}
      >
        <span className={earned ? '' : 'opacity-50'}>{badge.icon}</span>
        
        {/* Progress ring for incomplete badges */}
        {!earned && progress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="#9b5de5" />
              </linearGradient>
            </defs>
          </svg>
        )}
        
        {/* Glow effect for earned badges */}
        {earned && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.color} blur-md opacity-50 -z-10`} />
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-deep-space border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <p className="font-semibold text-white text-sm">{badge.name}</p>
        <p className="text-xs text-gray-400">{badge.description}</p>
        {!earned && progress > 0 && (
          <p className="text-xs text-neon-cyan mt-1">{Math.round(progress)}% complete</p>
        )}
      </div>
    </div>
  );
}

// Badge Grid for Profile
export function BadgeGrid({ userBadges }: { userBadges: UserBadge[] }) {
  const earnedBadgeIds = new Set(userBadges.map(b => b.badgeId));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Achievements</h3>
        <span className="text-sm text-gray-400">
          {userBadges.length} / {Object.keys(BADGES).length} earned
        </span>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {Object.values(BADGES).map((badge) => {
          const userBadge = userBadges.find(b => b.badgeId === badge.id);
          return (
            <BadgeDisplay
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.has(badge.id as BadgeId)}
              progress={userBadge?.progress}
              size="sm"
            />
          );
        })}
      </div>
    </div>
  );
}

// Badge Notification (when earned)
export function BadgeEarnedNotification({ 
  badge, 
  onClose 
}: { 
  badge: Badge; 
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-deep-space border border-white/10 rounded-3xl p-8 text-center max-w-sm mx-4 animate-scale-in">
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#00f5d4', '#9b5de5', '#ffd700', '#f72585'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-neon-cyan font-semibold uppercase tracking-wider mb-4">
            🎉 Achievement Unlocked!
          </p>
          
          <div className="flex justify-center mb-4">
            <BadgeDisplay badge={badge} earned size="lg" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{badge.name}</h2>
          <p className="text-gray-400 mb-6">{badge.description}</p>
          
          <button
            onClick={onClose}
            className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white transition hover:opacity-90"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

// Featured badges for profile header
export function FeaturedBadges({ userBadges }: { userBadges: UserBadge[] }) {
  // Show top 3 most recent badges
  const featured = userBadges
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <div className="flex gap-2">
      {featured.map((ub) => {
        const badge = BADGES[ub.badgeId];
        return badge ? (
          <BadgeDisplay key={ub.badgeId} badge={badge} earned size="sm" />
        ) : null;
      })}
    </div>
  );
}
