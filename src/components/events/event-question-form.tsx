'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EventQuestionFormProps {
  eventId: string;
  eventTitle: string;
}

export function EventQuestionForm({ eventId, eventTitle }: EventQuestionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) {
      router.push(`/login?callbackUrl=/events/${eventId}`);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, eventId })
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Unable to submit question');
      }

      setQuestion('');
      setMessage('Question submitted! It will be considered for the live session.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-night/70 mb-2">
          What would you like to ask about &ldquo;{eventTitle}&rdquo;?
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          placeholder="Enter your question here (minimum 10 characters)..."
          className="w-full rounded-xl border border-night/20 bg-white px-4 py-3 text-night placeholder:text-night/40 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          required
          minLength={10}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || question.length < 10}
        className="rounded-full bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Question'}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
