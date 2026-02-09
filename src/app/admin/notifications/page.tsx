import { prisma } from '@/lib/prisma';
import { getPushStats } from '@/lib/web-push';
import { SendPushForm } from './send-form';

export const metadata = {
  title: 'Push Notifications | Admin'
};

interface SubWithUser {
  id: string;
  createdAt: Date;
  user: { name: string | null; email: string | null };
}

export default async function AdminNotificationsPage() {
  const stats = await getPushStats();
  
  const recentSubscriptions: SubWithUser[] = await prisma.pushSubscription.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  }) as unknown as SubWithUser[];

  const hasVapidKeys = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Push Notifications</h1>
        <p className="mt-2 text-white/60">Send notifications and manage subscriptions</p>
      </div>

      {!hasVapidKeys && (
        <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <h2 className="font-semibold text-yellow-400 mb-2">⚠️ VAPID Keys Not Configured</h2>
          <p className="text-sm text-yellow-200/70 mb-4">
            Push notifications require VAPID keys. Add these environment variables:
          </p>
          <pre className="text-xs bg-black/20 rounded-lg p-3 text-yellow-200/60 overflow-x-auto">
{`NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:your@email.com`}
          </pre>
          <p className="text-xs text-yellow-200/50 mt-3">
            Generate VAPID keys using: npx web-push generate-vapid-keys
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/60">Total Subscriptions</p>
          <p className="mt-2 text-3xl font-bold text-neon-cyan">{stats.totalSubscriptions}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/60">Unique Users</p>
          <p className="mt-2 text-3xl font-bold text-neon-purple">{stats.uniqueUsers}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/60">Avg per User</p>
          <p className="mt-2 text-3xl font-bold text-cat-eye">
            {stats.uniqueUsers > 0 ? (stats.totalSubscriptions / stats.uniqueUsers).toFixed(1) : 0}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Send Notification Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Send Notification</h2>
          <SendPushForm disabled={!hasVapidKeys} />
        </div>

        {/* Recent Subscriptions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Subscriptions</h2>
          <div className="space-y-3">
            {recentSubscriptions.length === 0 ? (
              <p className="text-white/50">No subscriptions yet</p>
            ) : (
              recentSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{sub.user.name || 'Anonymous'}</p>
                    <p className="text-xs text-white/50">{sub.user.email}</p>
                  </div>
                  <p className="text-xs text-white/40">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Send Templates */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-neon-cyan mb-2">🔴 Event Starting</h3>
            <p className="text-xs text-white/60 mb-2">
              Title: "Live Event Starting Now!"<br/>
              Body: "Join us for [Event Name] - happening right now!"
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-neon-purple mb-2">📹 New Content</h3>
            <p className="text-xs text-white/60 mb-2">
              Title: "New Video Just Dropped!"<br/>
              Body: "Check out our latest content: [Title]"
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-orange-400 mb-2">🔥 Streak Reminder</h3>
            <p className="text-xs text-white/60 mb-2">
              Title: "Don't lose your streak!"<br/>
              Body: "You haven't visited today. Keep your streak going!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
