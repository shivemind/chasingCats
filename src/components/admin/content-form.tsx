'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Content, Category } from '@prisma/client';

interface ContentFormProps {
  content?: Content;
  categories: Category[];
}

const contentTypes = ['ARTICLE', 'VIDEO', 'TALK', 'COURSE', 'NEWS'] as const;
const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'] as const;

export function ContentForm({ content, categories }: ContentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      excerpt: formData.get('excerpt') as string,
      body: formData.get('body') as string,
      type: formData.get('type') as string,
      thumbnailUrl: formData.get('thumbnailUrl') as string || null,
      videoUrl: formData.get('videoUrl') as string || null,
      resourceUrl: formData.get('resourceUrl') as string || null,
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : null,
      level: formData.get('level') as string,
      region: formData.get('region') as string || null,
      species: formData.get('species') as string || null,
      topic: formData.get('topic') as string || null,
      categoryId: formData.get('categoryId') as string || null,
      featured: formData.get('featured') === 'on',
      publishedAt: formData.get('published') === 'on' ? new Date().toISOString() : null
    };

    try {
      const url = content ? `/api/admin/content/${content.id}` : '/api/admin/content';
      const method = content ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to save content');
      }

      router.push('/admin/content');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/70">
            Title *
            <input
              type="text"
              name="title"
              defaultValue={content?.title}
              required
              onChange={(e) => {
                if (!content) {
                  const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                  if (slugInput) slugInput.value = generateSlug(e.target.value);
                }
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., Tracking Snow Leopards in Ladakh"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Slug *
            <input
              type="text"
              name="slug"
              defaultValue={content?.slug}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="tracking-snow-leopards-ladakh"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Type *
            <select
              name="type"
              defaultValue={content?.type ?? 'VIDEO'}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
            >
              {contentTypes.map((type) => (
                <option key={type} value={type} className="bg-midnight">
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Category
            <select
              name="categoryId"
              defaultValue={content?.categoryId ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
            >
              <option value="" className="bg-midnight">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-midnight">
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Skill Level
            <select
              name="level"
              defaultValue={content?.level ?? 'ALL_LEVELS'}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
            >
              {skillLevels.map((level) => (
                <option key={level} value={level} className="bg-midnight">
                  {level.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/70">
            Excerpt *
            <textarea
              name="excerpt"
              defaultValue={content?.excerpt}
              required
              rows={2}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="A brief description for previews..."
            />
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/70">
            Body Content *
            <textarea
              name="body"
              defaultValue={content?.body}
              required
              rows={8}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="Full content (supports HTML)..."
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Thumbnail URL
            <input
              type="url"
              name="thumbnailUrl"
              defaultValue={content?.thumbnailUrl ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="https://..."
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Video URL
            <input
              type="url"
              name="videoUrl"
              defaultValue={content?.videoUrl ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="YouTube, Vimeo, etc."
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Resource URL
            <input
              type="url"
              name="resourceUrl"
              defaultValue={content?.resourceUrl ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="Downloadable resources..."
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Duration (minutes)
            <input
              type="number"
              name="duration"
              defaultValue={content?.duration ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., 45"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Species
            <input
              type="text"
              name="species"
              defaultValue={content?.species ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., Snow Leopard"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Region
            <input
              type="text"
              name="region"
              defaultValue={content?.region ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., Ladakh, India"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Topic
            <input
              type="text"
              name="topic"
              defaultValue={content?.topic ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., Camera Trapping"
            />
          </label>
        </div>

        <div className="flex items-center gap-8">
          <label className="flex items-center gap-3 text-sm font-medium text-white/70">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={content?.featured}
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-neon-cyan focus:ring-neon-cyan"
            />
            Featured content
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-white/70">
            <input
              type="checkbox"
              name="published"
              defaultChecked={!!content?.publishedAt}
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-neon-cyan focus:ring-neon-cyan"
            />
            Published
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-8 py-3 text-sm font-semibold text-night transition hover:shadow-glow disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : content ? 'Update Content' : 'Create Content'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
