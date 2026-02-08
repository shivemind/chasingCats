'use client';

import { useState } from 'react';

interface AnnouncementBanner {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  linkText?: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience: 'all' | 'free' | 'pro' | 'elite' | 'logged_out';
  dismissible: boolean;
  priority: number;
}

interface AnnouncementBannerManagerProps {
  banners: AnnouncementBanner[];
  onSave: (banner: AnnouncementBanner) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
}

export function AnnouncementBannerManager({ banners, onSave, onDelete, onToggle }: AnnouncementBannerManagerProps) {
  const [editingBanner, setEditingBanner] = useState<AnnouncementBanner | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const createNewBanner = (): AnnouncementBanner => ({
    id: '',
    message: '',
    type: 'info',
    isActive: false,
    targetAudience: 'all',
    dismissible: true,
    priority: banners.length + 1,
  });

  const handleSave = async () => {
    if (!editingBanner) return;
    await onSave(editingBanner);
    setShowEditor(false);
    setEditingBanner(null);
  };

  const getTypeBadge = (type: AnnouncementBanner['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 text-blue-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'promo': return 'bg-neon-purple/20 text-neon-purple';
    }
  };

  const getPreviewStyles = (banner: AnnouncementBanner) => {
    const defaults = {
      info: { bg: 'bg-blue-500', text: 'text-white' },
      success: { bg: 'bg-green-500', text: 'text-white' },
      warning: { bg: 'bg-yellow-500', text: 'text-black' },
      promo: { bg: 'bg-gradient-to-r from-neon-cyan to-neon-purple', text: 'text-white' },
    };
    return {
      backgroundColor: banner.backgroundColor || undefined,
      color: banner.textColor || undefined,
      className: !banner.backgroundColor ? defaults[banner.type].bg : '',
      textClass: !banner.textColor ? defaults[banner.type].text : '',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Announcement Banners</h2>
          <p className="text-sm text-gray-400">Create and manage site-wide announcements</p>
        </div>
        <button
          onClick={() => { setEditingBanner(createNewBanner()); setShowEditor(true); }}
          className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 font-medium text-white"
        >
          + New Banner
        </button>
      </div>

      {/* Active Banner Preview */}
      {banners.filter(b => b.isActive).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Active Preview:</p>
          {banners.filter(b => b.isActive).sort((a, b) => a.priority - b.priority).slice(0, 1).map(banner => {
            const styles = getPreviewStyles(banner);
            return (
              <div
                key={banner.id}
                className={`rounded-lg p-3 text-center ${styles.className} ${styles.textClass}`}
                style={{ backgroundColor: styles.backgroundColor, color: styles.color }}
              >
                <span>{banner.message}</span>
                {banner.linkText && (
                  <span className="ml-2 underline">{banner.linkText} →</span>
                )}
                {banner.dismissible && (
                  <button className="ml-4 opacity-70 hover:opacity-100">×</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Banners List */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Message</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Audience</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Schedule</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.sort((a, b) => a.priority - b.priority).map(banner => (
              <tr key={banner.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggle(banner.id, !banner.isActive)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                      banner.isActive ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                      banner.isActive ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white truncate max-w-xs">{banner.message}</p>
                  {banner.linkText && (
                    <p className="text-xs text-neon-cyan">{banner.linkText} → {banner.linkUrl}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getTypeBadge(banner.type)}`}>
                    {banner.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 capitalize">
                  {banner.targetAudience === 'logged_out' ? 'Visitors' : banner.targetAudience}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {banner.startDate || banner.endDate ? (
                    <span>
                      {banner.startDate && new Date(banner.startDate).toLocaleDateString()}
                      {banner.startDate && banner.endDate && ' - '}
                      {banner.endDate && new Date(banner.endDate).toLocaleDateString()}
                    </span>
                  ) : (
                    'Always'
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingBanner(banner); setShowEditor(true); }}
                      className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(banner.id)}
                      className="rounded-lg bg-red-500/20 px-3 py-1 text-xs text-red-400 hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {banners.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No banners created yet. Create your first announcement!
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-bold text-white">
                {editingBanner.id ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <button onClick={() => { setShowEditor(false); setEditingBanner(null); }} className="text-gray-400 hover:text-white">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preview</label>
                {(() => {
                  const styles = getPreviewStyles(editingBanner);
                  return (
                    <div
                      className={`rounded-lg p-3 text-center ${styles.className} ${styles.textClass}`}
                      style={{ backgroundColor: styles.backgroundColor, color: styles.color }}
                    >
                      <span>{editingBanner.message || 'Your message here...'}</span>
                      {editingBanner.linkText && (
                        <span className="ml-2 underline">{editingBanner.linkText} →</span>
                      )}
                      {editingBanner.dismissible && (
                        <span className="ml-4 opacity-70">×</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  value={editingBanner.message}
                  onChange={(e) => setEditingBanner({ ...editingBanner, message: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                  placeholder="Enter your announcement message..."
                />
              </div>

              {/* Type & Audience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select
                    value={editingBanner.type}
                    onChange={(e) => setEditingBanner({ ...editingBanner, type: e.target.value as AnnouncementBanner['type'] })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="info">ℹ️ Info</option>
                    <option value="success">✅ Success</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="promo">🎉 Promo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Audience</label>
                  <select
                    value={editingBanner.targetAudience}
                    onChange={(e) => setEditingBanner({ ...editingBanner, targetAudience: e.target.value as AnnouncementBanner['targetAudience'] })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="logged_out">Logged Out Visitors</option>
                    <option value="free">Free Members</option>
                    <option value="pro">Pro Members</option>
                    <option value="elite">Elite Members</option>
                  </select>
                </div>
              </div>

              {/* Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Link Text (optional)</label>
                  <input
                    type="text"
                    value={editingBanner.linkText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, linkText: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="Learn more"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Link URL</label>
                  <input
                    type="text"
                    value={editingBanner.linkUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="/pricing"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={editingBanner.startDate || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, startDate: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={editingBanner.endDate || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, endDate: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Custom Background Color</label>
                  <input
                    type="text"
                    value={editingBanner.backgroundColor || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, backgroundColor: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="#FF5733 or rgb(255,87,51)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Custom Text Color</label>
                  <input
                    type="text"
                    value={editingBanner.textColor || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, textColor: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBanner.dismissible}
                    onChange={(e) => setEditingBanner({ ...editingBanner, dismissible: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white">Dismissible</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Priority:</span>
                  <input
                    type="number"
                    value={editingBanner.priority}
                    onChange={(e) => setEditingBanner({ ...editingBanner, priority: Number(e.target.value) })}
                    min={1}
                    className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-4">
              <button
                onClick={() => { setShowEditor(false); setEditingBanner(null); }}
                className="rounded-lg border border-white/10 px-4 py-2 text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-neon-cyan px-6 py-2 font-medium text-black"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
