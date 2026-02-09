'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChallengeEntryFormProps {
  challengeId: string;
}

export function ChallengeEntryForm({ challengeId }: ChallengeEntryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Please enter a title for your photo');
      return;
    }

    if (!formData.imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.imageUrl);
    } catch {
      setError('Please enter a valid image URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/challenges/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          title: formData.title,
          caption: formData.caption || undefined,
          imageUrl: formData.imageUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit entry');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">📤 Submit Your Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">
            Photo Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Give your photo a title"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-white/80 mb-1">
            Image URL *
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://example.com/your-photo.jpg"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
            required
          />
          <p className="mt-1 text-xs text-white/50">
            Upload your photo to a service like Imgur, Cloudinary, or your own hosting and paste the URL here.
          </p>
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-white/80 mb-1">
            Caption (optional)
          </label>
          <textarea
            id="caption"
            value={formData.caption}
            onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
            placeholder="Share the story behind your shot..."
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-none"
            maxLength={500}
          />
        </div>

        {/* Preview */}
        {formData.imageUrl && (
          <div className="rounded-lg overflow-hidden bg-white/5 border border-white/10">
            <div className="p-2 text-xs text-white/50 border-b border-white/10">Preview</div>
            <div className="p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="max-h-64 rounded-lg mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Entry'}
        </button>
      </form>
    </div>
  );
}
