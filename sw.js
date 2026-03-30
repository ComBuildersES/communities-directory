const CACHE_NAME = "community-builders-shell-1774875104045";
const APP_CACHE_PREFIX = "community-builders-shell-";
const APP_SHELL = ["./", "./manifest.webmanifest"];
const DATA_FILE_PATTERN = /\/data\/.+\.(json|geojson)$/;
const LOCAL_DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);
const IS_LOCAL_DEVELOPMENT = LOCAL_DEV_HOSTNAMES.has(self.location.hostname);

if (IS_LOCAL_DEVELOPMENT) {
  self.addEventListener("install", () => {
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        const appCaches = cacheNames.filter((cacheName) => cacheName.startsWith(APP_CACHE_PREFIX));
        await Promise.all(appCaches.map((cacheName) => caches.delete(cacheName)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        await Promise.all(clients.map((client) => client.navigate(client.url)));
      })()
    );
  });
} else {

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse?.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-cache" }).catch(() => caches.match("./"))
    );
    return;
  }

  if (DATA_FILE_PATTERN.test(requestUrl.pathname)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
}
