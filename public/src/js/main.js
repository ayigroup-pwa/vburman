
var box = document.querySelector('.box');
var button = document.querySelector('button');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Registered Service Worker!');
    });
}

button.addEventListener('click', function(event) {
  if (box.classList.contains('visible')) {
    box.classList.remove('visible');
  } else {
    box.classList.add('visible');
  }
});


fetch('https://httpbin.org/ip')
  .then(function(res) {
    console.log('main')
    return res.json();
  })
  .then(function(data) {
    console.log(data.origin);
    box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
  });

  //FRAGMENTO DE CÓDIGO PARA LA TASK PARTE 2: estrategia 'CACHE, THEN NETWORK'. 
  
 /*
  let networkDataReceived = false; //indica si obtuvimos data de Network
  let url = 'https://httpbin.org/ip'
  
   //fetch a Network
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (resNet) {
      networkDataReceived = true;
      console.log(resCache.origin);
      box.style.height = (resCache.substr(0, 2) * 5) + 'px';
    });

  // obtengo la data desde Caché, de ser posible (chequeo el soporte primero)
  if('caches' in window)
  caches.match(url)
    .then(function (response) {
      if(response) {
        return response.json();
      }
      
    })
    .then(function (resCache) {
      // si no existe data previa desde el Network, entonces actualizo la página con la respuesta obtenida de cache
      if (!networkDataReceived) {
        console.log(resCache.origin);
        box.style.height = (resCache.substr(0, 2) * 5) + 'px';
      }
    })
  */