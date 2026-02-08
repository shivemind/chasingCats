'use client';

import { useState } from 'react';

interface BulkUserActionsProps {
  selectedUserIds: string[];
  selectedUsersCount: number;
  onAction: (action: string, params?: Record<string, unknown>) => Promise<void>;
  onClearSelection: () => void;
}

export function BulkUserActions({ 
  selectedUserIds, 
  selectedUsersCount, 
  onAction,
  onClearSelection 
}: BulkUserActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action-specific state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [newTier, setNewTier] = useState<'free' | 'pro' | 'elite'>('pro');
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [badgeId, setBadgeId] = useState('');

  if (selectedUsersCount === 0) return null;

  const handleExecuteAction = async () => {
    setIsProcessing(true);
    try {
      switch (activeAction) {
        case 'email':
          await onAction('sendEmail', { subject: emailSubject, body: emailBody, userIds: selectedUserIds });
          break;
        case 'upgrade':
          await onAction('changeTier', { tier: newTier, userIds: selectedUserIds });
          break;
        case 'discount':
          await onAction('applyDiscount', { code: discountCode, percent: discountPercent, userIds: selectedUserIds });
          break;
        case 'badge':
          await onAction('awardBadge', { badgeId, userIds: selectedUserIds });
          break;
        case 'export':
          await onAction('exportCsv', { userIds: selectedUserIds });
          break;
        case 'suspend':
          await onAction('bulkSuspend', { userIds: selectedUserIds });
          break;
      }
      setActiveAction(null);
      onClearSelection();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="rounded-2xl border border-white/10 bg-deep-space/95 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-cyan text-sm font-bold text-black">
              {selectedUsersCount}
            </span>
            <span className="text-white font-medium">users selected</span>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAction('email')}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <span>✉️</span> Email
            </button>
            <button
              onClick={() => setActiveAction('upgrade')}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <span>⬆️</span> Change Tier
            </button>
            <button
              onClick={() => setActiveAction('discount')}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <span>🏷️</span> Discount
            </button>
            <button
              onClick={() => setActiveAction('badge')}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <span>🏅</span> Award Badge
            </button>
            <button
              onClick={() => setActiveAction('export')}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <span>📥</span> Export CSV
            </button>
            <button
              onClick={() => setActiveAction('suspend')}
              className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/30"
            >
              <span>⚠️</span> Suspend
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <button
            onClick={onClearSelection}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>

        {/* Action Modals */}
        {activeAction && (
          <div className="border-t border-white/10 p-4">
            {activeAction === 'email' && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Send Email to {selectedUsersCount} Users</h3>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email body (supports basic HTML)"
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                />
              </div>
            )}

            {activeAction === 'upgrade' && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Change Tier for {selectedUsersCount} Users</h3>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as 'free' | 'pro' | 'elite')}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
            )}

            {activeAction === 'discount' && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Apply Discount to {selectedUsersCount} Users</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Coupon code"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      min={1}
                      max={100}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>
              </div>
            )}

            {activeAction === 'badge' && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Award Badge to {selectedUsersCount} Users</h3>
                <select
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="">Select a badge</option>
                  <option value="early-adopter">🌟 Early Adopter</option>
                  <option value="beta-tester">🧪 Beta Tester</option>
                  <option value="community-hero">🦸 Community Hero</option>
                  <option value="special-event">🎉 Special Event</option>
                </select>
              </div>
            )}

            {activeAction === 'export' && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Export {selectedUsersCount} Users to CSV</h3>
                <p className="text-sm text-gray-400">
                  This will download a CSV file containing user details: name, email, tier, status, join date, and stats.
                </p>
              </div>
            )}

            {activeAction === 'suspend' && (
              <div className="space-y-4">
                <h3 className="font-medium text-red-400">⚠️ Suspend {selectedUsersCount} Users</h3>
                <p className="text-sm text-gray-400">
                  This will temporarily suspend all selected users. They will not be able to access the platform until reactivated.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setActiveAction(null)}
                className="flex-1 rounded-lg border border-white/10 py-2 text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className={`flex-1 rounded-lg py-2 font-medium disabled:opacity-50 ${
                  activeAction === 'suspend' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-neon-cyan text-black'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Execute'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
