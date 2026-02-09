'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Challenge {
  id: string;
  status: 'UPCOMING' | 'ACTIVE' | 'VOTING' | 'COMPLETED';
  featured: boolean;
}

interface ChallengeStatusFormProps {
  challenge: Challenge;
}

export function ChallengeStatusForm({ challenge }: ChallengeStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(challenge.status);
  const [featured, setFeatured] = useState(challenge.featured);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, featured })
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Update challenge error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = status !== challenge.status || featured !== challenge.featured;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
      <h2 className="font-semibold text-white">Challenge Controls</h2>

      <div>
        <label className="block text-sm text-white/50 mb-2">Status</label>
        <div className="grid grid-cols-2 gap-2">
          {(['UPCOMING', 'ACTIVE', 'VOTING', 'COMPLETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                status === s
                  ? s === 'UPCOMING' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' :
                    s === 'ACTIVE' ? 'bg-green-500/30 text-green-400 border border-green-500/50' :
                    s === 'VOTING' ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50' :
                    'bg-gray-500/30 text-gray-400 border border-gray-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-2">
          Status is auto-updated based on dates, but you can override it here.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple"
        />
        <label htmlFor="featured" className="text-sm text-white/80">
          Feature this challenge
        </label>
      </div>

      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan py-2 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
}
