const CACHE_VERSION = 'svns-stats-v1.0.09b-20260726';
const APP_CACHE = `${CACHE_VERSION}-app`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SCOPE_URL = new URL(self.registration.scope);
const BASE_URL = SCOPE_URL.href;

const scopeAsset = (path = '') =>
  new URL(path.replace(/^\/+/, ''), SCOPE_URL).href;

const CORE_ASSETS = [
  BASE_URL,
  scopeAsset('index.html'),
  scopeAsset('manifest.webmanifest'),
  scopeAsset('offline.html'),
  scopeAsset('icons/icon-192.png'),
  scopeAsset('icons/icon-512.png'),
  scopeAsset('icons/apple-touch-icon.png'),
  scopeAsset('icons/icon-maskable-192.png'),
  scopeAsset('icons/icon-maskable-512.png'),
];

function isSameScope(url) {
  return (
    url.origin === SCOPE_URL.origin &&
    url.pathname.startsWith(SCOPE_URL.pathname)
  );
}

async function putIfSuccessful(cache, request, response) {
  if (response?.ok || response?.type === 'opaque') {
    await cache.put(request, response.clone());
  }

  return response;
}

function extractDocumentAssets(html, documentUrl) {
  const urls = new Set();
  const attributePattern = /(?:src|href)=["']([^"'#]+)["']/gi;
  let match;

  while ((match = attributePattern.exec(html))) {
    try {
      const resolved = new URL(match[1], documentUrl);

      if (isSameScope(resolved)) {
        urls.add(resolved.href);
      }
    } catch {
      // Ignore malformed optional asset references.
    }
  }

  return [...urls];
}

function extractCssAssets(css, stylesheetUrl) {
  const urls = new Set();
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let match;

  while ((match = urlPattern.exec(css))) {
    const value = match[1];

    if (!value || value.startsWith('data:')) {
      continue;
    }

    try {
      const resolved = new URL(value, stylesheetUrl);

      if (isSameScope(resolved)) {
        urls.add(resolved.href);
      }
    } catch {
      // Ignore malformed optional asset references.
    }
  }

  return [...urls];
}

async function cacheAsset(cache, assetUrl) {
  try {
    const response = await fetch(
      new Request(assetUrl, { cache: 'reload' })
    );

    if (!response.ok) {
      return;
    }

    await cache.put(assetUrl, response.clone());

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/css')) {
      const css = await response.clone().text();
      const nestedAssets = extractCssAssets(css, assetUrl);

      await Promise.allSettled(
        nestedAssets.map((url) => cacheAsset(cache, url))
      );
    }
  } catch {
    // Optional assets should not make installation fail.
  }
}

async function cacheCurrentAppShell() {
  const cache = await caches.open(APP_CACHE);

  await Promise.allSettled(
    CORE_ASSETS.map((assetUrl) => cacheAsset(cache, assetUrl))
  );

  try {
    const response = await fetch(
      new Request(BASE_URL, { cache: 'reload' })
    );

    if (!response.ok) {
      return;
    }

    const html = await response.clone().text();
    await cache.put(BASE_URL, response.clone());
    await cache.put(scopeAsset('index.html'), response.clone());

    const assets = extractDocumentAssets(html, BASE_URL);

    await Promise.allSettled(
      assets.map((assetUrl) => cacheAsset(cache, assetUrl))
    );
  } catch {
    // The existing cache remains usable when the network is unavailable.
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    await putIfSuccessful(cache, request, response);
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await caches.match(request))
    );
  }
}

async function navigationResponse(request) {
  const appCache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await appCache.put(BASE_URL, response.clone());
    }

    return response;
  } catch {
    return (
      (await appCache.match(request)) ||
      (await appCache.match(BASE_URL)) ||
      (await appCache.match(scopeAsset('index.html'))) ||
      (await appCache.match(scopeAsset('offline.html'))) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    await putIfSuccessful(cache, request, response);
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheCurrentAppShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith('svns-stats-') &&
              cacheName !== APP_CACHE &&
              cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );

      await cacheCurrentAppShell();
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (!isSameScope(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (
    url.pathname.endsWith('/manifest.webmanifest') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    ['script', 'style', 'image', 'font', 'worker'].includes(
      request.destination
    )
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
