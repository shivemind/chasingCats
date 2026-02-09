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
    <div className="bg-white">
      <section className="container-section py-12 sm:py-16 md:py-24">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand/70">
              Recently Added
            </p>
            <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-semibold text-night">
              Fresh content for you
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-night/70">
              The latest expert talks, field guides, and exclusive content—uploaded just for members like you.
            </p>
          </div>
          <Link 
            href="/library" 
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Browse full library →
          </Link>
        </div>

        {/* New This Week Section */}
        {newThisWeek.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
              <h2 className="text-lg sm:text-xl font-semibold text-night">New this week</h2>
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                {newThisWeek.length}
              </span>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newThisWeek.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  eyebrow={content.category?.name ?? content.type}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Section */}
        {olderRecent.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <h2 className="text-lg sm:text-xl font-semibold text-night mb-6">Recently added</h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {olderRecent.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  eyebrow={content.category?.name ?? content.type}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recentContent.length === 0 && (
          <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-night/10 bg-[#F5F1E3]/30 p-8 sm:p-12 text-center">
            <p className="text-base sm:text-lg font-semibold text-night">No content yet</p>
            <p className="mt-2 text-xs sm:text-sm text-night/70">
              New content is being added regularly. Check back soon!
            </p>
            <Link
              href="/library"
              className="mt-3 sm:mt-4 inline-flex text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Browse the full library →
            </Link>
          </div>
        )}

        {/* Access info banner */}
        <div className="mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl border border-brand/20 bg-brand/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-night">
                {accessStatus.reason === 'active_subscription' && '✓ Active member'}
                {accessStatus.reason === 'educational_pass' && '✓ Educational pass'}
                {accessStatus.reason === 'admin' && '✓ Admin access'}
              </p>
              <p className="mt-1 text-xs text-night/70">
                {accessStatus.reason === 'educational_pass' && accessStatus.educationalPassExpiry
                  ? `Your pass is valid until ${new Date(accessStatus.educationalPassExpiry).toLocaleDateString()}`
                  : 'You have full access to all premium content'}
              </p>
            </div>
            <Link
              href="/account"
              className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Manage subscription →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
