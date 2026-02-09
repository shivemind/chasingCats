import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { getOrCreateLearningPath, getLearningPathProgress } from '@/lib/learning-path';
import { getStreakData, getUserXP } from '@/lib/gamification';
import { checkContentAccess } from '@/lib/access';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Your Learning Path',
  description: 'Your personalized wildlife photography learning journey. Track progress, complete lessons, and level up your skills.',
  alternates: {
    canonical: `${SITE_URL}/learn`
  }
};

export default async function LearnPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/learn');
  }

  const accessStatus = await checkContentAccess(session.user.id);
  
  if (!accessStatus.hasAccess) {
    redirect('/join?reason=premium');
  }

  const [path, progress, streak, xp] = await Promise.all([
    getOrCreateLearningPath(session.user.id),
    getLearningPathProgress(session.user.id),
    getStreakData(session.user.id),
    getUserXP(session.user.id)
  ]);

  const completedItems = path.items.filter(i => i.isCompleted);
  const nextItem = path.items.find(i => !i.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-deep-space to-midnight">
      <div className="container-section py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">
            Your Learning Journey
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            {path.title}
          </h1>
          <p className="mt-2 text-white/60">{path.description}</p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/20">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{path.completed}/{path.totalItems}</p>
                <p className="text-xs text-white/50">Lessons Complete</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{streak.currentStreak}</p>
                <p className="text-xs text-white/50">Day Streak</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/20">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-neon-purple">Lv.{xp.level}</p>
                <p className="text-xs text-white/50">{xp.totalXP.toLocaleString()} XP</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{Math.round(progress.progress)}%</p>
                <p className="text-xs text-white/50">Path Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Overall Progress</h2>
            <span className="text-sm text-neon-cyan">{Math.round(progress.progress)}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(progress.byType).map(([type, data]) => (
              <div key={type} className="flex items-center gap-2 text-sm">
                <span className="text-white/50">{type}:</span>
                <span className="text-white">{data.completed}/{data.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Main Content */}
          <div>
            {/* Continue Learning */}
            {nextItem && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Continue Learning</h2>
                <Link 
                  href={`/content/${nextItem.content.slug}`}
                  className="group block rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 overflow-hidden transition-all hover:border-neon-cyan/50"
                >
                  <div className="flex flex-col sm:flex-row">
                    {nextItem.content.thumbnailUrl && (
                      <div className="relative aspect-video sm:aspect-square sm:w-48 flex-shrink-0">
                        <Image
                          src={nextItem.content.thumbnailUrl}
                          alt={nextItem.content.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-4xl">▶</span>
                        </div>
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-neon-cyan/20 px-2 py-0.5 text-xs font-medium text-neon-cyan">
                          Up Next
                        </span>
                        <span className="text-xs text-white/50">{nextItem.content.type}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">
                        {nextItem.content.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/60 line-clamp-2">
                        {nextItem.content.excerpt}
                      </p>
                      {nextItem.content.duration && (
                        <p className="mt-3 text-xs text-white/40">
                          {nextItem.content.duration} min
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* All Path Items */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Your Path</h2>
              <div className="space-y-3">
                {path.items.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/content/${item.content.slug}`}
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      item.isCompleted 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Number/Check */}
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                      item.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {item.isCompleted ? '✓' : index + 1}
                    </div>

                    {/* Thumbnail */}
                    {item.content.thumbnailUrl && (
                      <div className="relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.content.thumbnailUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${item.isCompleted ? 'text-green-400' : 'text-white/50'}`}>
                          {item.content.type}
                        </span>
                        {item.content.category && (
                          <>
                            <span className="text-white/30">•</span>
                            <span className="text-xs text-white/50">{item.content.category.name}</span>
                          </>
                        )}
                      </div>
                      <h3 className={`font-medium truncate ${
                        item.isCompleted ? 'text-white/70' : 'text-white group-hover:text-neon-cyan'
                      }`}>
                        {item.content.title}
                      </h3>
                    </div>

                    {/* Duration */}
                    {item.content.duration && (
                      <span className="text-sm text-white/40">{item.content.duration}m</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Completed Section */}
            {completedItems.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">Recently Completed</h3>
                <div className="space-y-3">
                  {completedItems.slice(-5).reverse().map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm text-white/70 truncate">{item.content.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate Path */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white mb-2">Want a fresh start?</h3>
              <p className="text-sm text-white/60 mb-4">
                Regenerate your learning path based on your current interests and progress.
              </p>
              <form action="/api/learning-path" method="POST">
                <button 
                  type="submit"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  🔄 Regenerate Path
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link 
                  href="/library" 
                  className="block rounded-lg bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  📚 Browse Library
                </Link>
                <Link 
                  href="/experts" 
                  className="block rounded-lg bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  🎓 Expert Talks
                </Link>
                <Link 
                  href="/events" 
                  className="block rounded-lg bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  📅 Upcoming Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
