'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AskSectionProps {
  recentQuestions?: Array<{
    id: string;
    question: string;
    status: 'pending' | 'answered';
    answeredAt?: Date;
  }>;
}

export function AskSection({ recentQuestions = [] }: AskSectionProps) {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    // Simulate submission - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setQuestion('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="rounded-2xl border border-cat-eye/30 bg-gradient-to-br from-cat-eye/10 to-transparent p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎤</span>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Ask Me Anything</h3>
          <p className="text-xs sm:text-sm text-gray-400">Got a cat-related or photography question for Sebastian and Rachel?</p>
        </div>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to know about wildlife photography or wild cats?"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cat-eye/50 transition-colors"
            rows={3}
            maxLength={500}
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-500">
            {question.length}/500
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <button
            type="submit"
            disabled={!question.trim() || isSubmitting}
            className="flex-1 rounded-xl bg-cat-eye px-4 py-3 font-semibold text-deep-space transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : submitted ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Question Submitted!
              </span>
            ) : (
              'Submit a Question'
            )}
          </button>
          <Link
            href="/ask"
            className="rounded-xl border border-white/20 px-4 py-3 text-center font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Check the AMA page
          </Link>
        </div>
      </form>

      {/* Recent Questions */}
      {recentQuestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Your Recent Questions</p>
          <div className="space-y-2">
            {recentQuestions.slice(0, 3).map((q) => (
              <div key={q.id} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  q.status === 'answered' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {q.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
                </span>
                <p className="text-sm text-white line-clamp-1">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
