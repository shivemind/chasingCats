'use client';

import { useState } from 'react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'boolean' | 'percentage' | 'segment';
  value?: number;
  segments?: string[];
  createdAt: string;
  updatedAt: string;
  environment: 'development' | 'staging' | 'production';
}

interface FeatureFlagsProps {
  flags: FeatureFlag[];
  segments: { id: string; name: string; count: number }[];
  onToggleFlag: (flagId: string, enabled: boolean) => Promise<void>;
  onUpdateFlag: (flagId: string, updates: Partial<FeatureFlag>) => Promise<void>;
  onCreateFlag: (flag: Partial<FeatureFlag>) => Promise<void>;
  onDeleteFlag: (flagId: string) => Promise<void>;
}

export function FeatureFlags({ flags, segments, onToggleFlag, onUpdateFlag, onCreateFlag, onDeleteFlag }: FeatureFlagsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<FeatureFlag | null>(null);
  const [filterEnv, setFilterEnv] = useState<'all' | 'development' | 'staging' | 'production'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create flag state
  const [newFlag, setNewFlag] = useState<Partial<FeatureFlag>>({
    key: '',
    name: '',
    description: '',
    type: 'boolean',
    enabled: false,
    environment: 'development',
  });

  const filteredFlags = flags
    .filter(f => filterEnv === 'all' || f.environment === filterEnv)
    .filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateFlag = async () => {
    await onCreateFlag(newFlag);
    setShowCreateModal(false);
    setNewFlag({
      key: '',
      name: '',
      description: '',
      type: 'boolean',
      enabled: false,
      environment: 'development',
    });
  };

  const getEnvColor = (env: FeatureFlag['environment']) => {
    switch (env) {
      case 'development': return 'bg-blue-500/20 text-blue-400';
      case 'staging': return 'bg-yellow-500/20 text-yellow-400';
      case 'production': return 'bg-green-500/20 text-green-400';
    }
  };

  const getTypeIcon = (type: FeatureFlag['type']) => {
    switch (type) {
      case 'boolean': return '🔘';
      case 'percentage': return '📊';
      case 'segment': return '👥';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Feature Flags</h2>
          <p className="text-sm text-gray-400">Control feature rollouts and A/B tests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 font-medium text-white"
        >
          + New Flag
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-gray-400 text-sm">Total Flags</p>
          <p className="text-2xl font-bold text-white">{flags.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-gray-400 text-sm">Enabled</p>
          <p className="text-2xl font-bold text-green-400">{flags.filter(f => f.enabled).length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-gray-400 text-sm">Disabled</p>
          <p className="text-2xl font-bold text-gray-400">{flags.filter(f => !f.enabled).length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-gray-400 text-sm">Production</p>
          <p className="text-2xl font-bold text-neon-cyan">
            {flags.filter(f => f.environment === 'production' && f.enabled).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flags..."
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white w-64"
        />
        <div className="flex gap-1">
          {(['all', 'development', 'staging', 'production'] as const).map((env) => (
            <button
              key={env}
              onClick={() => setFilterEnv(env)}
              className={`rounded-lg px-3 py-2 text-xs capitalize ${
                filterEnv === env ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {filteredFlags.map((flag) => (
          <div key={flag.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onToggleFlag(flag.id, !flag.enabled)}
                  className={`relative h-6 w-12 rounded-full transition-colors ${
                    flag.enabled ? 'bg-neon-cyan' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      flag.enabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(flag.type)}</span>
                    <p className="font-medium text-white">{flag.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getEnvColor(flag.environment)}`}>
                      {flag.environment}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{flag.key}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {flag.type === 'percentage' && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-neon-cyan">{flag.value}%</p>
                    <p className="text-xs text-gray-500">rollout</p>
                  </div>
                )}
                {flag.type === 'segment' && (
                  <div className="text-right">
                    <p className="text-sm text-white">{flag.segments?.length || 0} segments</p>
                    <p className="text-xs text-gray-500">targeted</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditModal(flag)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteFlag(flag.id)}
                    className="rounded-lg bg-red-500/20 px-3 py-1 text-xs text-red-400 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            {flag.description && (
              <p className="text-sm text-gray-400 mt-2 ml-16">{flag.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="font-bold text-white">Create Feature Flag</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Flag Key</label>
                <input
                  type="text"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white font-mono"
                  placeholder="new_feature_enabled"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="New Feature"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  placeholder="Enables the new feature for users"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select
                    value={newFlag.type}
                    onChange={(e) => setNewFlag({ ...newFlag, type: e.target.value as FeatureFlag['type'] })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="boolean">Boolean (On/Off)</option>
                    <option value="percentage">Percentage Rollout</option>
                    <option value="segment">Segment Based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Environment</label>
                  <select
                    value={newFlag.environment}
                    onChange={(e) => setNewFlag({ ...newFlag, environment: e.target.value as FeatureFlag['environment'] })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              {newFlag.type === 'percentage' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rollout Percentage</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newFlag.value || 0}
                    onChange={(e) => setNewFlag({ ...newFlag, value: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-center text-white font-bold">{newFlag.value || 0}%</p>
                </div>
              )}
              {newFlag.type === 'segment' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Segments</label>
                  <div className="flex flex-wrap gap-2">
                    {segments.map((segment) => (
                      <button
                        key={segment.id}
                        onClick={() => {
                          const current = newFlag.segments || [];
                          if (current.includes(segment.id)) {
                            setNewFlag({ ...newFlag, segments: current.filter(s => s !== segment.id) });
                          } else {
                            setNewFlag({ ...newFlag, segments: [...current, segment.id] });
                          }
                        }}
                        className={`rounded-lg px-3 py-1 text-xs ${
                          newFlag.segments?.includes(segment.id)
                            ? 'bg-neon-cyan text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {segment.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFlag}
                  disabled={!newFlag.key || !newFlag.name}
                  className="flex-1 rounded-lg bg-neon-cyan py-2 font-medium text-black disabled:opacity-50"
                >
                  Create Flag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-deep-space">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="font-bold text-white">Edit Flag: {showEditModal.name}</h3>
              <button onClick={() => setShowEditModal(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={showEditModal.name}
                  onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  value={showEditModal.description}
                  onChange={(e) => setShowEditModal({ ...showEditModal, description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              {showEditModal.type === 'percentage' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rollout Percentage</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={showEditModal.value || 0}
                    onChange={(e) => setShowEditModal({ ...showEditModal, value: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-center text-white font-bold">{showEditModal.value || 0}%</p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateFlag(showEditModal.id, showEditModal);
                    setShowEditModal(null);
                  }}
                  className="flex-1 rounded-lg bg-neon-cyan py-2 font-medium text-black"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
