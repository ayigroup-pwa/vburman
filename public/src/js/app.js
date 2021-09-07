
let deferredPrompt;

//chequeo que el navegador soporte promesas (y agregamos los pollyfills para bypasear en aquellos navegadores que no tienen soporte de promesas)
if (!window.Promise) {
  window.Promise = Promise;
}

//chequeo si el navegador soporta ServiceWorker y si lo soporta, lo registro.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('Service worker registered!');
    })
    .catch(err=> {
      console.log(err);
    });
}


//install Prompt 
window.addEventListener('beforeinstallprompt', (e) => {

  e.preventDefault();
  deferredPrompt = e;
  deferredPrompt.prompt();
  deferredPrompt.userChoice
    .then((choiceResult)=> {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      }
    deferredPrompt = null;
    });
});
