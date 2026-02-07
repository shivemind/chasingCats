'use client';

import { useState } from 'react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  contentId?: string;
}

interface QuizSystemProps {
  quiz: Quiz;
  onComplete: (score: number, passed: boolean) => void;
}

export function QuizSystem({ quiz, onComplete }: QuizSystemProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = quiz.questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== null;
  const isCorrect = selectedAnswers[currentQuestion] === question.correctIndex;

  const handleSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correctCount = selectedAnswers.filter(
        (answer, index) => answer === quiz.questions[index].correctIndex
      ).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;
      
      setShowResults(true);
      onComplete(score, passed);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResults(false);
    setShowExplanation(false);
  };

  // Results screen
  if (showResults) {
    const correctCount = selectedAnswers.filter(
      (answer, index) => answer === quiz.questions[index].correctIndex
    ).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    return (
      <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-8 text-center">
        {/* Result icon */}
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
          passed 
            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
            : 'bg-gradient-to-br from-orange-500 to-red-500'
        }`}>
          <span className="text-4xl">{passed ? '🎉' : '📚'}</span>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-white">
          {passed ? 'Congratulations!' : 'Keep Learning!'}
        </h2>
        
        <p className="mt-2 text-gray-400">
          You scored {score}% ({correctCount}/{quiz.questions.length} correct)
        </p>

        {/* Score bar */}
        <div className="mt-6 mx-auto max-w-xs">
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                passed 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {quiz.passingScore}% required to pass
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {passed ? (
            <button className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-3 font-semibold text-white">
              <span>🏆</span> Claim Certificate
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="rounded-full bg-neon-cyan px-8 py-3 font-semibold text-black"
            >
              Try Again
            </button>
          )}
          <button className="rounded-full border border-white/20 px-8 py-3 text-white hover:bg-white/5">
            Review Answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{quiz.title}</h3>
          <span className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 flex gap-1">
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index < currentQuestion
                  ? selectedAnswers[index] === quiz.questions[index].correctIndex
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : index === currentQuestion
                  ? 'bg-neon-cyan'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-lg font-medium text-white">{question.question}</p>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === index;
            const showCorrect = isAnswered && index === question.correctIndex;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                  showCorrect
                    ? 'border-green-500 bg-green-500/10'
                    : showWrong
                    ? 'border-red-500 bg-red-500/10'
                    : isSelected
                    ? 'border-neon-cyan bg-neon-cyan/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                } ${isAnswered && !showCorrect && !showWrong ? 'opacity-50' : ''}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${
                  showCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : showWrong
                    ? 'border-red-500 bg-red-500 text-white'
                    : isSelected
                    ? 'border-neon-cyan bg-neon-cyan text-black'
                    : 'border-white/20 text-gray-400'
                }`}>
                  {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + index)}
                </span>
                <span className={`flex-1 ${
                  showCorrect ? 'text-green-400' : showWrong ? 'text-red-400' : 'text-white'
                }`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <div className={`mt-6 rounded-xl p-4 ${
            isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'
          }`}>
            <p className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Not quite...'}
            </p>
            <p className="mt-2 text-sm text-gray-300">{question.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="mt-6 w-full rounded-full bg-neon-cyan py-3 font-semibold text-black transition-all hover:bg-neon-cyan/90"
          >
            {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

// Mini quiz widget for content pages
export function QuizPrompt({ quiz, onStart }: { quiz: Quiz; onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/20 text-2xl">
          🧠
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Test Your Knowledge</h3>
          <p className="mt-1 text-sm text-gray-400">{quiz.description || `${quiz.questions.length} questions • ${quiz.passingScore}% to pass`}</p>
          <button
            onClick={onStart}
            className="mt-4 rounded-full bg-neon-purple px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-neon-purple/80"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
