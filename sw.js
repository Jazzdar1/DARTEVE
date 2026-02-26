self.addEventListener('install', (e) => {
  console.log('[DarTV] Service Worker Installed');
});

self.addEventListener('fetch', (e) => {
  // Mobile ko batane ke liye ke hum offline bhi zinda hain
});