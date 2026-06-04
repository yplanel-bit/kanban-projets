const CACHE_NAME = 'kanban-v4';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './404.html',
  './manifest.json',
  './service-worker.js'
];

// Installation : cache les fichiers
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activation : nettoie les anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes : sert depuis le cache si offline, utilise fetch sinon
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) { return response; }
      // Fallback pour les requêtes racine
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return fetch(e.request);
    }).catch(() => {
      // En dernier recours, retourne index.html
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
