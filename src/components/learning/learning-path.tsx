'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface PathLesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration?: number;
  slug: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface PathModule {
  id: string;
  title: string;
  description: string;
  lessons: PathLesson[];
  isUnlocked: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  modules: PathModule[];
  instructor?: {
    name: string;
    avatarUrl?: string;
  };
  enrolledCount: number;
  rating: number;
}

interface LearningPathCardProps {
  path: LearningPath;
  isEnrolled?: boolean;
}

export function LearningPathCard({ path, isEnrolled }: LearningPathCardProps) {
  const totalLessons = path.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = path.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length, 0
  );
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const difficultyColors = {
    beginner: 'from-green-500 to-emerald-500',
    intermediate: 'from-yellow-500 to-orange-500',
    advanced: 'from-red-500 to-pink-500',
  };

  return (
    <Link
      href={`/learn/${path.id}`}
      className="group block rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden transition-all hover:border-neon-cyan/30 hover:shadow-[0_0_30px_rgba(0,245,212,0.1)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        {path.thumbnailUrl ? (
          <Image src={path.thumbnailUrl} alt={path.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
            <span className="text-5xl">📚</span>
          </div>
        )}
        
        {/* Difficulty badge */}
        <div className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white bg-gradient-to-r ${difficultyColors[path.difficulty]}`}>
          {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
        </div>

        {/* Progress overlay */}
        {isEnrolled && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white">{Math.round(progress)}% complete</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-white group-hover:text-neon-cyan transition-colors line-clamp-2">
          {path.title}
        </h3>
        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{path.description}</p>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            📖 {path.modules.length} modules
          </span>
          <span className="flex items-center gap-1">
            ⏱️ {path.estimatedHours}h
          </span>
          <span className="flex items-center gap-1">
            ⭐ {path.rating.toFixed(1)}
          </span>
        </div>

        {/* Instructor */}
        {path.instructor && (
          <div className="mt-4 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-white/10">
              {path.instructor.avatarUrl ? (
                <Image src={path.instructor.avatarUrl} alt={path.instructor.name} width={24} height={24} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs">
                  {path.instructor.name[0]}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">{path.instructor.name}</span>
          </div>
        )}

        {/* CTA */}
        <button className={`mt-4 w-full rounded-full py-2.5 text-sm font-semibold transition-all ${
          isEnrolled
            ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
        }`}>
          {isEnrolled ? (progress > 0 ? 'Continue Learning' : 'Start Learning') : 'Enroll Now'}
        </button>
      </div>
    </Link>
  );
}

// Detailed path view with modules
export function LearningPathDetail({ path, onEnroll: _onEnroll }: { path: LearningPath; onEnroll?: () => void }) {
  const [expandedModule, setExpandedModule] = useState<string | null>(path.modules[0]?.id);

  const totalLessons = path.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = path.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length, 0
  );

  const lessonTypeIcons = {
    video: '🎬',
    article: '📄',
    quiz: '🧠',
    assignment: '✏️',
  };

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Your Progress</h3>
          <span className="text-sm text-gray-400">{completedLessons}/{totalLessons} lessons</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
            style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {path.modules.map((module, moduleIndex) => {
          const moduleCompleted = module.lessons.filter(l => l.isCompleted).length;
          const isExpanded = expandedModule === module.id;

          return (
            <div 
              key={module.id}
              className={`rounded-2xl border transition-all ${
                module.isUnlocked 
                  ? 'border-white/10 bg-deep-space/50' 
                  : 'border-white/5 bg-white/5 opacity-60'
              }`}
            >
              {/* Module header */}
              <button
                onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                className="flex w-full items-center gap-4 p-5"
                disabled={!module.isUnlocked}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                  moduleCompleted === module.lessons.length
                    ? 'bg-green-500/20 text-green-400'
                    : module.isUnlocked
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {moduleCompleted === module.lessons.length ? '✓' : moduleIndex + 1}
                </div>
                
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${module.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {module.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {moduleCompleted}/{module.lessons.length} lessons completed
                  </p>
                </div>

                {module.isUnlocked ? (
                  <svg 
                    className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <span className="text-gray-500">🔒</span>
                )}
              </button>

              {/* Lessons */}
              {isExpanded && module.isUnlocked && (
                <div className="border-t border-white/10 p-4 space-y-2">
                  {module.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={lesson.isLocked ? '#' : `/content/${lesson.slug}`}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                        lesson.isLocked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl">{lessonTypeIcons[lesson.type]}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${lesson.isCompleted ? 'text-green-400' : 'text-white'}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration && (
                          <p className="text-xs text-gray-500">{lesson.duration} min</p>
                        )}
                      </div>
                      {lesson.isCompleted && (
                        <span className="text-green-400">✓</span>
                      )}
                      {lesson.isLocked && (
                        <span className="text-gray-500">🔒</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
