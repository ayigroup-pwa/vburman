
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open('static-v3')
      .then(cache => {
        cache.add('/')
        cache.addAll([
          '/index.html',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          '/src/css/feed.css'
        ])
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
      if(Key != 'static' && Key != 'dinamic') {
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
              return caches.open('dinamic')
              .then(cache=>{
                cache.put(event.request.url, res.clone());
                return res;
              })
            })
        }
      })
  )
});
