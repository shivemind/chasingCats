'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export function PushNotificationPrompt() {
  const { status } = useSession();
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if push is supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported');
      return;
    }

    // Check if dismissed
    if (localStorage.getItem('push-prompt-dismissed')) {
      setIsDismissed(true);
    }

    // Check current permission
    setPermission(Notification.permission as PermissionState);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    });
  }, []);

  const subscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID key
      const keyResponse = await fetch('/api/push/subscribe');
      if (!keyResponse.ok) {
        throw new Error('Push notifications not configured');
      }
      const { vapidPublicKey } = await keyResponse.json();

      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission as PermissionState);

      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const applicationKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationKey as BufferSource
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem('push-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  // Don't show if not logged in, unsupported, already subscribed, or dismissed
  if (
    status !== 'authenticated' ||
    permission === 'unsupported' ||
    permission === 'denied' ||
    isSubscribed ||
    isDismissed
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-sm animate-slide-up">
      <div className="rounded-2xl border border-white/10 bg-deep-space/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neon-cyan/20">
            <span className="text-xl">🔔</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Stay Updated</h3>
            <p className="mt-1 text-sm text-gray-400">
              Get notified about live events, new content, and streak reminders.
            </p>
            {error && (
              <p className="mt-2 text-xs text-red-400">{error}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={subscribe}
                disabled={isLoading}
                className="rounded-lg bg-neon-cyan px-4 py-2 text-sm font-medium text-black transition hover:bg-neon-cyan/90 disabled:opacity-50"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                onClick={dismiss}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 transition hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Compact notification toggle for settings
export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
        setIsLoading(false);
      });
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const toggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });
        }
        setIsSubscribed(false);
      } else {
        // Subscribe
        const keyResponse = await fetch('/api/push/subscribe');
        const { vapidPublicKey } = await keyResponse.json();

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permission denied');
        }

        const applicationKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationKey as BufferSource
        });

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() })
        });

        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <p className="font-medium text-white">Push Notifications</p>
            <p className="text-xs text-gray-500">Not supported in this browser</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔔</span>
        <div>
          <p className="font-medium text-white">Push Notifications</p>
          <p className="text-xs text-gray-500">
            {isSubscribed ? 'Enabled' : 'Get notified about events and content'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={isLoading}
        className={`h-6 w-12 rounded-full transition-colors ${
          isSubscribed ? 'bg-neon-cyan' : 'bg-white/10'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
          isSubscribed ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}
