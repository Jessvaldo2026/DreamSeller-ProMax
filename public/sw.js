// Service Worker for offline functionality
// Note: This will only work in production environments, not in StackBlitz/WebContainer
const CACHE_NAME = 'dreamseller-pro-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker caching files...');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.warn('Service Worker cache failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.warn('Service Worker fetch failed:', error);
        return fetch(event.request);
      }
    )
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync offline data when connection is restored
  const cache = await caches.open('offline-data');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.error('Sync failed for:', request.url);
    }
  }
}