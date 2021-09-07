let CACHE_STATIC_NAME = 'static-v4'
let CACHE_DINAMIC_NAME = 'dinamic-v4'
let PRECACHING = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        // cache.add('/')
        console.log('[SW] precaching App Shell')
        cache.addAll(PRECACHING)
      }

      )
  )
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker ...', event);

  event.waitUntil(
    caches.keys()
      .then(ListKey => {
        return Promise.all(ListKey.map(Key => {
          if(Key !== CACHE_STATIC_NAME && Key !== CACHE_DINAMIC_NAME) {
        console.log('[SW] removing old cache', Key)
        return caches.delete(Key)
        }
      })
      )
    }
    )
  )
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        } else {
          return fetch(event.request)
            .then(res=> {
              return caches.open(CACHE_DINAMIC_NAME)
              .then(cache=>{
                cache.put(event.request.url, res.clone()); //guarda cada fetch a pedido en la cache dinámica
                return res;
              })
            })
        }
      })
  )
});
