
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Service worker registered!');
      console.log(navigator)
      console.log(navigator.serviceWorker)
    });
}
