
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
    */