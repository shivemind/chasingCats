import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendPushToAll, sendPushToUser } from '@/lib/web-push';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, body, url, userId, sendToAll } = await request.json();
    
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 });
    }

    const payload = {
      title,
      body,
      url: url || '/',
      icon: '/icon-192.png'
    };

    let result;

    if (sendToAll) {
      result = await sendPushToAll(payload);
    } else if (userId) {
      result = await sendPushToUser(userId, payload);
    } else {
      return NextResponse.json({ error: 'Specify userId or sendToAll' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      sent: result.sent, 
      failed: result.failed,
      message: `Sent ${result.sent} notifications${result.failed > 0 ? `, ${result.failed} failed` : ''}`
    });
  } catch (error) {
    console.error('Failed to send push notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
