// Service Worker for Tini PMS PWA
const CACHE_NAME = 'tini-pms-v2';

// Cache static assets on install
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/apple-touch-icon.png',
      ]);
    })
  );
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Network first for navigation, never intercept Next.js chunks or APIs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // CRITICAL: NEVER intercept or cache /_next/ (Turbopack, HMR, JS chunks) or /api/
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    return;
  }

  // For navigation requests (HTML pages) — network first, fallback to cached '/'
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then((r) => r || fetch(event.request))
      )
    );
    return;
  }

  // Only cache static public assets (icons, images, manifest)
  if (
    url.pathname.startsWith('/icon-') ||
    url.pathname === '/apple-touch-icon.png' ||
    url.pathname === '/favicon-32x32.png' ||
    url.pathname.endsWith('.webmanifest')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }
            const toCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
            return response;
          })
        );
      })
    );
  }
});

// Background Web Push Notification (Hoạt động kể cả khi tắt hẳn app/khóa màn hình)
self.addEventListener('push', (event) => {
  let data = { title: 'Tini PMS', body: 'Bạn có yêu cầu phối hợp mới', url: '/ke-hoach' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const title = data.title || 'Tini PMS';
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'tini-pms-notification',
    renotify: true,
    data: { url: data.url || '/ke-hoach' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/ke-hoach';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
