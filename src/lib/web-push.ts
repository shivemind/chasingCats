/**
 * Web Push Notifications
 * 
 * This module handles web push notification subscriptions and sending.
 * Requires VAPID keys to be set in environment variables:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY
 * - VAPID_PRIVATE_KEY
 * - VAPID_EMAIL (mailto: contact email)
 */

import { prisma } from '@/lib/prisma';

// Types
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

// Get VAPID public key for client
export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

// Save push subscription to database
export async function savePushSubscription(
  userId: string, 
  subscription: PushSubscriptionData
): Promise<boolean> {
  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
}

// Remove push subscription
export async function removePushSubscription(endpoint: string): Promise<boolean> {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint }
    });
    return true;
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return false;
  }
}

// Send push notification to a specific user
export async function sendPushToUser(
  userId: string, 
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (success) sent++;
    else failed++;
  }

  return { sent, failed };
}

// Send push notification to all users
export async function sendPushToAll(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany();

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (success) sent++;
    else failed++;
  }

  return { sent, failed };
}

// Send push notification to specific subscription
async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<boolean> {
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:hello@chasingcats.club';

  if (!vapidPrivateKey || !vapidPublicKey) {
    console.warn('VAPID keys not configured, skipping push notification');
    return false;
  }

  try {
    // Dynamic import to avoid issues when web-push is not installed
    const webPush = await import('web-push').catch(() => null);
    
    if (!webPush) {
      console.warn('web-push package not installed');
      return false;
    }

    webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag,
      data: {
        url: payload.url || '/',
        ...payload.data
      }
    });

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      },
      pushPayload
    );

    return true;
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    
    // Handle expired subscriptions
    if (statusCode === 404 || statusCode === 410) {
      await removePushSubscription(subscription.endpoint);
    }
    
    console.error('Failed to send push notification:', error);
    return false;
  }
}

// Get push notification statistics
export async function getPushStats() {
  const [totalSubscriptions, uniqueUsers] = await Promise.all([
    prisma.pushSubscription.count(),
    prisma.pushSubscription.groupBy({
      by: ['userId'],
      _count: true
    })
  ]);

  return {
    totalSubscriptions,
    uniqueUsers: uniqueUsers.length
  };
}
