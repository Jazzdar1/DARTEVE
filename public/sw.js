// public/sw.js
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[DarTV] App Engine Activated');
});

// Chrome requires this fetch event to show the "Install App" prompt!
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => new Response('You are offline'))
  );
});