importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js");

const {Route, registerRoute} = workbox.routing;
const {CacheFirst, NetworkFirst, StaleWhileRevalidate} = workbox.strategies;
const {CacheableResponsePlugin} = workbox.cacheableResponse;
const {ExpirationPlugin} = workbox.expiration;

const DAY = 24 * 60 * 60; // in seconds

// Only cache same-origin requests to avoid caching external/CDN resources
const sameOrigin = ({url}) => url.origin === location.origin;

registerRoute(
  ({request}) => request.mode === "navigate" && sameOrigin({url: new URL(request.url)}),
  new NetworkFirst({
    networkTimeoutSeconds: 15,
    cacheName: "fmg-html",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 50, maxAgeSeconds: 7 * DAY})
    ]
  })
);

registerRoute(
  ({request, url}) =>
    request.destination === "script" &&
    sameOrigin({url}) &&
    !url.pathname.endsWith("min.js") &&
    !url.pathname.includes("versioning.js") &&
    !url.pathname.includes("google"),
  new StaleWhileRevalidate({
    cacheName: "fmg-scripts",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 30 * DAY})
    ]
  })
);

registerRoute(
  ({request}) => request.destination === "style" && sameOrigin({url: new URL(request.url)}),
  new CacheFirst({
    cacheName: "fmg-stylesheets",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 30 * DAY})
    ]
  })
);

registerRoute(
  ({request, url}) =>
    request.destination === "script" &&
    sameOrigin({url}) &&
    url.pathname.endsWith("min.js"),
  new CacheFirst({
    cacheName: "fmg-libs",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 30 * DAY})
    ]
  })
);

registerRoute(
  ({request, url}) =>
    sameOrigin({url}) &&
    (url.pathname.endsWith(".json") || url.pathname.endsWith(".jsonl")),
  new CacheFirst({
    cacheName: "fmg-json",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 30 * DAY})
    ]
  })
);

registerRoute(
  ({request}) => request.destination === "image" && sameOrigin({url: new URL(request.url)}),
  new CacheFirst({
    cacheName: "fmg-images",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 60 * DAY})
    ]
  })
);

registerRoute(
  ({request, url}) =>
    sameOrigin({url}) &&
    (url.pathname.endsWith(".svg") || url.pathname.endsWith(".svgz")),
  new CacheFirst({
    cacheName: "fmg-charges",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 60 * DAY})
    ]
  })
);

registerRoute(
  ({request}) => request.destination === "font" && sameOrigin({url: new URL(request.url)}),
  new CacheFirst({
    cacheName: "fmg-fonts",
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 100, maxAgeSeconds: 60 * DAY})
    ]
  })
);

// Clean up old caches on activate
self.addEventListener("activate", (event) => {
  const currentCaches = new Set([
    "fmg-html", "fmg-scripts", "fmg-stylesheets", "fmg-libs",
    "fmg-json", "fmg-images", "fmg-charges", "fmg-fonts"
  ]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !currentCaches.has(name))
          .map((name) => caches.delete(name))
      )
    )
  );
});
