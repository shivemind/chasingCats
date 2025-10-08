'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface WatchToggleProps {
  contentId: string;
  contentSlug: string;
  initialWatched: boolean;
}

export function WatchToggle({ contentId, contentSlug, initialWatched }: WatchToggleProps) {
  const { data: session } = useSession();
  const [watched, setWatched] = useState(initialWatched);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session?.user) {
      window.location.href = `/login?callbackUrl=/${contentSlug}`;
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, watched: !watched })
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      setWatched((prev) => !prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={handleToggle} disabled={loading}>
      {watched ? 'Mark as unwatched' : 'Mark as watched'}
    </Button>
  );
}
