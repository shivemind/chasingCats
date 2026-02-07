'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const defaultTourSteps: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Welcome to Chasing Cats! 🐱',
    content: 'Your journey to wildlife photography mastery begins here. Let us show you around!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="library"]',
    title: 'Content Library',
    content: 'Access our entire collection of tutorials, masterclasses, and photography guides.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="events"]',
    title: 'Live Events',
    content: 'Join live workshops, Q&A sessions, and photo critiques with expert photographers.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="community"]',
    title: 'Community',
    content: 'Connect with fellow photographers, share your work, and get feedback.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="search"]',
    title: 'Quick Search',
    content: 'Press ⌘K (or Ctrl+K) anytime to search across all content, events, and members.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Your Dashboard',
    content: 'Track your progress, continue watching, and see personalized recommendations.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Stay Updated',
    content: 'Get notified about new content, upcoming events, and community activity.',
    placement: 'bottom',
  },
];

interface OnboardingTourProps {
  steps?: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ steps = defaultTourSteps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isReady, setIsReady] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Find and highlight target element
  const updateTargetPosition = useCallback(() => {
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      setIsReady(true);
      
      // Scroll into view if needed
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Skip this step if target not found
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  }, [step.target, currentStep, steps.length, onComplete]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (step.action) {
      step.action();
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
      setIsReady(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsReady(false);
    }
  };

  if (!isReady || !targetRect) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    let top = 0;
    let left = 0;
    
    switch (step.placement) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + padding;
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
    }
    
    // Keep within viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    
    return { top, left };
  };

  const position = getTooltipPosition();

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.75)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border */}
      <div
        className="absolute rounded-xl border-2 border-neon-cyan shadow-[0_0_20px_rgba(0,245,212,0.5)] pointer-events-none animate-pulse"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute w-80 rounded-2xl border border-white/10 bg-deep-space shadow-2xl animate-scale-in"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep 
                  ? 'w-6 bg-neon-cyan' 
                  : index < currentStep
                  ? 'w-1.5 bg-neon-cyan/50'
                  : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
          <p className="text-sm text-gray-400">{step.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip tour
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex h-9 items-center gap-1 rounded-full border border-white/10 px-4 text-sm text-white hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex h-9 items-center gap-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-4 text-sm font-medium text-white"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Hook to manage tour state
export function useOnboardingTour(storageKey = 'onboarding_completed') {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Delay start to let page render
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const completeTour = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setShowTour(false);
  }, [storageKey]);

  const skipTour = useCallback(() => {
    localStorage.setItem(storageKey, 'skipped');
    setShowTour(false);
  }, [storageKey]);

  const restartTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setShowTour(true);
  }, [storageKey]);

  return {
    showTour,
    completeTour,
    skipTour,
    restartTour,
  };
}

// Button to restart tour
export function RestartTourButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Take the Tour
    </button>
  );
}
