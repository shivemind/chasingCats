'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ChallengeEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  photoUrl: string;
  caption?: string;
  votes: number;
  hasVoted: boolean;
  submittedAt: string;
  rank?: number;
}

interface PhotoChallenge {
  id: string;
  title: string;
  theme: string;
  description: string;
  rules: string[];
  prize: string;
  startDate: string;
  endDate: string;
  votingEndsAt: string;
  status: 'upcoming' | 'active' | 'voting' | 'ended';
  entries: ChallengeEntry[];
  totalEntries: number;
  hasSubmitted: boolean;
  bannerImage?: string;
}

// Challenge card for listing
export function ChallengeCard({ challenge, onClick }: { challenge: PhotoChallenge; onClick: () => void }) {
  const getStatusBadge = () => {
    switch (challenge.status) {
      case 'upcoming':
        return { text: 'Coming Soon', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'active':
        return { text: 'Submit Now', color: 'bg-green-500/20 text-green-400' };
      case 'voting':
        return { text: 'Vote Now', color: 'bg-neon-purple/20 text-neon-purple' };
      case 'ended':
        return { text: 'Ended', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const status = getStatusBadge();
  const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-deep-space/50 text-left transition-all hover:border-neon-cyan/30"
    >
      {/* Banner */}
      <div className="relative aspect-[2/1] overflow-hidden">
        {challenge.bannerImage ? (
          <Image src={challenge.bannerImage} alt={challenge.title} fill className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-space to-transparent" />
        
        {/* Status badge */}
        <div className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
          {status.text}
        </div>
        
        {/* Prize */}
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-cat-eye/90 px-3 py-1 text-xs font-bold text-black">
          🏆 {challenge.prize}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
          {challenge.title}
        </h3>
        <p className="mt-1 text-sm text-neon-purple font-medium">{challenge.theme}</p>
        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{challenge.description}</p>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            📸 {challenge.totalEntries} entries
          </span>
          {challenge.status !== 'ended' && daysLeft > 0 && (
            <span className="text-neon-cyan font-medium">
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        {challenge.hasSubmitted && (
          <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
            <span>✓</span> You&apos;ve entered
          </div>
        )}
      </div>
    </button>
  );
}

// Challenge detail view
export function ChallengeDetail({ challenge, onSubmit: _onSubmit, onVote }: { 
  challenge: PhotoChallenge; 
  onSubmit: (file: File, caption: string) => void;
  onVote: (entryId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'entries' | 'rules' | 'prizes'>('entries');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  const sortedEntries = [...challenge.entries].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
        <div className="relative h-48 md:h-64">
          {challenge.bannerImage ? (
            <Image src={challenge.bannerImage} alt={challenge.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-deep-space/50 to-transparent" />
        </div>
        
        <div className="relative -mt-20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-neon-cyan/20 px-3 py-1 text-xs font-bold text-neon-cyan">
              {challenge.status === 'active' ? '🔥 Active' : challenge.status === 'voting' ? '🗳️ Voting' : '📅 ' + challenge.status}
            </span>
            <span className="rounded-full bg-cat-eye/20 px-3 py-1 text-xs font-bold text-cat-eye">
              🏆 {challenge.prize}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
          <p className="mt-1 text-lg text-neon-purple">{challenge.theme}</p>
          <p className="mt-3 text-gray-400">{challenge.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(['entries', 'rules', 'prizes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-neon-cyan/20 text-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Entries tab */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          {/* Sort controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{challenge.totalEntries} entries</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('votes')}
                className={`px-3 py-1 text-xs rounded-full ${sortBy === 'votes' ? 'bg-neon-cyan text-black' : 'bg-white/5 text-gray-400'}`}
              >
                Top Voted
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1 text-xs rounded-full ${sortBy === 'recent' ? 'bg-neon-cyan text-black' : 'bg-white/5 text-gray-400'}`}
              >
                Recent
              </button>
            </div>
          </div>

          {/* Entries grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEntries.map((entry, index) => (
              <ChallengeEntryCard 
                key={entry.id} 
                entry={entry} 
                rank={sortBy === 'votes' ? index + 1 : undefined}
                canVote={challenge.status === 'voting'}
                onVote={() => onVote(entry.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rules tab */}
      {activeTab === 'rules' && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Challenge Rules</h3>
          <ul className="space-y-3">
            {challenge.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-cyan/20 text-xs text-neon-cyan flex-shrink-0">
                  {index + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prizes tab */}
      {activeTab === 'prizes' && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { place: '1st', prize: challenge.prize, icon: '🥇', color: 'from-yellow-400 to-amber-500' },
            { place: '2nd', prize: 'Featured on Homepage', icon: '🥈', color: 'from-gray-300 to-gray-400' },
            { place: '3rd', prize: 'Pro Badge', icon: '🥉', color: 'from-amber-600 to-orange-700' },
          ].map((item) => (
            <div key={item.place} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <span className="text-4xl">{item.icon}</span>
              <h4 className={`mt-3 text-xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                {item.place} Place
              </h4>
              <p className="mt-2 text-gray-400">{item.prize}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Individual entry card
function ChallengeEntryCard({ entry, rank, canVote, onVote }: { 
  entry: ChallengeEntry; 
  rank?: number;
  canVote: boolean;
  onVote: () => void;
}) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote();
    setIsVoting(false);
  };

  return (
    <div className="group relative rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div className={`absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg ${
          rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-amber-600'
        }`}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </div>
      )}

      {/* Photo */}
      <div className="relative aspect-square">
        <Image src={entry.photoUrl} alt={entry.caption || 'Entry'} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-full overflow-hidden bg-white/10">
            {entry.userAvatar ? (
              <Image src={entry.userAvatar} alt={entry.userName} width={24} height={24} />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs">
                {entry.userName[0]}
              </div>
            )}
          </div>
          <span className="text-sm text-white truncate">{entry.userName}</span>
        </div>
        
        {entry.caption && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{entry.caption}</p>
        )}

        {/* Vote button */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">
            {entry.votes} vote{entry.votes !== 1 ? 's' : ''}
          </span>
          {canVote && (
            <button
              onClick={handleVote}
              disabled={entry.hasVoted || isVoting}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                entry.hasVoted
                  ? 'bg-neon-cyan/20 text-neon-cyan'
                  : 'bg-white/10 text-white hover:bg-neon-cyan hover:text-black'
              }`}
            >
              {entry.hasVoted ? '✓ Voted' : '🔥 Vote'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Submit entry modal
export function SubmitEntryModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  challengeTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (file: File, caption: string) => void;
  challengeTitle: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    await onSubmit(file, caption);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-deep-space p-6 animate-scale-in">
        <h2 className="text-xl font-bold text-white mb-2">Submit Your Entry</h2>
        <p className="text-sm text-gray-400 mb-6">{challengeTitle}</p>

        {/* Upload area */}
        {!preview ? (
          <label className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-white/20 bg-white/5 cursor-pointer hover:border-neon-cyan/50 transition-colors">
            <span className="text-4xl mb-2">📷</span>
            <span className="text-white font-medium">Click to upload</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="relative h-64 rounded-xl overflow-hidden">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption (optional)"
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none"
          rows={2}
        />

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/10 py-3 text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="flex-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
