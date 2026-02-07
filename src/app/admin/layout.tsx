import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/admin');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    redirect('/account?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-midnight">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-deep-space">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-2 w-4 animate-pulse rounded-full bg-accent" />
                <span className="h-2 w-4 animate-pulse rounded-full bg-accent" />
              </span>
              <span className="text-lg font-bold text-white">Admin Panel</span>
            </Link>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <span>📊</span> Dashboard
            </Link>
            <Link
              href="/admin/content"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <span>📝</span> Content
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <span>📅</span> Events & Meetings
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <span>👥</span> Users
            </Link>
          </nav>
          
          <div className="border-t border-white/10 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <span>←</span> Back to Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
