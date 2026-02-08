'use client';

import { useState } from 'react';

interface ContentStats {
  id: string;
  title: string;
  type: 'lesson' | 'article' | 'challenge';
  views: number;
  uniqueViews: number;
  completions: number;
  completionRate: number;
  avgWatchTime: number;
  totalWatchTime: number;
  dropOffPoints: { timestamp: number; percentage: number }[];
  engagementScore: number;
  likes: number;
  comments: number;
  shares: number;
  tier: 'free' | 'pro' | 'elite';
  publishedAt: string;
}

interface ContentPerformanceProps {
  content: ContentStats[];
  dateRange: '7d' | '30d' | '90d';
  onDateRangeChange: (range: '7d' | '30d' | '90d') => void;
}

export function ContentPerformance({ content, dateRange, onDateRangeChange }: ContentPerformanceProps) {
  const [sortBy, setSortBy] = useState<'views' | 'completionRate' | 'engagementScore' | 'avgWatchTime'>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'lesson' | 'article' | 'challenge'>('all');
  const [selectedContent, setSelectedContent] = useState<ContentStats | null>(null);

  // Calculate totals
  const totals = content.reduce((acc, c) => ({
    views: acc.views + c.views,
    completions: acc.completions + c.completions,
    watchTime: acc.watchTime + c.totalWatchTime,
    engagement: acc.engagement + c.engagementScore,
  }), { views: 0, completions: 0, watchTime: 0, engagement: 0 });

  const avgCompletionRate = content.length > 0
    ? content.reduce((acc, c) => acc + c.completionRate, 0) / content.length
    : 0;

  // Filter and sort
  const filteredContent = content
    .filter(c => filterType === 'all' || c.type === filterType)
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Content Performance</h2>
          <p className="text-sm text-gray-400">Track how your content is performing</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`rounded-lg px-4 py-2 text-sm ${
                dateRange === range ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 mb-1">Total Views</p>
          <p className="text-3xl font-bold text-white">{totals.views.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 mb-1">Completions</p>
          <p className="text-3xl font-bold text-neon-cyan">{totals.completions.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 mb-1">Avg Completion Rate</p>
          <p className="text-3xl font-bold text-neon-purple">{avgCompletionRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-400 mb-1">Total Watch Time</p>
          <p className="text-3xl font-bold text-cat-eye">{formatDuration(totals.watchTime)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="all">All Types</option>
          <option value="lesson">Lessons</option>
          <option value="article">Articles</option>
          <option value="challenge">Challenges</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as typeof sortBy);
            setSortOrder(order as typeof sortOrder);
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="views-desc">Most Viewed</option>
          <option value="views-asc">Least Viewed</option>
          <option value="completionRate-desc">Highest Completion</option>
          <option value="completionRate-asc">Lowest Completion</option>
          <option value="engagementScore-desc">Best Engagement</option>
          <option value="avgWatchTime-desc">Most Watch Time</option>
        </select>
      </div>

      {/* Content Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Content</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Completion</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Avg Watch</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Engagement</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Social</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                        item.type === 'lesson' ? 'bg-neon-cyan/20 text-neon-cyan' :
                        item.type === 'article' ? 'bg-neon-purple/20 text-neon-purple' :
                        'bg-cat-eye/20 text-cat-eye'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{item.tier}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white">{item.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{item.uniqueViews.toLocaleString()} unique</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ${
                          item.completionRate >= 70 ? 'bg-green-500' :
                          item.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{item.completionRate}%</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.completions} completed</p>
                </td>
                <td className="px-4 py-3 text-white">
                  {formatDuration(item.avgWatchTime)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xl font-bold ${getEngagementColor(item.engagementScore)}`}>
                    {item.engagementScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>❤️ {item.likes}</span>
                    <span>💬 {item.comments}</span>
                    <span>↗️ {item.shares}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedContent(item)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="font-bold text-white">{selectedContent.title}</h3>
              <button onClick={() => setSelectedContent(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{selectedContent.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Views</p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-neon-cyan">{selectedContent.completionRate}%</p>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className={`text-2xl font-bold ${getEngagementColor(selectedContent.engagementScore)}`}>
                    {selectedContent.engagementScore}
                  </p>
                  <p className="text-xs text-gray-500">Engagement Score</p>
                </div>
              </div>

              {/* Drop-off Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Viewer Retention</h4>
                <div className="h-32 flex items-end gap-0.5">
                  {selectedContent.dropOffPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-neon-cyan/50 to-neon-cyan rounded-t"
                      style={{ height: `${point.percentage}%` }}
                      title={`${point.percentage}% at ${formatDuration(point.timestamp)}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Start</span>
                  <span>End</span>
                </div>
              </div>

              {/* Social Stats */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl">❤️</p>
                  <p className="text-xl font-bold text-white">{selectedContent.likes}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl">💬</p>
                  <p className="text-xl font-bold text-white">{selectedContent.comments}</p>
                  <p className="text-xs text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl">↗️</p>
                  <p className="text-xl font-bold text-white">{selectedContent.shares}</p>
                  <p className="text-xs text-gray-500">Shares</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
