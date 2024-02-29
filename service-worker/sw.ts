/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

const entries = self.__WB_MANIFEST
if (import.meta.env.DEV) {
  entries.push({ url: '/', revision: Math.random().toString() })
}

precacheAndRoute(entries)

// clean old assets
cleanupOutdatedCaches()

// allow only fallback in dev: we don't want to cache anything
let allowlist: undefined | RegExp[]
if (import.meta.env.DEV) {
  allowlist = [/^\/$/]
}

// deny api and server page calls
let denylist: undefined | RegExp[]
if (import.meta.env.PROD) {
  denylist = [
    /^\/api\//,
    // exclude sw: if the user navigates to it, fallback to index.html
    /^\/sw.js$/,
    // exclude webmanifest: has its own cache
    /^\/manifest-(.*).webmanifest$/,
  ]
}

// only cache pages and external assets on local build + start or in production
if (import.meta.env.PROD) {
  // include webmanifest cache
  registerRoute(
    ({ request, sameOrigin }) =>
      sameOrigin && request.destination === 'manifest',
    new NetworkFirst({
      cacheName: 'doulog-webmanifest',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        // we only need a few entries
        new ExpirationPlugin({ maxEntries: 100 }),
      ],
    }),
  )

  // Aliyun CDN, cache first, store for 30 days
  registerRoute(
    ({ url }) => url.host === 'cdn.daidr.me',
    new StaleWhileRevalidate({
      cacheName: 'cdn-image-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    }),
  )

  // sm.ms CDN, cache first, store for 30 days
  registerRoute(
    ({ url }) => url.host === 'i.loli.net',
    new CacheFirst({
      cacheName: 'cdn-image-smms',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    }),
  )
}

// to allow work offline
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('/'),
  { allowlist, denylist },
))
