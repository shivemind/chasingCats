import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { checkContentAccess } from '@/lib/access';
import { ContentCard } from '@/components/shared/content-card';
import Link from 'next/link';
import type { Content, Category } from '@prisma/client';

type ContentWithCategory = Content & { category: Category | null };

export const metadata = {
  title: 'Recent Content | Chasing Cats Club',
  description: 'Access the latest expert talks, field guides, and exclusive content for members.'
};

export default async function RecentContentPage() {
  const session = await auth();
  
  // Check if user is logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/content');
  }

  // Check if user has premium access
  const accessStatus = await checkContentAccess(session.user.id);
  
  if (!accessStatus.hasAccess) {
    redirect('/join?reason=premium');
  }

  // Fetch recently published content (last 30 days or most recent 20 items)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentContent = await prisma.content.findMany({
    where: {
      publishedAt: { not: null }
    },
    include: {
      category: true
    },
    orderBy: { publishedAt: 'desc' },
    take: 20
  }) as unknown as ContentWithCategory[];

  // Separate content into "new this week" and "recent"
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const newThisWeek = recentContent.filter(
    (c) => c.publishedAt && new Date(c.publishedAt) >= oneWeekAgo
  );
  const olderRecent = recentContent.filter(
    (c) => c.publishedAt && new Date(c.publishedAt) < oneWeekAgo
  );

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-emerald-900 via-green-800 to-emerald-950 -mt-[1px] pt-[1px]">
      {/* Jungle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Tropical overlay pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c8 15 25 15 30 30-15 8-15 25-30 30-8-15-25-15-30-30 15-8 15-25 30-30z' fill='%23fff' fill-opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating jungle elements */}
        <div className="absolute top-[10%] left-[5%] text-6xl opacity-20 animate-pulse">🌿</div>
        <div className="absolute top-[20%] right-[10%] text-5xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute top-[50%] left-[8%] text-4xl opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}>🌴</div>
        <div className="absolute top-[35%] right-[5%] text-7xl opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }}>🌿</div>
        <div className="absolute top-[70%] left-[12%] text-5xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>🍃</div>
        <div className="absolute top-[80%] right-[15%] text-4xl opacity-15 animate-pulse" style={{ animationDelay: '0.8s' }}>🌱</div>
        <div className="absolute top-[5%] left-[50%] text-3xl opacity-25 animate-pulse" style={{ animationDelay: '1.2s' }}>🦜</div>
        <div className="absolute top-[90%] right-[45%] text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1.8s' }}>🦋</div>
        
        {/* Light rays through canopy */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-emerald-400/5" />
        
        {/* Misty atmosphere at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950/60 to-transparent" />
      </div>

      <section className="container-section py-12 sm:py-16 md:py-24 relative z-10">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-300">
              Recently Added
            </p>
            <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-semibold text-white drop-shadow-lg">
              Fresh content for you
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-emerald-100/90">
              The latest expert talks, field guides, and exclusive content—uploaded just for members like you.
            </p>
          </div>
          <Link 
            href="/library" 
            className="text-xs sm:text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Browse full library →
          </Link>
        </div>

        {/* New This Week Section */}
        {newThisWeek.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-semibold text-white">New this week</h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                {newThisWeek.length}
              </span>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newThisWeek.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  eyebrow={content.category?.name ?? content.type}
                  variant="dark"
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Section */}
        {olderRecent.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-6">Recently added</h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {olderRecent.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  eyebrow={content.category?.name ?? content.type}
                  variant="dark"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recentContent.length === 0 && (
          <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm p-8 sm:p-12 text-center">
            <p className="text-base sm:text-lg font-semibold text-white">No content yet</p>
            <p className="mt-2 text-xs sm:text-sm text-white/70">
              New content is being added regularly. Check back soon!
            </p>
            <Link
              href="/library"
              className="mt-3 sm:mt-4 inline-flex text-xs sm:text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Browse the full library →
            </Link>
          </div>
        )}

        {/* Access info banner */}
        <div className="mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-emerald-900/30 backdrop-blur-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {accessStatus.reason === 'active_subscription' && '✓ Active member'}
                {accessStatus.reason === 'educational_pass' && '✓ Educational pass'}
                {accessStatus.reason === 'admin' && '✓ Admin access'}
              </p>
              <p className="mt-1 text-xs text-white/70">
                {accessStatus.reason === 'educational_pass' && accessStatus.educationalPassExpiry
                  ? `Your pass is valid until ${new Date(accessStatus.educationalPassExpiry).toLocaleDateString()}`
                  : 'You have full access to all premium content'}
              </p>
            </div>
            <Link
              href="/account"
              className="text-xs sm:text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Manage subscription →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
