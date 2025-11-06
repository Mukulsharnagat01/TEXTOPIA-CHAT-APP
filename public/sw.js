// Simple service worker for development
self.addEventListener('install', function(event) {
  console.log('Development service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Development service worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function(event) {
  console.log('Development service worker received message:', event.data);
});
