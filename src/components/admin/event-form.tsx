'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Event } from '@prisma/client';

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateTimeLocal = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      startTime: new Date(formData.get('startTime') as string).toISOString(),
      endTime: formData.get('endTime') ? new Date(formData.get('endTime') as string).toISOString() : null,
      location: formData.get('location') as string || null,
      zoomLink: formData.get('zoomLink') as string || null,
      host: formData.get('host') as string || null
    };

    try {
      const url = event ? `/api/admin/events/${event.id}` : '/api/admin/events';
      const method = event ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to save event');
      }

      router.push('/admin/events');
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
            Event Title *
            <input
              type="text"
              name="title"
              defaultValue={event?.title}
              required
              onChange={(e) => {
                if (!event) {
                  const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                  if (slugInput) slugInput.value = generateSlug(e.target.value);
                }
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., Live Q&A: Snow Leopard Photography"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Slug *
            <input
              type="text"
              name="slug"
              defaultValue={event?.slug}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="live-qa-snow-leopard"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Start Time *
            <input
              type="datetime-local"
              name="startTime"
              defaultValue={event?.startTime ? formatDateTimeLocal(event.startTime) : ''}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            End Time
            <input
              type="datetime-local"
              name="endTime"
              defaultValue={event?.endTime ? formatDateTimeLocal(event.endTime) : ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Host Name
            <input
              type="text"
              name="host"
              defaultValue={event?.host ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="e.g., Dr. Jane Smith"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">
            Location
            <input
              type="text"
              name="location"
              defaultValue={event?.location ?? ''}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="Online / Physical location"
            />
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/70">
            Description *
            <textarea
              name="description"
              defaultValue={event?.description}
              required
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="Event description..."
            />
          </label>
        </div>

        <div className="md:col-span-2 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neon-cyan">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Meeting Link (Google Meet / Zoom)
          </h3>
          <p className="mb-4 text-sm text-white/50">
            This link will be shown to logged-in members so they can join the live session.
          </p>
          <label className="block text-sm font-medium text-white/70">
            Meeting URL
            <input
              type="url"
              name="zoomLink"
              defaultValue={event?.zoomLink ?? ''}
              className="mt-2 w-full rounded-xl border border-neon-cyan/30 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/..."
            />
          </label>
        </div>

      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-8 py-3 text-sm font-semibold text-night transition hover:shadow-glow disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
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
