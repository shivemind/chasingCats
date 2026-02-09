'use client';

import { useState, useTransition } from 'react';
import { ImagePlus, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { FeedPost } from '@/types/feed';

type CreatePostFormProps = {
  onPostCreated: (post: FeedPost) => void;
  hasPaidAccess?: boolean;
};

export function CreatePostForm({ onPostCreated, hasPaidAccess = false }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: content.trim(),
            imageUrl: imageUrl.trim() || undefined
          })
        });

        if (res.ok) {
          const post = await res.json();
          onPostCreated(post);
          setContent('');
          setImageUrl('');
          setShowImageInput(false);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create post');
        }
      } catch (err) {
        setError('Failed to create post. Please try again.');
      }
    });
  };

  // Non-paid users see upgrade prompt
  if (!hasPaidAccess) {
    return (
      <div className="rounded-2xl border border-night/10 bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <Lock className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-night text-sm sm:text-base">Join the Pride!</p>
            <p className="text-xs sm:text-sm text-night/60">
              Upgrade to post, comment, purr & roar with the community.
            </p>
          </div>
          <Link
            href="/pricing"
            className="rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-brand/90 transition-colors active:scale-95"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-night/10 bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-sm"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with the pride... 🐾"
        rows={3}
        maxLength={2000}
        className="resize-none border-0 bg-transparent p-0 text-base placeholder:text-night/40 focus:ring-0"
        disabled={isPending}
      />

      {showImageInput && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL (e.g., https://example.com/cat.jpg)"
            className="flex-1 rounded-xl border border-night/10 bg-night/5 px-4 py-2 text-sm placeholder:text-night/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => {
              setShowImageInput(false);
              setImageUrl('');
            }}
            className="rounded-full p-2 text-night/40 hover:bg-night/5 hover:text-night"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {imageUrl && (
        <div className="mt-3 rounded-xl overflow-hidden bg-night/5 max-h-48">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-contain"
            onError={() => setError('Invalid image URL')}
          />
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-night/5 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={() => setShowImageInput(!showImageInput)}
          className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-night/60 hover:bg-night/5 hover:text-night transition-colors active:scale-95"
          disabled={isPending}
        >
          <ImagePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Image</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs text-night/40">
            {content.length}/2000
          </span>
          <Button
            type="submit"
            disabled={isPending || !content.trim()}
            className="px-4 sm:px-6 text-xs sm:text-sm"
          >
            {isPending ? '...' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  );
}
