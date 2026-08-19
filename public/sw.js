const CACHE_NAME = "teachx-offline-v3";
const OFFLINE_URL = "/offline";
const APP_SHELL = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png"];
const PUBLIC_PAGES = new Set(["/pricing", "/trust", "/teachers", "/students", "/privacy", "/terms", "/security", "/cookies", "/refund-policy", "/contact"]);
const MAX_RUNTIME_ENTRIES = 80;

async function trim(cache) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_RUNTIME_ENTRIES)).map((request) => cache.delete(request)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => undefined)))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_RUNTIME_CACHE") event.waitUntil(caches.delete(CACHE_NAME).then(() => caches.open(CACHE_NAME).then((cache) => Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => undefined))))));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && PUBLIC_PAGES.has(url.pathname) && !response.headers.get("Cache-Control")?.includes("no-store")) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
          await trim(cache);
        }
        return response;
      } catch {
        if (PUBLIC_PAGES.has(url.pathname)) {
          const cached = await caches.match(request);
          if (cached) return cached;
        }
        return (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })());
    return;
  }

  const staticAsset = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || ["style", "script", "font", "image"].includes(request.destination);
  if (!staticAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === "basic" && !response.headers.get("Cache-Control")?.includes("no-store")) {
      await cache.put(request, response.clone());
      await trim(cache);
    }
    return response;
  })());
});
