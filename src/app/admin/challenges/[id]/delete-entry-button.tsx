'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteEntryButtonProps {
  entryId: string;
  entryTitle: string;
}

export function DeleteEntryButton({ entryId, entryTitle }: DeleteEntryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/challenges/entries/${entryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Delete entry error:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
      title={`Delete "${entryTitle}"`}
    >
      Delete
    </button>
  );
}
