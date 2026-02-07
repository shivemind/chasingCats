import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Mock notifications - in production, these would come from a database
function getNotifications(userId: string) {
  // Generate some demo notifications based on user ID
  const notifications = [
    {
      id: '1',
      title: 'New Content Available',
      message: 'Check out "Mastering Lion Photography" - just released!',
      type: 'content' as const,
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      link: '/content',
    },
    {
      id: '2',
      title: 'Upcoming Live Event',
      message: 'Safari Photo Walk starts in 2 hours',
      type: 'event' as const,
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      link: '/events',
    },
    {
      id: '3',
      title: 'Welcome to ChasingCats!',
      message: 'Start your wildlife photography journey today',
      type: 'system' as const,
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ];

  return notifications;
}

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [] });
  }

  const notifications = getNotifications(session.user.id);
  
  return NextResponse.json({ notifications });
}
