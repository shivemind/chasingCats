'use client';

import { useState } from 'react';
import type { Profile } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ProfileFormProps {
  initialData?: Profile | null;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formState, setFormState] = useState({
    username: initialData?.username ?? '',
    bio: initialData?.bio ?? '',
    location: initialData?.location ?? '',
    favoriteCat: initialData?.favoriteCat ?? '',
    instagram: initialData?.instagram ?? '',
    website: initialData?.website ?? ''
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      if (!response.ok) {
        throw new Error('Unable to save');
      }

      setStatus('saved');
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-night">
          Username
          <Input name="username" value={formState.username} onChange={handleChange} className="mt-2" required />
        </label>
        <label className="text-sm font-semibold text-night">
          Favorite cat
          <Input name="favoriteCat" value={formState.favoriteCat} onChange={handleChange} className="mt-2" />
        </label>
      </div>
      <label className="text-sm font-semibold text-night">
        Location
        <Input name="location" value={formState.location} onChange={handleChange} className="mt-2" />
      </label>
      <label className="text-sm font-semibold text-night">
        Bio
        <Textarea name="bio" value={formState.bio} onChange={handleChange} rows={4} className="mt-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-night">
          Instagram
          <Input name="instagram" value={formState.instagram} onChange={handleChange} className="mt-2" placeholder="@handle" />
        </label>
        <label className="text-sm font-semibold text-night">
          Website
          <Input name="website" value={formState.website} onChange={handleChange} className="mt-2" placeholder="https://" />
        </label>
      </div>
      <Button type="submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving…' : 'Save profile'}
      </Button>
      {status === 'saved' ? <p className="text-sm text-brand-dark">Profile updated!</p> : null}
      {status === 'error' ? <p className="text-sm text-red-600">Something went wrong. Try again.</p> : null}
    </form>
  );
}
