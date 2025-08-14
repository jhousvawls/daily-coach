// Daily Focus Coach Service Worker
const CACHE_NAME = 'daily-focus-coach-v1.0.2';
const STATIC_CACHE_NAME = 'daily-focus-coach-static-v1.0.2';
const DYNAMIC_CACHE_NAME = 'daily-focus-coach-dynamic-v1.0.2';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (APIs, etc.)
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // If we have a cached version, serve it
        if (cachedResponse) {
          // For HTML files, also fetch from network to check for updates
          if (request.destination === 'document') {
            fetchAndCache(request);
          }
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetchAndCache(request);
      })
      .catch(() => {
        // Network failed, try to serve offline fallback
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Helper function to fetch and cache resources
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Don't cache non-successful responses
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone the response since it can only be consumed once
      const responseToCache = response.clone();
      const url = new URL(request.url);

      // Determine which cache to use
      let cacheName = DYNAMIC_CACHE_NAME;
      if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
        cacheName = STATIC_CACHE_NAME;
      }

      // Cache the response
      caches.open(cacheName)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    });
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
});

// Notify clients when a new version is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Force update check by trying to fetch the latest version
    fetch('/sw.js', { cache: 'no-cache' })
      .then(response => response.text())
      .then(swContent => {
        // Simple version check - in a real app you might want more sophisticated versioning
        const currentVersion = swContent.match(/CACHE_NAME = '([^']+)'/);
        if (currentVersion && currentVersion[1] !== CACHE_NAME) {
          // New version available
          event.ports[0].postMessage({
            type: 'UPDATE_AVAILABLE',
            newVersion: currentVersion[1],
            currentVersion: CACHE_NAME
          });
        } else {
          event.ports[0].postMessage({
            type: 'NO_UPDATE',
            currentVersion: CACHE_NAME
          });
        }
      })
      .catch(error => {
        console.error('[SW] Error checking for updates:', error);
        event.ports[0].postMessage({
          type: 'UPDATE_ERROR',
          error: error.message
        });
      });
  }
});
