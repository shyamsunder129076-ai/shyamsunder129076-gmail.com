// Mahi AI Assistant Service Worker - Full Offline & Online Support
const CACHE_NAME = "mahi-ai-v2";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET, API endpoints, Vite dev server, and WebSocket endpoints
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.url.includes("/live-ws") ||
    request.url.includes("/ws") ||
    request.url.includes("/node_modules/") ||
    request.url.includes("/@vite/") ||
    request.url.includes("/@fs/") ||
    request.url.includes("/src/") ||
    request.url.includes("?v=") ||
    request.url.includes("?t=") ||
    request.url.endsWith(".tsx") ||
    request.url.endsWith(".ts") ||
    request.url.startsWith("chrome-extension")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: return cached copy and update in background if online
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache static resources
      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (request.destination === "style" ||
              request.destination === "script" ||
              request.destination === "image" ||
              request.destination === "font" ||
              request.destination === "document")
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and navigating to page, fallback to cached index.html
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return caches.match(request);
        });
    })
  );
});
