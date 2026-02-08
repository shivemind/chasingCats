'use client';

import { useState } from 'react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  action?: { label: string; url: string };
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  segment: string;
  delivered: number;
  opened: number;
  clicked: number;
}

interface PushNotificationSenderProps {
  templates: NotificationTemplate[];
  history: NotificationHistory[];
  userSegments: { id: string; name: string; count: number }[];
  onSend: (notification: { title: string; body: string; segmentId: string; action?: { label: string; url: string } }) => Promise<void>;
  onSaveTemplate: (template: NotificationTemplate) => Promise<void>;
}

export function PushNotificationSender({ templates, history, userSegments, onSend, onSaveTemplate }: PushNotificationSenderProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleSend = async () => {
    if (!title || !body || !selectedSegment) return;
    setIsSending(true);
    await onSend({
      title,
      body,
      segmentId: selectedSegment,
      action: actionLabel && actionUrl ? { label: actionLabel, url: actionUrl } : undefined,
    });
    setIsSending(false);
    // Reset form
    setTitle('');
    setBody('');
    setActionLabel('');
    setActionUrl('');
  };

  const loadTemplate = (template: NotificationTemplate) => {
    setTitle(template.title);
    setBody(template.body);
    if (template.action) {
      setActionLabel(template.action.label);
      setActionUrl(template.action.url);
    }
    setActiveTab('compose');
  };

  const selectedSegmentData = userSegments.find(s => s.id === selectedSegment);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Push Notifications</h2>
          <p className="text-sm text-gray-400">Send targeted notifications to users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['compose', 'templates', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              activeTab === tab ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="New lesson available!"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/50</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                placeholder="Check out our new wildlife photography lesson..."
                rows={3}
                maxLength={180}
              />
              <p className="text-xs text-gray-500 mt-1">{body.length}/180</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Segment</label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                <option value="">Select a segment...</option>
                {userSegments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.count.toLocaleString()} users)
                  </option>
                ))}
              </select>
            </div>
            
            {/* Action Button */}
            <div className="rounded-lg bg-white/5 p-4">
              <p className="text-sm text-gray-400 mb-3">Action Button (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="View Now"
                />
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="/lessons/new"
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!title || !body || !selectedSegment || isSending}
              className="w-full rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-medium text-white disabled:opacity-50"
            >
              {isSending ? 'Sending...' : `Send to ${selectedSegmentData?.count.toLocaleString() || 0} users`}
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Preview</h3>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="rounded"
                />
                Live preview
              </label>
            </div>
            
            {/* Desktop Preview */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">Desktop (Chrome)</p>
              <div className="rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-xl">
                    🐱
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{title || 'Notification title'}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{body || 'Notification body text will appear here...'}</p>
                    {actionLabel && (
                      <button className="mt-2 text-sm text-blue-500 font-medium">
                        {actionLabel}
                      </button>
                    )}
                  </div>
                  <button className="text-gray-400 text-sm">×</button>
                </div>
              </div>
            </div>

            {/* Mobile Preview */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Mobile (iOS)</p>
              <div className="rounded-2xl bg-gray-100 p-3 max-w-[320px]">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-sm">
                    🐱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm">ChasingCats</p>
                      <p className="text-xs text-gray-500">now</p>
                    </div>
                    <p className="font-medium text-gray-800 text-sm truncate">{title || 'Title'}</p>
                    <p className="text-xs text-gray-600 truncate">{body || 'Body'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium text-white">{template.name}</p>
                <span className="text-2xl">{template.icon || '📣'}</span>
              </div>
              <p className="text-sm font-medium text-gray-300 mb-1">{template.title}</p>
              <p className="text-xs text-gray-500 mb-4">{template.body}</p>
              <button
                onClick={() => loadTemplate(template)}
                className="w-full rounded-lg bg-white/10 py-2 text-sm text-white hover:bg-white/20"
              >
                Use Template
              </button>
            </div>
          ))}
          
          {/* Add Template Card */}
          <button className="rounded-xl border-2 border-dashed border-white/20 p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan">
            <span className="text-2xl">+</span>
            <span className="text-sm">Create Template</span>
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Notification</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Segment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Delivered</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Opened</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Clicked</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Sent</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const openRate = item.delivered > 0 ? ((item.opened / item.delivered) * 100).toFixed(1) : 0;
                const clickRate = item.opened > 0 ? ((item.clicked / item.opened) * 100).toFixed(1) : 0;
                return (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{item.body}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{item.segment}</td>
                    <td className="px-4 py-3 text-white">{item.delivered.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-white">{item.opened.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs ml-1">({openRate}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-neon-cyan">{item.clicked.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs ml-1">({clickRate}%)</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(item.sentAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
