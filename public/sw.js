const CACHE_NAME = 'notebook-cache-v1'

// Assets that should be pre-cached on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/logo.svg',
]

// ---- Lifecycle Events ----

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    )
})

// ---- Fetch Strategy ----

/**
 * Stale-While-Revalidate:
 *   1. If there's a cached response, return it immediately (fast!).
 *   2. At the same time, fetch from the network in the background.
 *   3. When the network response arrives, update the cache for next time.
 *
 * For hashed assets (/assets/*), use Cache-First since they are immutable.
 */
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Only handle same-origin GET requests
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return
    }

    // Hashed assets in /assets/ are immutable – Cache-First is enough
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(cacheFirst(request))
        return
    }

    // Navigation requests & other same-origin resources – Stale-While-Revalidate
    event.respondWith(staleWhileRevalidate(event))
})

// ---- Strategy Implementations ----

async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached

    const response = await fetch(request)
    if (response.ok) {
        const cache = await caches.open(CACHE_NAME)
        cache.put(request, response.clone())
    }
    return response
}

async function staleWhileRevalidate(event) {
    const request = event.request
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)

    // Fire off the network request regardless
    const networkPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone())
            }
            return response
        })
        .catch((err) => {
            // If network fails, return cached fallback if available
            if (cached) return cached
            // Otherwise throw to let browser handle the network error naturally
            throw err
        })

    // Keep service worker alive until network request completes and cache is updated
    event.waitUntil(networkPromise.catch(() => {}))

    // Return cached version immediately if available, otherwise wait for network
    return cached || networkPromise
}
