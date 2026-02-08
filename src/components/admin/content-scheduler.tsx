'use client';

import { useState } from 'react';

interface ScheduledContent {
  id: string;
  title: string;
  type: 'lesson' | 'article' | 'challenge' | 'announcement';
  status: 'draft' | 'scheduled' | 'published';
  scheduledFor: string;
  publishedAt?: string;
  author: string;
  tier?: 'free' | 'pro' | 'elite';
  isDrip?: boolean;
  dripDelay?: number;
}

interface ContentSchedulerProps {
  content: ScheduledContent[];
  onSchedule: (contentId: string, date: string) => Promise<void>;
  onUnschedule: (contentId: string) => Promise<void>;
  onPublishNow: (contentId: string) => Promise<void>;
}

export function ContentScheduler({ content, onSchedule, onUnschedule, onPublishNow }: ContentSchedulerProps) {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [enableDrip, setEnableDrip] = useState(false);
  const [dripDelay, setDripDelay] = useState(7);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const { daysInMonth, firstDay } = getDaysInMonth(selectedMonth);

  // Get content for a specific day
  const getContentForDay = (day: number) => {
    const dayDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    return content.filter(c => {
      const contentDate = new Date(c.scheduledFor);
      return contentDate.toDateString() === dayDate.toDateString();
    });
  };

  const handleSchedule = async () => {
    if (!selectedContent || !scheduleDate) return;
    const dateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    await onSchedule(selectedContent.id, dateTime);
    setShowScheduleModal(false);
    setSelectedContent(null);
  };

  const getTypeColor = (type: ScheduledContent['type']) => {
    switch (type) {
      case 'lesson': return 'bg-neon-cyan/20 border-neon-cyan/30 text-neon-cyan';
      case 'article': return 'bg-neon-purple/20 border-neon-purple/30 text-neon-purple';
      case 'challenge': return 'bg-cat-eye/20 border-cat-eye/30 text-cat-eye';
      case 'announcement': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    }
  };

  const getStatusBadge = (status: ScheduledContent['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'published': return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Content Scheduler</h2>
          <p className="text-sm text-gray-400">Schedule and manage content releases</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`rounded-lg px-4 py-2 text-sm ${view === 'calendar' ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white'}`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-lg px-4 py-2 text-sm ${view === 'list' ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white'}`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              className="rounded-lg bg-white/10 px-3 py-2 text-white hover:bg-white/20"
            >
              ←
            </button>
            <h3 className="text-lg font-bold text-white">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="rounded-lg bg-white/10 px-3 py-2 text-white hover:bg-white/20"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {/* Empty cells for days before month starts */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="h-24 rounded-lg bg-white/5 p-2" />
            ))}
            {/* Day cells */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dayContent = getContentForDay(day);
              const isToday = new Date().toDateString() === new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day).toDateString();
              return (
                <div
                  key={day}
                  className={`h-24 rounded-lg border p-2 ${
                    isToday ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'border-white/5 bg-white/5'
                  } hover:border-white/20`}
                >
                  <span className={`text-xs ${isToday ? 'text-neon-cyan font-bold' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-14">
                    {dayContent.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setSelectedContent(c); setShowScheduleModal(true); }}
                        className={`rounded px-1 py-0.5 text-[10px] truncate cursor-pointer border ${getTypeColor(c.type)}`}
                      >
                        {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-neon-cyan" /> Lesson</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-neon-purple" /> Article</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-cat-eye" /> Challenge</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-yellow-500" /> Announcement</span>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Content</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Scheduled</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.title}</p>
                    <p className="text-xs text-gray-500">by {c.author}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${getTypeColor(c.type)}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    {c.isDrip && <span className="ml-1 text-xs text-neon-purple">⏳ Drip</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(c.scheduledFor).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 capitalize">
                    {c.tier || 'all'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelectedContent(c); setShowScheduleModal(true); }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                      >
                        Reschedule
                      </button>
                      {c.status === 'scheduled' && (
                        <button
                          onClick={() => onPublishNow(c.id)}
                          className="rounded-lg bg-neon-cyan px-3 py-1 text-xs text-black"
                        >
                          Publish Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-deep-space p-6">
            <h3 className="text-lg font-bold text-white mb-4">Schedule Content</h3>
            <p className="text-sm text-gray-400 mb-4">{selectedContent.title}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>

              {/* Drip Release */}
              <div className="rounded-xl bg-white/5 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDrip}
                    onChange={(e) => setEnableDrip(e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <p className="text-white font-medium">Enable Drip Release</p>
                    <p className="text-xs text-gray-500">Release to users X days after they subscribe</p>
                  </div>
                </label>
                {enableDrip && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      value={dripDelay}
                      onChange={(e) => setDripDelay(Number(e.target.value))}
                      min={1}
                      className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                    <span className="text-gray-400">days after subscription</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowScheduleModal(false); setSelectedContent(null); }}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                {selectedContent.status === 'scheduled' && (
                  <button
                    onClick={() => { onUnschedule(selectedContent.id); setShowScheduleModal(false); }}
                    className="rounded-lg bg-red-500/20 px-4 py-2 text-red-400"
                  >
                    Unschedule
                  </button>
                )}
                <button
                  onClick={handleSchedule}
                  className="flex-1 rounded-lg bg-neon-cyan py-2 font-medium text-black"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
