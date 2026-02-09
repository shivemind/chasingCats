'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface QuestionFormProps {
  eventId?: string;
  eventTitle?: string;
  variant?: 'default' | 'compact';
}

export function QuestionForm({ eventId, eventTitle, variant = 'default' }: QuestionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.user) {
      router.push(`/login?callbackUrl=${eventId ? `/events/${eventId}` : '/ask'}`);
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
      setMessage('Question submitted! Check back after the live session.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = variant === 'compact';
  const label = eventTitle ? `Ask a question for "${eventTitle}"` : 'Ask us anything';
  const placeholder = eventTitle 
    ? `What would you like to ask about ${eventTitle}?`
    : 'What wild cat mysteries should we tackle next?';

  return (
    <form onSubmit={handleSubmit} className={isCompact ? 'space-y-3' : 'space-y-4'}>
      <label className={`font-semibold ${isCompact ? 'text-xs text-white' : 'text-sm text-night'}`}>
        {label}
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={isCompact ? 3 : 5}
          placeholder={placeholder}
          className={`mt-2 ${isCompact ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : ''}`}
          required
        />
      </label>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className={isCompact ? 'w-full' : ''}
      >
        {isSubmitting ? 'Submitting…' : 'Submit your question'}
      </Button>
      {message ? <p className={`text-sm ${isCompact ? 'text-green-400' : 'text-brand-dark'}`}>{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
