'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateChallengeForm() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    theme: '',
    description: '',
    rules: '',
    startDate: '',
    endDate: '',
    votingEnd: '',
    featured: false
  });

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          votingEnd: new Date(formData.votingEnd).toISOString()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create challenge');
      }

      // Reset form and refresh
      setFormData({
        title: '',
        slug: '',
        theme: '',
        description: '',
        rules: '',
        startDate: '',
        endDate: '',
        votingEnd: '',
        featured: false
      });
      setIsExpanded(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-xl border-2 border-dashed border-white/20 p-6 text-white/50 hover:border-neon-purple/50 hover:text-neon-purple transition-colors"
      >
        + Create New Challenge
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Create New Challenge</h2>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white/50 hover:text-white"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Challenge Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Best Wildlife Portrait"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="best-wildlife-portrait"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Theme *
          </label>
          <input
            type="text"
            value={formData.theme}
            onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
            placeholder="e.g., Capture a portrait of any wild cat species"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the challenge and what participants should aim for..."
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Rules (optional)
          </label>
          <textarea
            value={formData.rules}
            onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
            placeholder="List any specific rules or guidelines..."
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none resize-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Start Date *
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Submission End Date *
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Voting End Date *
            </label>
            <input
              type="datetime-local"
              value={formData.votingEnd}
              onChange={(e) => setFormData(prev => ({ ...prev, votingEnd: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
            className="rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple"
          />
          <label htmlFor="featured" className="text-sm text-white/80">
            Feature this challenge (shows prominently on homepage)
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="rounded-lg px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan px-6 py-2 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}
