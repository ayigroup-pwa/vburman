
//chequear si el browser soporta promesas o no:
if(!window.Promise){
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Service worker registered!');
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {

  e.preventDefault();

  deferredPrompt = e;
  deferredPrompt.prompt();
  if (deferredPrompt) {
      
      deferredPrompt.prompt();
 
      deferredPrompt.userChoice
          .then(choiceResult => {
              if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the A2HS prompt');
              } else {
                  console.log('User dismissed the A2HS prompt');
              }
              deferredPrompt = null;
      });
 }

});

// window.onload = (e) => { 
//   let deferredPrompt;
//   window.addEventListener('beforeinstallprompt', (e) => {
//     // Prevent Chrome 67 and earlier from automatically showing the prompt
    
//     console.log('beforeinstallprompt fired');
//     e.preventDefault();
//     // Stash the event so it can be triggered later.
//     deferredPrompt = e;
//   });
//   // Show the prompt
//   deferredPrompt.prompt();
// }


fetch('https://httpbin.org/ip')
  .then(response => {
      console.log('Response con FETCH...');
      console.log(response);
      return response.json();
  })
  .then(data => console.log(data))
  .catch(error => {
      console.log('Error on fetch call...', error);
  });

  fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Accept': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify({message: 'Este es el body'})
  })
    .then(data => console.log(data))
    .catch(error => console.log(error));

   
