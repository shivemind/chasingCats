/**
 * Service Worker for Push Notifications
 * Chasing Cats Club
 */

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Push notification received
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    console.warn('[SW] Push event has no data');
    return;
  }

  try {
    const payload = event.data.json();
    
    const options = {
      body: payload.body || 'New notification from Chasing Cats',
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag || 'chasing-cats-notification',
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: payload.data || {},
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(payload.title || 'Chasing Cats', options)
    );
  } catch (error) {
    console.error('[SW] Error processing push notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Get URL from notification data
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none found
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Background sync for offline functionality (future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});
