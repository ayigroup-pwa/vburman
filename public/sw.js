////////////////////////////////////////////////////////////////////
// TASK 1 (respuestas adicionales debajo de la línea de código)
/* La estrategia utilizada en el [SW] es de Caché con Network Fallback; esta estrategia busca una respuesta cacheada primero (offline-first), si se encuentra un match, retorna esa respuesta. De lo contrario, se hace el fetch al Network, se retorna esa respuesta y al mismo tiempo se almacena un clon de la respuesta en la caché dinámica. Se puede comprobar en DevTools, evaluando en la pestaña Network, que en el primer reload de la página, el fetch de la ip proviene del cloud (va a buscarla a la red porque no la encuentra en Caché y tenemos conectividad), pero la segunda vez que refrescamos la web app, esa misma respuesta viene del sw y ya se encuentra en la caché dinámica.   */


var CACHE_STATIC_NAME = 'static-v8';
var CACHE_DYNAMIC_NAME = 'dynamic-v5';

//Ciclo de vida del [sw] : instalación. Abre/genera la caché estática y realiza el precaché de la App Shell

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll([
          '/',
          '/index.html',
          '/src/css/app.css',
          '/src/css/main.css',
          '/src/js/main.js',
          '/src/js/material.min.js',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
          //'https://httpbin.org/ip' (agregado sólo para evaluar la estrategia caché only)
        ]);
      })
  )
});

//Ciclo de vida del [sw]: activación. Mapea la lista de keys en la caché (en este caso la estática) buscando versiones anteriores y las elimina

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});

/* El fetch es evaluado por el [SW], la respuesta será la response que venga del caché, si encuentra un match con el request que estamos peticionando, o será una respuesta del Network, en caso de que no lo encuentre, que será almacenada (un clon de la respuesta, porque solo puede ser utilizada una vez) en Caché dinámica para futuras request. */
/* 

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                });
            })
            .catch(function(err) {

            });
        }
      })
  );
});

*/

////////////////////////////////////////////////////////////////////////////
// TASK parte 2:
// Las respuestas corresponden al addEventListener de los fetchs, salvo que se aclare lo contrario, el resto queda de la misma forma. Para probar, comentar los addEventListener de los fetchs que no correspondan y mantener el resto del [SW]

//NETWORK ONLY:


/* el fetch que intercepta el [SW] va directo a ser peticionado a Network, sin pasar por el chequeo de la caché. 
Esta estrategia puede ser utilizada por ejemplo, para assets que están en cambio constante y que siempre se tienen que tener actualizados en cada reload. Si dejamos la caché estática con el precaching de la App Shell, en modo offline esta App solo va a cargar el esqueleto que le indiquemos en la instalación del [SW] pero no va a ser funcional, porque no va a poder conectarse nunca a Network, y no quedará nada almacenado en la caché dinámica cuando el usuario vaya interactuando con la App. */
/*
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(res){
        return res
      })
      .catch(function(error){
        console.log(error)
      })
  );
});
*/

//CACHÉ ONLY

/* Esta estrategia, busca solamente en Caché; si no lo encuentra no lo carga. Esto se utiliza para assets que no cambian nunca, o que no tenemos planificado cambiar con frecuencia, por ejemplo un logo. Se podría indicar incluso que cargue de una única caché, haciendo caches.open(nombreCache) y resolver esa promesa con cache.match(event.request). En este ejemplo, se utiliza caches.match() para buscar el request en todas las caches disponibles.
Para evaluar esta estrategia, en modo online si 'https://httpbin.org/ip' no estaba en la caché estática el fetch del Main.js, quedaba trunco. Agregué la URL a la caché estática como un precache para evaluar que efectivamente la promesa se resolvía matcheando en la caché; cuando utilicé la app en forma offline, el fetch seguía respondiendo desde la caché.
*/

/*
self.addEventListener('fetch', function (event) {
  event.respondWith(
        caches.match(event.request)
          .then(function(resCache){
            return resCache;
        })
      );
})
*/

//NETWORK, CACHE FALLBACK
/*
En esta estrategia, el [SW] intenta primero captar la respuesta desde el Network (resNet); si lo encuentra, retorna esa respuesta, y guarda un clon de la misma en la caché para actualizarla o tenerla disponible. En caso de ausencia de conectividad, maneja el error mediante el catch del fetch, retornando la respuesta que encuentre previamente cacheada. Si probamos la app en modo offline, en 'Network' de Devtools podremos ver que intenta realizar la petición a la red, pero al fallar la conectividad trae la respuesta almacenada en la caché dinámica.
*/
/*
self.addEventListener('fetch', function(event) {
     event.respondWith(
       fetch(event.request)
         .then(function(resNet) {
            return caches.open(CACHE_DYNAMIC_NAME)
                    .then(function(cache) {
                      cache.put(event.request.url, resNet.clone());
                      
                      return resNet;
                      })
         })
         .catch(function(errorConectividad) {
           return caches.match(event.request)
              .then(function(resCache){
                return resCache;
              })
         })
     );
   });
*/

   //CACHE, THEN NETWORK

   /*
    la App requiere dos peticiones, una a la caché y otra a Network, de esta forma utiliza la respuesta en caché primero y cuando llegue la respuesta de Network, actualizar la página y el caché con esta respuesta (resNet). 
    Esta estrategia se podría utilizar cuando mi objetivo es actualizar el contenido de la app a lo más reciente cuando el estatus de conectividad pasa de offline a online. 
   */


   //Código que está copiado y comentado en Main.js, para evaluar "cache, then network" desde DevTools, pero lo agrego aquí para una lectura más fácil: 
/*-------------------------------------script que va en Main.js-----------------------------------------------------
  
  function updatePage(data){
    console.log(data.origin);
    box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
  }
  let networkDataReceived = false; //indica si obtuvimos data de Network

   //declaro una variable para obtener data desde Network
  let networkUpdate = fetch('https://httpbin.org/ip')
    .then(function (response) {
      return response.json();
    })
    .then(function (resNet) {
      networkDataReceived = true;
      updatePage(resNet);
    });

  // obtengo la data desde Caché, de ser posible
  caches.match('https://httpbin.org/ip')
    .then(function (response) {
      return response.json();
    })
    .then(function (resCache) {
      // si no existe data previa desde el Network, entonces actualizo la página con la respuesta obtenida de cache
      if (!networkDataReceived) {
        updatePage(resCache);
      }
    })
    .catch(function () {
      // Si no encuentra nada en caché, devuelve la respuesta traída de Network
      return networkUpdate;
    })
------------------------------------------ fin de script que va en main.js -------------------------*/
    //código que SI va en el [SW]. Este fragmento de código me indica que siempre debe peticionar a Network y actualizar la caché. 
    /*
    self.addEventListener('fetch', function(event) {
      event.respondWith(
        caches.open(CACHE_DYNAMIC_NAME)
          .then(function(cache) {
            return fetch(event.request)
              .then(function(res){
                cache.put(event.request, res.clone());
                return res;
            });
          })
      );
    });
  */