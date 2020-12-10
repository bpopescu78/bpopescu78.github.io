// configurable params
const useCache = true
const swCacheVersion = 53
const swCachePrefix = 'BP-demo-SW-'
const urlMatch = '/sw-test/'

// calculated params
const swCacheName = `${swCachePrefix}${swCacheVersion}`
''
// ------------------------------------------------- //
console.log('SW startup');

/*
 * LIFECYCLE HOOKS
 * ---------------
 */

// INSTALL Event Handler
self.addEventListener('install', event => {
  console.log('SW installed');

  // DEMO on how to cache an array of files
  const files = [
    '/sw-test/README.md',
    '/sw-test/LICENSE',
    '/sw-test/CODE_OF_CONDUCT.md'
  ]
  event.waitUntil(
    caches.open(swCacheName)
      .then(cache => Promise.all(
        files.map(file => fetch(file)
          .then(response => cache.put(file, response))
        )
      ))
  )
})

// ACTIVATE Event Handler
self.addEventListener('activate', event => {
  console.log('SW activating...')
  // clear the previous caches
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName.indexOf(swCachePrefix) === 0) {
              return cacheName === swCacheName
                ? null
                : caches.delete(cacheName)
            }
          })
        )
      })
      .then(_ => {
        console.log('SW Activated!')
      })
  )

});

// FETCH Event Handler
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.open(swCacheName).then(cache => cache.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (useCache && response !== undefined) {
      // console.log('matched', response)
      return response
    } else {
      // console.log('not matched')
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one

        if (response && response.status === 200 && response.type === 'basic' && response.url.match(urlMatch)) {
          // console.log(response)
          let responseClone = response.clone()

          caches.open(swCacheName).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response
      }).catch(function () {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      });
    }
  })))
})

// MESSAGE Event Handler
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
