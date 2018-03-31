const CACHE_VERSION = 'sample-pwa-v1';
const OFFLINE_IMAGE = './images/offline.png'; // add fall back for images
const OFFLINE_PAGE = './offline.html'; // offline page

// Install app resources
self.addEventListener('install', event => {
  console.log('>>>> Event: Install');
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
  console.log('>>>> Event: Fetch');

  // cache new response
  const fetchAndCache = request =>
    caches.open(CACHE_VERSION).then(cache =>
      // Load the response from the network.
      fetch(request).then(response => {
        const responseToCache = response.clone();
        // Add the response to the cache.
        cache.put(request, responseToCache).catch((err) => {
          console.warn(`${request.url}: ${err.message}`);
        });
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

// The below is trial from https://github.com/gokulkrishh/demo-progressive-web-app/blob/master/serviceWorker.js
/*
  ACTIVATE EVENT: triggered once after registering, also used to clean up caches.
*/

//Adding `activate` event listener
self.addEventListener('activate', (event) => {
  console.info('Event: Activate');

  //Navigation preload is help us make parallel request while service worker is booting up.
  //Enable - chrome://flags/#enable-service-worker-navigation-preload
  //Support - Chrome 57 beta (behing the flag)
  //More info - https://developers.google.com/web/updates/2017/02/navigation-preload#the-problem

  // Check if navigationPreload is supported or not
  // if (self.registration.navigationPreload) { 
  //   self.registration.navigationPreload.enable();
  // }
  // else if (!self.registration.navigationPreload) { 
  //   console.info('Your browser does not support navigation preload.');
  // }

  //Remove old and unwanted caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_VERSION) {
            return caches.delete(cache); //Deleting the old cache (cache v1)
          }
        })
      );
    })
    .then(function () {
      console.info("Old caches are cleared!");
      // To tell the service worker to activate current one 
      // instead of waiting for the old one to finish.
      return self.clients.claim(); 
    }) 
  );
});

/*
  PUSH EVENT: triggered everytime, when a push notification is received.
*/

//Adding `push` event listener
self.addEventListener('push', (event) => {
  console.info('Event: Push');

  var title = 'Push notification demo';
  var body = {
    'body': 'click to return to application',
    'tag': 'demo',
    'icon': './images/icons/apple-touch-icon.png',
    'badge': './images/icons/apple-touch-icon.png',
    //Custom actions buttons
    'actions': [
      { 'action': 'yes', 'title': 'I ♥ this app!'},
      { 'action': 'no', 'title': 'I don\'t like this app'}
    ]
  };

  event.waitUntil(self.registration.showNotification(title, body));
});

/*
  BACKGROUND SYNC EVENT: triggers after `bg sync` registration and page has network connection.
  It will try and fetch github username, if its fulfills then sync is complete. If it fails,
  another sync is scheduled to retry (will will also waits for network connection)
*/

self.addEventListener('sync', (event) => {
  console.info('Event: Sync');

  //Check registered sync name or emulated sync from devTools
  if (event.tag === 'github' || event.tag === 'test-tag-from-devtools') {
    event.waitUntil(
      //To check all opened tabs and send postMessage to those tabs
      self.clients.matchAll().then((all) => {
        return all.map((client) => {
          return client.postMessage('online'); //To make fetch request, check app.js - line no: 122
        })
      })
      .catch((error) => {
        console.error(error);
      })
    );
  }
});

/*
  NOTIFICATION EVENT: triggered when user click the notification.
*/

//Adding `notification` click event listener
self.addEventListener('notificationclick', (event) => {
  var url = 'https://demopwa.in/';

  //Listen to custom action buttons in push notification
  if (event.action === 'yes') {
    console.log('I ♥ this app!');
  }
  else if (event.action === 'no') {
    console.warn('I don\'t like this app');
  }

  event.notification.close(); //Close the notification

  //To open the app after clicking notification
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then((clients) => {
      for (var i = 0; i < clients.length; i++) {
        var client = clients[i];
        //If site is opened, focus to the site
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      //If site is cannot be opened, open in new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
    .catch((error) => {
      console.error(error);
    })
  );
});