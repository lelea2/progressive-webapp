const CACHE_VERSION = 'sample-pwa-v1';
const OFFLINE_IMAGE = './images/offline.png'; // add fall back for images
const OFFLINE_PAGE = './offline.html'; // offline page

// Install app resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      // Download all required resources to render the app.
      return cache.addAll([
        './index.html',
        './scripts.js',
        './styles.css',
        OFFLINE_IMAGE, // add fallback for images
        OFFLINE_PAGE,
      ]);
    })
  );
});

// use cache by default or fall back to the network
// cache new response
self.addEventListener('fetch', event => {

  // cache new response
  const fetchAndCache = request =>
    caches.open(CACHE_VERSION).then(cache =>
      // Load the response from the network.
      fetch(request).then(response => {
        // Add the response to the cache.
        cache.put(request, response.clone());
        return response;
      })
    );

  event.respondWith(
    caches
      // Check for cached data.
      .match(event.request)
      // Return the cached data OR hit the network.
      // .then(data => data || fetch(event.request))
      .then(data => data || fetchAndCache(event.request))
      .catch(() => { // fallback for images
        const url = new URL(event.request.url);
        // Show the fallback image for failed GIF requests.
        if (url.pathname.match(/\.gif$/)) {
          return caches.match(OFFLINE_IMAGE);
        }
        // show offline page for other failed requests
        return caches.match(OFFLINE_PAGE);
      })
  );
});