import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AnimatedDashboard } from '@/components/account/animated-dashboard';

async function getAccountData(userId: string) {
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
          content: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account');
  }

  const user = await getAccountData(session.user.id);

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
      plan: membership.plan
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
      status: q.status,
      contentTitle: q.content?.title ?? null
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

  return <AnimatedDashboard user={dashboardUser} />;
}
