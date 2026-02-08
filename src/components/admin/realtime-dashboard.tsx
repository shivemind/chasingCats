'use client';

import { useState, useEffect } from 'react';

interface RealtimeStats {
  activeUsers: number;
  activeUsersChange: number;
  currentlyWatching: number;
  videoPlays: number;
  signupsToday: number;
  signupsChange: number;
  conversionsToday: number;
  revenueToday: number;
  topContent: { id: string; title: string; viewers: number }[];
  recentActivity: { id: string; type: string; user: string; action: string; timestamp: string }[];
  usersByCountry: { country: string; count: number; flag: string }[];
  usersByDevice: { device: string; count: number; percent: number }[];
}

interface RealtimeDashboardProps {
  initialStats: RealtimeStats;
  onRefresh: () => Promise<RealtimeStats>;
}

export function RealtimeDashboard({ initialStats, onRefresh }: RealtimeDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(async () => {
      const newStats = await onRefresh();
      setStats(newStats);
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, onRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Real-Time Dashboard</h2>
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className={`text-sm ${isLive ? 'text-green-400' : 'text-gray-400'}`}>
              {isLive ? '🟢 Live' : '⏸️ Paused'}
            </span>
            <div
              onClick={() => setIsLive(!isLive)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                isLive ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isLive ? 'translate-x-6' : ''
              }`} />
            </div>
          </label>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Users"
          value={stats.activeUsers}
          change={stats.activeUsersChange}
          icon="👥"
          live
        />
        <MetricCard
          label="Currently Watching"
          value={stats.currentlyWatching}
          icon="▶️"
          live
          color="neon-cyan"
        />
        <MetricCard
          label="Signups Today"
          value={stats.signupsToday}
          change={stats.signupsChange}
          icon="✨"
          color="neon-purple"
        />
        <MetricCard
          label="Revenue Today"
          value={`$${stats.revenueToday.toLocaleString()}`}
          icon="💰"
          color="cat-eye"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Top Content */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">🔥 Top Content Now</h3>
          <div className="space-y-3">
            {stats.topContent.map((content, i) => (
              <div key={content.id} className="flex items-center gap-3">
                <span className={`text-lg font-bold ${
                  i === 0 ? 'text-cat-eye' : i === 1 ? 'text-gray-300' : 'text-amber-600'
                }`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{content.title}</p>
                  <p className="text-xs text-gray-500">{content.viewers} watching</p>
                </div>
                <div className="flex items-center gap-1 text-neon-cyan">
                  <span className="animate-pulse">●</span>
                  <span className="text-sm">{content.viewers}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic & Device Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users by Country */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">🌍 Active Users by Country</h3>
          <div className="space-y-3">
            {stats.usersByCountry.map((country) => (
              <div key={country.country} className="flex items-center gap-3">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white">{country.country}</span>
                    <span className="text-gray-400">{country.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                      style={{ width: `${(country.count / stats.activeUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Device */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">📱 Users by Device</h3>
          <div className="flex items-center justify-center gap-8">
            {stats.usersByDevice.map((device) => (
              <div key={device.device} className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={device.device === 'Desktop' ? '#00D9FF' : device.device === 'Mobile' ? '#A855F7' : '#F59E0B'}
                      strokeWidth="8"
                      strokeDasharray={`${device.percent * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{device.percent}%</span>
                  </div>
                </div>
                <p className="mt-2 text-gray-400">{device.device}</p>
                <p className="text-sm text-white">{device.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Visitor Map Placeholder */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">🗺️ Live Visitor Map</h3>
        <div className="h-64 rounded-lg bg-deep-space/50 flex items-center justify-center border border-white/10">
          <div className="text-center text-gray-500">
            <p className="text-3xl mb-2">🌐</p>
            <p>Interactive map visualization</p>
            <p className="text-xs mt-1">Requires map integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number;
  icon: string;
  live?: boolean;
  color?: 'neon-cyan' | 'neon-purple' | 'cat-eye';
}

function MetricCard({ label, value, change, icon, live, color }: MetricCardProps) {
  const colorClasses = {
    'neon-cyan': 'text-neon-cyan',
    'neon-purple': 'text-neon-purple',
    'cat-eye': 'text-cat-eye',
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${color ? colorClasses[color] : 'text-white'}`}>
          {value}
        </span>
        {live && (
          <span className="text-green-400 text-sm animate-pulse mb-1">● live</span>
        )}
      </div>
      {change !== undefined && (
        <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from yesterday
        </p>
      )}
    </div>
  );
}

interface ActivityItemProps {
  activity: { id: string; type: string; user: string; action: string; timestamp: string };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'signup': return '✨';
      case 'purchase': return '💳';
      case 'lesson': return '▶️';
      case 'badge': return '🏅';
      case 'comment': return '💬';
      default: return '📌';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'signup': return 'bg-green-500/20 border-green-500/30';
      case 'purchase': return 'bg-cat-eye/20 border-cat-eye/30';
      case 'lesson': return 'bg-neon-cyan/20 border-neon-cyan/30';
      case 'badge': return 'bg-neon-purple/20 border-neon-purple/30';
      default: return 'bg-white/10 border-white/20';
    }
  };

  const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${getColor(activity.type)}`}>
      <span className="text-xl">{getIcon(activity.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white">
          <span className="font-medium">{activity.user}</span>
          <span className="text-gray-400"> {activity.action}</span>
        </p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(activity.timestamp)}</span>
    </div>
  );
}
