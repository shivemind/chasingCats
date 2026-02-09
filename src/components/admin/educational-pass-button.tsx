'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EducationalPassButtonProps {
  userId: string;
  currentExpiry: Date | null;
}

export function EducationalPassButton({ userId, currentExpiry }: EducationalPassButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isActive = currentExpiry && new Date(currentExpiry) > new Date();

  const handleGrant = async () => {
    if (!confirm('Grant a 2-day educational pass with complete access to this user?')) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/educational-pass`, {
        method: 'POST'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to grant educational pass');
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to grant educational pass');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Revoke this user\'s educational pass?')) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/educational-pass`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to revoke educational pass');
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to revoke educational pass');
    } finally {
      setIsLoading(false);
    }
  };

  if (isActive) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-cat-eye/20 px-2 py-1 text-xs font-medium text-cat-eye">
          <span className="h-1.5 w-1.5 rounded-full bg-cat-eye animate-pulse" />
          Pass expires {new Date(currentExpiry).toLocaleDateString()}
        </span>
        <button
          onClick={handleRevoke}
          disabled={isLoading}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {isLoading ? '...' : 'Revoke'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGrant}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cat-eye/20 to-accent/20 px-3 py-1.5 text-xs font-medium text-cat-eye transition-all hover:from-cat-eye/30 hover:to-accent/30 disabled:opacity-50"
    >
      {isLoading ? (
        'Granting...'
      ) : (
        <>
          <span>🎓</span>
          Grant Educational Pass
        </>
      )}
    </button>
  );
}
