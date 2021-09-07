var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt !== 'undefined' && deferredPrompt !== null) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

let networkDataProvide = false;
let URL  = 'https://httpbin.org/get'


//método para limpiar la tarjeta

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}
fetch(URL)
  .then(res=> {
    return res.json()
  })
  .then(data=> {
    networkDataProvide = true;
    console.log('From Cloud :', data);
    clearCards();
    createCard();

  })

if('caches' in window){
  caches.match(url)
    .then(response => {
      if(response){
        return response.json();
      }
    })
    .then(data=> {
      console.log('From cache: ', data)

      if(!networkDataProvide){
        clearCards();
        createCard();
      }
      
    })
}