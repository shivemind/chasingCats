import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const [userCount, contentCount, eventCount, activeMembers] = await Promise.all([
    prisma.user.count(),
    prisma.content.count(),
    prisma.event.count(),
    prisma.membership.count({ where: { status: 'ACTIVE' } })
  ]);

  const recentContent = await prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, type: true, createdAt: true }
  });

  const upcomingEvents = await prisma.event.findMany({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    take: 3
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-white/60">Welcome to the Chasing Cats admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm font-medium text-white/60">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-neon-cyan">{userCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm font-medium text-white/60">Active Members</p>
          <p className="mt-2 text-3xl font-bold text-cat-eye">{activeMembers}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm font-medium text-white/60">Content Items</p>
          <p className="mt-2 text-3xl font-bold text-neon-purple">{contentCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm font-medium text-white/60">Events</p>
          <p className="mt-2 text-3xl font-bold text-accent">{eventCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/content/new"
            className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-6 py-3 text-sm font-semibold text-night transition hover:shadow-glow"
          >
            + Add Content
          </Link>
          <Link
            href="/admin/events/new"
            className="rounded-xl bg-gradient-to-r from-accent to-cat-eye px-6 py-3 text-sm font-semibold text-night transition hover:shadow-glow-accent"
          >
            + Create Event
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Manage Users
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Content</h2>
            <Link href="/admin/content" className="text-sm text-neon-cyan hover:text-white">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentContent.length === 0 ? (
              <p className="text-white/50">No content yet</p>
            ) : (
              recentContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/content/${item.id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-neon-cyan/30"
                >
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
            <Link href="/admin/events" className="text-sm text-neon-cyan hover:text-white">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-white/50">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-accent/30"
                >
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {new Date(event.startTime).toLocaleDateString()} at{' '}
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.zoomLink && (
                    <p className="mt-2 text-xs text-neon-cyan">Meeting link configured ✓</p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
