

importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

let CACHE_STATIC_NAME = 'static-v17';
let CACHE_DYNAMIC_NAME = 'dynamic-v2';
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
  '/src/images/main-image.jpg', //la coloco en precaching, no así las imagenes de los post que los quiero persistir en la db
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItems) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItems));
//           }
//         });
//     })
// }

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(PRECACHING);
      })
  )
});

//en el mismo ciclo de vida, en el período de activación, limpiamos la caché de versiones antiguas. La activación procede cuando mapeamos las key en la cache, y eliminamos aquellas que tengan nombre distinto al nombre de la versión actual
self.addEventListener('activate', event=> {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

//lo voy a usar para buscar si un request está ya cacheado (en el precaching por ejemplo)
function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { 
    cachePath = string.substring(self.origin.length); 
  } else {
    cachePath = string; 
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', event => {

  var url = 'https://test-ayi-default-rtdb.firebaseio.com/posts.json';
  //chequeo que el evento sea de pedido a la API de firebase, si lo es, entonces a la promesa de la respuesta clonada en formato JSON la resuelvo escribiendo cada post dentro de Data y retornando la rta.
  if (event.request.url.indexOf(url) > -1) { 
    event.respondWith(fetch(event.request)
      .then(res => {
        res.clone().json()
          .then(data => {
            for (var key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
      })
    );
    //si el pedido no es a la API de firebase, busco si lo tengo incluido en mis PRECACHING, y si están ahí, respondo con ese matcheo
  } else if (isInArray(event.request.url, PRECACHING)) {
    event.respondWith(
      caches.match(event.request)
    );
    /*si el pedido no está en la PRECACHING, entonces busco coincidencias con el resto de la caché, si encuentro coincidencia, devuelvo esa respuesta directamente. Sino, voy a buscar la respuesta a Network, y esa respuesta la muestro por un lado, pero almaceno la respuesta clonada en la cache dinámica (con su key URL y su value res). Cuando la almaceno en la dinámica, puedo chequear un límite máximo de cache, y ejecutar la función trimCache para mantener más estable la dinámica. Si el fetch al Network me genera un reject por estar offline, entonces le pego a la fallback page*/
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(res => {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(cache => {
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(error => {
                return caches.open(CACHE_STATIC_NAME)
                  .then(cache => {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    }
                  });
              });
          }
        })
    );
  }
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

// Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });
