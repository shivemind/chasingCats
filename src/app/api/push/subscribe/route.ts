import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { savePushSubscription, removePushSubscription, getVapidPublicKey } from '@/lib/web-push';

// Get VAPID public key
export async function GET() {
  const vapidKey = getVapidPublicKey();
  
  if (!vapidKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured' }, 
      { status: 503 }
    );
  }

  return NextResponse.json({ vapidPublicKey: vapidKey });
}

// Subscribe to push notifications
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await request.json();
    
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    const success = await savePushSubscription(session.user.id, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// Unsubscribe from push notifications
export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    await removePushSubscription(endpoint);

    return NextResponse.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
