'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'completed_course' | 'earned_badge' | 'joined' | 'photo_uploaded' | 'challenge_entered' | 'level_up' | 'streak' | 'comment' | 'followed';
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  targetUser?: {
    id: string;
    name: string;
  };
  content?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
  };
  badge?: {
    name: string;
    icon: string;
  };
  level?: number;
  streak?: number;
  photoUrl?: string;
  timestamp: string;
}

const activityConfig: Record<ActivityItem['type'], { icon: string; template: string; color: string }> = {
  completed_course: { icon: '🎓', template: 'completed', color: 'text-green-400' },
  earned_badge: { icon: '🏆', template: 'earned the badge', color: 'text-cat-eye' },
  joined: { icon: '👋', template: 'joined the club', color: 'text-neon-cyan' },
  photo_uploaded: { icon: '📸', template: 'shared a photo', color: 'text-blue-400' },
  challenge_entered: { icon: '🎯', template: 'entered the challenge', color: 'text-purple-400' },
  level_up: { icon: '⚡', template: 'reached level', color: 'text-neon-purple' },
  streak: { icon: '🔥', template: 'is on a', color: 'text-orange-400' },
  comment: { icon: '💬', template: 'commented on', color: 'text-gray-400' },
  followed: { icon: '🤝', template: 'started following', color: 'text-pink-400' },
};

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ActivityFeedItem({ activity }: { activity: ActivityItem }) {
  const config = activityConfig[activity.type];

  const renderContent = () => {
    switch (activity.type) {
      case 'completed_course':
        return (
          <>
            <span className={config.color}>{config.template}</span>{' '}
            <Link href={`/content/${activity.content?.slug}`} className="font-semibold text-white hover:text-neon-cyan">
              {activity.content?.title}
            </Link>
          </>
        );
      case 'earned_badge':
        return (
          <>
            <span className={config.color}>{config.template}</span>{' '}
            <span className="font-semibold text-white">{activity.badge?.icon} {activity.badge?.name}</span>
          </>
        );
      case 'level_up':
        return (
          <>
            <span className={config.color}>{config.template}</span>{' '}
            <span className="font-semibold text-neon-purple">{activity.level}</span>
          </>
        );
      case 'streak':
        return (
          <>
            <span className={config.color}>{config.template}</span>{' '}
            <span className="font-semibold text-orange-400">{activity.streak} day streak! 🔥</span>
          </>
        );
      case 'followed':
        return (
          <>
            <span className={config.color}>{config.template}</span>{' '}
            <Link href={`/members/${activity.targetUser?.id}`} className="font-semibold text-white hover:text-neon-cyan">
              {activity.targetUser?.name}
            </Link>
          </>
        );
      case 'comment':
        return (
          <>
            <span className={config.color}>{config.template}</span>{' '}
            <Link href={`/content/${activity.content?.slug}`} className="font-semibold text-white hover:text-neon-cyan">
              {activity.content?.title}
            </Link>
          </>
        );
      default:
        return <span className={config.color}>{config.template}</span>;
    }
  };

  return (
    <div className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
      {/* Avatar */}
      <Link href={`/members/${activity.user.id}`} className="flex-shrink-0">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/10">
          {activity.user.avatarUrl ? (
            <Image src={activity.user.avatarUrl} alt={activity.user.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white">
              {activity.user.name[0]}
            </div>
          )}
          {/* Activity icon badge */}
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-deep-space border-2 border-deep-space text-xs">
            {config.icon}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">
          <Link href={`/members/${activity.user.id}`} className="font-semibold text-white hover:text-neon-cyan">
            {activity.user.name}
          </Link>{' '}
          {renderContent()}
        </p>
        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
      </div>

      {/* Thumbnail if applicable */}
      {(activity.content?.thumbnailUrl || activity.photoUrl) && (
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/10">
            <Image 
              src={activity.photoUrl || activity.content?.thumbnailUrl || ''} 
              alt="" 
              width={48} 
              height={48} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityFeed({ 
  activities, 
  onLoadMore,
  hasMore = true,
  isLoading = false 
}: { 
  activities: ActivityItem[]; 
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📢</span>
          <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
        {activities.map((activity) => (
          <ActivityFeedItem key={activity.id} activity={activity} />
        ))}
        
        {activities.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <span className="text-4xl">🦗</span>
            <p className="mt-2">No recent activity</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="border-t border-white/10 p-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full rounded-xl bg-white/5 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

// Compact feed for sidebar
export function ActivityFeedCompact({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="space-y-2">
      {activities.slice(0, 5).map((activity) => {
        const config = activityConfig[activity.type];
        return (
          <div key={activity.id} className="flex items-center gap-2 text-xs">
            <span>{config.icon}</span>
            <span className="text-gray-400 truncate">
              <span className="text-white font-medium">{activity.user.name}</span>{' '}
              {config.template}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Real-time activity notification
export function ActivityNotification({ activity, onClose }: { activity: ActivityItem; onClose: () => void }) {
  const config = activityConfig[activity.type];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-deep-space/95 backdrop-blur-md px-4 py-3 shadow-xl max-w-sm">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {activity.user.avatarUrl ? (
            <Image src={activity.user.avatarUrl} alt={activity.user.name} width={32} height={32} />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm">
              {activity.user.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">
            <span className="font-semibold">{activity.user.name}</span>{' '}
            <span className={config.color}>{config.template}</span>
          </p>
        </div>
        <span className="text-lg">{config.icon}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
    </div>
  );
}
