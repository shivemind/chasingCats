'use client';

import { useState } from 'react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  lastActiveAt?: string;
  subscriptionTier?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionEndsAt?: string;
  stripeCustomerId?: string;
  badges: { id: string; name: string; icon: string; earnedAt: string }[];
  stats: {
    totalWatchTime: number;
    completedLessons: number;
    currentStreak: number;
    totalXp: number;
    level: number;
  };
  status: 'active' | 'suspended' | 'banned';
  suspendedReason?: string;
  suspendedUntil?: string;
}

interface UserProfileEditorProps {
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  onResetPassword: () => Promise<void>;
  onSuspend: (reason: string, until?: string) => Promise<void>;
  onBan: (reason: string) => Promise<void>;
  onReactivate: () => Promise<void>;
  onClose: () => void;
}

export function UserProfileEditor({ 
  user, 
  onSave, 
  onResetPassword, 
  onSuspend, 
  onBan, 
  onReactivate,
  onClose 
}: UserProfileEditorProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'badges' | 'moderation'>('profile');
  const [editedUser, setEditedUser] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');
  const [banReason, setBanReason] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedUser);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspend = async () => {
    await onSuspend(suspendReason, suspendUntil || undefined);
    setShowSuspendModal(false);
  };

  const handleBan = async () => {
    await onBan(banReason);
    setShowBanModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-4xl mx-4 rounded-2xl border border-white/10 bg-deep-space animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name || ''} width={64} height={64} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name || 'No name'}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  user.role === 'ADMIN' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-gray-400'
                }`}>
                  {user.role}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                  user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 px-6">
          {(['profile', 'subscription', 'badges', 'moderation'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-neon-cyan text-neon-cyan'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={editedUser.name || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Role</label>
                  <select
                    value={editedUser.role}
                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as 'ADMIN' | 'MEMBER' })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Location</label>
                  <input
                    type="text"
                    value={editedUser.location || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                <textarea
                  value={editedUser.bio || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-4 mt-6 rounded-xl bg-white/5 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{Math.round(user.stats.totalWatchTime / 60)}h</p>
                  <p className="text-xs text-gray-500">Watch Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user.stats.completedLessons}</p>
                  <p className="text-xs text-gray-500">Lessons</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neon-cyan">{user.stats.currentStreak}</p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neon-purple">{user.stats.totalXp}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cat-eye">{user.stats.level}</p>
                  <p className="text-xs text-gray-500">Level</p>
                </div>
              </div>

              {/* Reset Password */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Reset Password</p>
                    <p className="text-sm text-gray-500">Send password reset email to user</p>
                  </div>
                  <button
                    onClick={onResetPassword}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                  >
                    Send Reset Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Subscription Tier</label>
                  <select
                    value={editedUser.subscriptionTier || 'free'}
                    onChange={(e) => setEditedUser({ ...editedUser, subscriptionTier: e.target.value as 'free' | 'pro' | 'elite' })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={editedUser.subscriptionStatus || 'active'}
                    onChange={(e) => setEditedUser({ ...editedUser, subscriptionStatus: e.target.value as 'active' | 'canceled' | 'past_due' | 'trialing' })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="trialing">Trialing</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>

              {user.stripeCustomerId && (
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">Stripe Customer ID</p>
                  <p className="font-mono text-white">{user.stripeCustomerId}</p>
                  <a
                    href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-neon-cyan hover:underline"
                  >
                    View in Stripe →
                  </a>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <button className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10">
                  <p className="font-medium text-white">Grant Pro Trial</p>
                  <p className="text-xs text-gray-500">Give 7-day Pro access</p>
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10">
                  <p className="font-medium text-white">Apply Discount</p>
                  <p className="text-xs text-gray-500">Add coupon code</p>
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10">
                  <p className="font-medium text-white">Extend Subscription</p>
                  <p className="text-xs text-gray-500">Add free days</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">{user.badges.length} badges earned</p>
                <button className="rounded-lg bg-neon-cyan px-4 py-2 text-sm font-medium text-black">
                  + Award Badge
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {user.badges.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                    <span className="text-3xl">{badge.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{badge.name}</p>
                      <p className="text-xs text-gray-500">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="text-gray-500 hover:text-red-400">×</button>
                  </div>
                ))}
              </div>
              {user.badges.length === 0 && (
                <div className="rounded-xl bg-white/5 p-12 text-center text-gray-500">
                  No badges earned yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-4">
              {/* Current status */}
              {user.status !== 'active' && (
                <div className={`rounded-xl p-4 ${
                  user.status === 'suspended' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <p className={`font-medium ${user.status === 'suspended' ? 'text-yellow-400' : 'text-red-400'}`}>
                    User is {user.status}
                  </p>
                  {user.suspendedReason && (
                    <p className="text-sm text-gray-400 mt-1">Reason: {user.suspendedReason}</p>
                  )}
                  {user.suspendedUntil && (
                    <p className="text-sm text-gray-400">Until: {new Date(user.suspendedUntil).toLocaleString()}</p>
                  )}
                  <button
                    onClick={onReactivate}
                    className="mt-4 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white"
                  >
                    Reactivate Account
                  </button>
                </div>
              )}

              {/* Moderation actions */}
              {user.status === 'active' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left hover:bg-yellow-500/20"
                  >
                    <p className="font-medium text-yellow-400">⚠️ Suspend User</p>
                    <p className="text-xs text-gray-400 mt-1">Temporarily restrict access</p>
                  </button>
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-left hover:bg-red-500/20"
                  >
                    <p className="font-medium text-red-400">🚫 Ban User</p>
                    <p className="text-xs text-gray-400 mt-1">Permanently remove access</p>
                  </button>
                </div>
              )}

              {/* Activity log placeholder */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-400 mb-4">Recent Activity</p>
                <div className="rounded-xl bg-white/5 p-4 text-center text-gray-500">
                  View full activity in User Activity Timeline
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-6 py-2 text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-2 font-medium text-white disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-deep-space p-6">
            <h3 className="text-lg font-bold text-white mb-4">Suspend User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Why is this user being suspended?"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Suspend Until (optional)</label>
                <input
                  type="datetime-local"
                  value={suspendUntil}
                  onChange={(e) => setSuspendUntil(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  className="flex-1 rounded-lg bg-yellow-500 py-2 font-medium text-black"
                >
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-deep-space p-6">
            <h3 className="text-lg font-bold text-white mb-4">Ban User</h3>
            <p className="text-sm text-red-400 mb-4">⚠️ This action is permanent and cannot be undone.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Why is this user being banned?"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBan}
                  className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white"
                >
                  Ban User Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
