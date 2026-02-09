'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnswerQuestionFormProps {
  questionId: string;
  currentAnswer: string | null;
  currentStatus: string;
}

export function AnswerQuestionForm({ questionId, currentAnswer, currentStatus }: AnswerQuestionFormProps) {
  const router = useRouter();
  const [answer, setAnswer] = useState(currentAnswer ?? '');
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, status })
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to save answer');
      }

      setMessage('Answer saved successfully!');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-white/70 mb-2">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
        >
          <option value="PENDING" className="bg-deep-space">Pending</option>
          <option value="ANSWERED" className="bg-deep-space">Answered</option>
          <option value="ARCHIVED" className="bg-deep-space">Archived</option>
        </select>
      </div>

      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-white/70 mb-2">
          Your Answer
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={8}
          placeholder="Type your answer here..."
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-neon-cyan px-6 py-3 text-sm font-semibold text-black transition hover:shadow-glow disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Answer'}
        </button>
        
        {answer && status !== 'ANSWERED' && (
          <button
            type="button"
            onClick={() => setStatus('ANSWERED')}
            className="rounded-xl border border-green-500/50 px-6 py-3 text-sm font-semibold text-green-400 transition hover:bg-green-500/10"
          >
            Mark as Answered
          </button>
        )}
      </div>

      {message && <p className="text-sm text-green-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
