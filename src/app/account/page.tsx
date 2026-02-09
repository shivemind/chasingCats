import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AnimatedDashboard } from '@/components/account/animated-dashboard';
import type { Metadata } from 'next';
import type { User, Profile, Membership, WatchStatus, Question, Content } from '@prisma/client';

type UserWithRelations = User & {
  profile: Profile | null;
  memberships: Membership[];
  watchStatuses: (WatchStatus & { content: Content })[];
  questions: (Question & { content: Content | null; event: { title: string } | null })[];
};

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard for tracking progress and managing your wildlife photography education.',
};

async function getAccountData(userId: string): Promise<UserWithRelations | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      memberships: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      watchStatuses: {
        include: {
          content: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      },
      questions: {
        include: {
          content: true,
          event: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  }) as unknown as Promise<UserWithRelations | null>;
}

async function getNextTalk() {
  const now = new Date();
  return prisma.event.findFirst({
    where: {
      startTime: { gte: now },
    },
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      startTime: true,
      host: true,
    },
  });
}

async function getContentByCategory(categorySlug: string, take: number = 6) {
  return prisma.content.findMany({
    where: {
      category: { slug: categorySlug },
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      duration: true,
    },
  });
}

type LatestContent = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  duration: number | null;
  type: string;
  publishedAt: Date | null;
  category: { name: string } | null;
};

async function getLatestContent(take: number = 6): Promise<LatestContent[]> {
  return prisma.content.findMany({
    where: {
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      duration: true,
      type: true,
      publishedAt: true,
      category: {
        select: { name: true }
      }
    },
  }) as unknown as Promise<LatestContent[]>;
}

type RecentPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    name: string | null;
    profile: { username: string } | null;
  };
  _count: { comments: number };
};

async function getRecentPosts(take: number = 6): Promise<RecentPost[]> {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          profile: {
            select: { username: true }
          }
        }
      },
      _count: {
        select: { comments: true }
      }
    }
  }) as unknown as Promise<RecentPost[]>;
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account');
  }

  const [user, nextTalk, expertsContent, fieldContent, latestContent, recentPosts, reactionCounts] = await Promise.all([
    getAccountData(session.user.id),
    getNextTalk(),
    getContentByCategory('experts', 6),
    getContentByCategory('field', 6),
    getLatestContent(6),
    getRecentPosts(6),
    // Get reaction counts for the posts
    prisma.post.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    }).then(async (posts) => {
      const postIds = posts.map(p => p.id);
      const counts = await prisma.reaction.groupBy({
        by: ['postId', 'type'],
        where: { postId: { in: postIds } },
        _count: { type: true }
      });
      return counts as Array<{ postId: string; type: 'PURR' | 'ROAR'; _count: { type: number } }>;
    })
  ]);

  if (!user) {
    redirect('/login');
  }

  const membership = user.memberships[0];
  
  // Transform data for the animated dashboard
  const dashboardUser = {
    name: user.name,
    email: user.email,
    profile: user.profile ? {
      username: user.profile.username,
      favoriteCat: user.profile.favoriteCat
    } : null,
    membership: membership ? {
      status: membership.status,
      plan: membership.plan,
      hasStripeCustomer: !!membership.stripeCustomerId
    } : null,
    stats: {
      watched: user.watchStatuses.filter(w => w.watched).length,
      courses: user.watchStatuses.filter(w => w.watched && w.content.type === 'COURSE').length,
      questions: user.questions.length,
      watchlist: user.watchStatuses.length
    },
    questions: user.questions.map(q => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      status: q.status,
      answeredAt: q.answeredAt,
      contentTitle: q.content?.title ?? null,
      eventTitle: q.event?.title ?? null
    })),
    watchStatuses: user.watchStatuses.map(w => ({
      id: w.id,
      watched: w.watched,
      content: {
        title: w.content.title,
        slug: w.content.slug,
        type: w.content.type
      }
    }))
  };

  // Transform next talk data
  const dashboardNextTalk = nextTalk ? {
    id: nextTalk.id,
    title: nextTalk.title,
    speaker: nextTalk.host ?? 'TBD',
    description: nextTalk.description ?? '',
    scheduledAt: nextTalk.startTime,
    slug: nextTalk.slug,
  } : null;

  // Transform content data
  const dashboardExperts = expertsContent.map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    thumbnail: c.thumbnailUrl,
    duration: c.duration ? `${c.duration} min` : undefined,
  }));

  const dashboardField = fieldContent.map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    thumbnail: c.thumbnailUrl,
    duration: c.duration ? `${c.duration} min` : undefined,
  }));

  const dashboardLatest = latestContent.map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    thumbnail: c.thumbnailUrl,
    duration: c.duration ? `${c.duration} min` : undefined,
    type: c.type,
    category: c.category?.name,
    publishedAt: c.publishedAt,
  }));

  // Transform feed posts with reaction counts
  const reactionCountMap = new Map<string, { purrs: number; roars: number }>();
  for (const r of reactionCounts) {
    const current = reactionCountMap.get(r.postId) || { purrs: 0, roars: 0 };
    if (r.type === 'PURR') current.purrs = r._count.type;
    if (r.type === 'ROAR') current.roars = r._count.type;
    reactionCountMap.set(r.postId, current);
  }

  const feedPosts = recentPosts.map(p => ({
    id: p.id,
    content: p.content,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
    author: p.author,
    _count: p._count,
    reactionCounts: reactionCountMap.get(p.id) || { purrs: 0, roars: 0 },
  }));

  return (
    <AnimatedDashboard 
      user={dashboardUser} 
      nextTalk={dashboardNextTalk}
      expertsContent={dashboardExperts}
      fieldContent={dashboardField}
      latestContent={dashboardLatest}
      feedPosts={feedPosts}
    />
  );
}
