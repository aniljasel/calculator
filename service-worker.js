const CACHE_NAME = "calculator-cache-v1";
const assets = [
    "/",
    "/index.html",
    "/manifest.json",
    "/media/icon-192x192.png",
    "/media/icon-512x512.png",
    "/styles.css",
    "/script.js"
];

// Install event: Cache assets
self.addEventListener("install", (event) => {
    console.log("Service Worker Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching assets...");
            return cache.addAll(assets);
        }).then(() => {
            self.skipWaiting();
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker Activated!");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event: Serve from cache or network
self.addEventListener("fetch", (event) => {
    console.log("Fetching:", event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Cache new requests dynamically (except for external requests)
                    if (event.request.url.startsWith(self.location.origin)) {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            console.error("Network error, failed to fetch:", event.request.url);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match('/index.html'))
    );
});