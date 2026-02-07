'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Mentor {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  specialties: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  availability: 'available' | 'limited' | 'booked';
  hourlyRate?: number;
  bio: string;
  sessionCount: number;
}

interface MentorCardProps {
  mentor: Mentor;
  onConnect: () => void;
  onViewProfile: () => void;
}

export function MentorCard({ mentor, onConnect, onViewProfile }: MentorCardProps) {
  const availabilityStyles = {
    available: 'bg-green-500/20 text-green-400',
    limited: 'bg-yellow-500/20 text-yellow-400',
    booked: 'bg-red-500/20 text-red-400',
  };

  const availabilityLabels = {
    available: 'Available',
    limited: 'Limited spots',
    booked: 'Fully booked',
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-deep-space/50 p-6 transition-all hover:border-neon-cyan/30">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {mentor.avatarUrl ? (
            <Image src={mentor.avatarUrl} alt={mentor.name} width={64} height={64} />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl">
              {mentor.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
            {mentor.name}
          </h3>
          <p className="text-sm text-gray-400">{mentor.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-sm text-yellow-400">
              ⭐ {mentor.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">({mentor.reviewCount} reviews)</span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${availabilityStyles[mentor.availability]}`}>
          {availabilityLabels[mentor.availability]}
        </span>
      </div>

      {/* Bio */}
      <p className="mt-4 text-sm text-gray-400 line-clamp-2">{mentor.bio}</p>

      {/* Specialties */}
      <div className="mt-4 flex flex-wrap gap-2">
        {mentor.specialties.slice(0, 4).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full bg-neon-purple/10 px-3 py-1 text-xs text-neon-purple"
          >
            {specialty}
          </span>
        ))}
        {mentor.specialties.length > 4 && (
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
            +{mentor.specialties.length - 4} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {mentor.experience}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {mentor.sessionCount} sessions
        </span>
        {mentor.hourlyRate && (
          <span className="text-neon-cyan font-medium">
            ${mentor.hourlyRate}/hr
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onViewProfile}
          className="flex-1 rounded-full border border-white/10 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={onConnect}
          disabled={mentor.availability === 'booked'}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            mentor.availability === 'booked'
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
          }`}
        >
          {mentor.availability === 'booked' ? 'Waitlist' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

// Mentor matching questionnaire
interface MatchingQuestionnaireProps {
  onComplete: (answers: Record<string, string>) => void;
}

export function MentorMatchingQuestionnaire({ onComplete }: MatchingQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      id: 'experience',
      question: 'What\'s your current skill level?',
      options: ['Complete beginner', 'Some experience (< 1 year)', 'Intermediate (1-3 years)', 'Advanced (3+ years)'],
    },
    {
      id: 'focus',
      question: 'What area do you want to focus on?',
      options: ['Wildlife photography basics', 'Camera settings & technique', 'Field craft & animal behavior', 'Post-processing & editing', 'Portfolio building', 'Selling your work'],
    },
    {
      id: 'goals',
      question: 'What are your photography goals?',
      options: ['Hobby & personal enjoyment', 'Build a portfolio', 'Go professional', 'Win competitions', 'Publish my work'],
    },
    {
      id: 'commitment',
      question: 'How much time can you commit per week?',
      options: ['1-2 hours', '3-5 hours', '5-10 hours', '10+ hours'],
    },
    {
      id: 'style',
      question: 'What learning style works best for you?',
      options: ['Hands-on practice with feedback', 'Structured lessons', 'Self-paced with guidance', 'Discussion-based learning'],
    },
  ];

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleSelect = (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-deep-space p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Question {step + 1} of {questions.length}</span>
          <span className="text-sm text-neon-cyan">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-white mb-6">{currentQuestion.question}</h2>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-left text-white hover:border-neon-cyan/50 hover:bg-neon-cyan/10 transition-all"
          >
            {option}
          </button>
        ))}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}
    </div>
  );
}

// Find mentor CTA button
export function FindMentorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-6 transition-all hover:border-neon-cyan/30"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple">
        <span className="text-2xl">🎓</span>
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
          Find a Mentor
        </h3>
        <p className="text-sm text-gray-400">Get personalized guidance from experts</p>
      </div>
      <svg className="h-5 w-5 text-gray-400 ml-auto group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
