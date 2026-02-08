'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ActivityEvent {
  id: string;
  type: 'lesson_completed' | 'lesson_started' | 'badge_earned' | 'payment' | 'login' | 'profile_update' | 'subscription_change' | 'comment' | 'challenge_entry' | 'support_ticket';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface UserActivityTimelineProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  activities: ActivityEvent[];
  onLoadMore: () => void;
  hasMore: boolean;
}

const EVENT_ICONS: Record<ActivityEvent['type'], string> = {
  lesson_completed: '✅',
  lesson_started: '▶️',
  badge_earned: '🏅',
  payment: '💳',
  login: '🔑',
  profile_update: '👤',
  subscription_change: '📋',
  comment: '💬',
  challenge_entry: '📸',
  support_ticket: '🎫',
};

const EVENT_COLORS: Record<ActivityEvent['type'], string> = {
  lesson_completed: 'bg-green-500/20 border-green-500/30',
  lesson_started: 'bg-blue-500/20 border-blue-500/30',
  badge_earned: 'bg-cat-eye/20 border-cat-eye/30',
  payment: 'bg-neon-cyan/20 border-neon-cyan/30',
  login: 'bg-white/10 border-white/20',
  profile_update: 'bg-purple-500/20 border-purple-500/30',
  subscription_change: 'bg-orange-500/20 border-orange-500/30',
  comment: 'bg-pink-500/20 border-pink-500/30',
  challenge_entry: 'bg-neon-purple/20 border-neon-purple/30',
  support_ticket: 'bg-yellow-500/20 border-yellow-500/30',
};

export function UserActivityTimeline({ 
  userId, 
  userName, 
  userAvatar, 
  activities, 
  onLoadMore, 
  hasMore 
}: UserActivityTimelineProps) {
  const [filter, setFilter] = useState<ActivityEvent['type'] | 'all'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const filteredActivities = activities.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false;
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(a.timestamp) < cutoff) return false;
    }
    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityEvent[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={48} height={48} />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl">
                {userName[0]}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Activity Timeline</h2>
            <p className="text-sm text-gray-400">{userName}</p>
          </div>
        </div>

        {/* Export */}
        <button className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
          📥 Export Log
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="all">All Activities</option>
          <option value="lesson_completed">Lessons Completed</option>
          <option value="lesson_started">Lessons Started</option>
          <option value="badge_earned">Badges Earned</option>
          <option value="payment">Payments</option>
          <option value="login">Logins</option>
          <option value="subscription_change">Subscription Changes</option>
          <option value="comment">Comments</option>
          <option value="challenge_entry">Challenge Entries</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>

        <span className="flex items-center text-sm text-gray-400">
          {filteredActivities.length} activities
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([date, events]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-gray-400 mb-4">{date}</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <ActivityEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm text-white hover:bg-white/20"
          >
            Load More
          </button>
        </div>
      )}

      {filteredActivities.length === 0 && (
        <div className="rounded-xl bg-white/5 p-12 text-center text-gray-500">
          No activities found for the selected filters.
        </div>
      )}
    </div>
  );
}

function ActivityEventCard({ event }: { event: ActivityEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border ${EVENT_COLORS[event.type]} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{EVENT_ICONS[event.type]}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-white">{event.title}</p>
            <span className="text-xs text-gray-500">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{event.description}</p>

          {/* Expandable metadata */}
          {(event.metadata || event.ipAddress) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-neon-cyan mt-2 hover:underline"
            >
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          )}

          {expanded && (
            <div className="mt-3 rounded-lg bg-black/20 p-3 text-xs space-y-1">
              {event.ipAddress && (
                <p className="text-gray-400">
                  <span className="text-gray-500">IP:</span> {event.ipAddress}
                </p>
              )}
              {event.userAgent && (
                <p className="text-gray-400">
                  <span className="text-gray-500">Device:</span> {event.userAgent}
                </p>
              )}
              {event.metadata && Object.entries(event.metadata).map(([key, value]) => (
                <p key={key} className="text-gray-400">
                  <span className="text-gray-500 capitalize">{key}:</span> {String(value)}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick stats component
export function ActivityQuickStats({ activities }: { activities: ActivityEvent[] }) {
  const last7Days = activities.filter(a => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return new Date(a.timestamp) > cutoff;
  });

  const stats = {
    lessonsCompleted: last7Days.filter(a => a.type === 'lesson_completed').length,
    logins: last7Days.filter(a => a.type === 'login').length,
    payments: last7Days.filter(a => a.type === 'payment').length,
    comments: last7Days.filter(a => a.type === 'comment').length,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded-xl bg-white/5 p-4 text-center">
        <p className="text-2xl font-bold text-green-400">{stats.lessonsCompleted}</p>
        <p className="text-xs text-gray-500">Lessons (7d)</p>
      </div>
      <div className="rounded-xl bg-white/5 p-4 text-center">
        <p className="text-2xl font-bold text-white">{stats.logins}</p>
        <p className="text-xs text-gray-500">Logins (7d)</p>
      </div>
      <div className="rounded-xl bg-white/5 p-4 text-center">
        <p className="text-2xl font-bold text-neon-cyan">{stats.payments}</p>
        <p className="text-xs text-gray-500">Payments (7d)</p>
      </div>
      <div className="rounded-xl bg-white/5 p-4 text-center">
        <p className="text-2xl font-bold text-pink-400">{stats.comments}</p>
        <p className="text-xs text-gray-500">Comments (7d)</p>
      </div>
    </div>
  );
}
