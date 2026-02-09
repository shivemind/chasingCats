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

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account');
  }

  const [user, nextTalk, expertsContent, fieldContent] = await Promise.all([
    getAccountData(session.user.id),
    getNextTalk(),
    getContentByCategory('experts', 6),
    getContentByCategory('field', 6),
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

  return (
    <AnimatedDashboard 
      user={dashboardUser} 
      nextTalk={dashboardNextTalk}
      expertsContent={dashboardExperts}
      fieldContent={dashboardField}
    />
  );
}
