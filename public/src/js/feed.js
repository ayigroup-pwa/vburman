let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
//agregado por sync
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');


//armar la funcionalidad de posteos
function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
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


// function onSaveButtonClicked(event) {
//    console.log('clicked');
//    if ('caches' in window) {
//      caches.open('user-requested')
//        .then(cache=> {
//         cache.add('https://httpbin.org/get');
//          cache.add('/src/images/sf-boat.jpg');
//        });
//    }
//  }

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}


//itero en Data para crear todas las cards
function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

let url = 'https://test-ayi-default-rtdb.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(url)
  .then(res => {
    return res.json();
  })
    .then(data => {
    networkDataReceived = true;
    console.log('From web', data);
    //genero el array con los post que traigo de Firebase para iterar y generar las cards con el método createCard()
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

//si indexedDB es soportado, puedo traer la data de idb y armar las cards con esos datos 
if ('indexedDB' in window) {
  readAllData('posts')
    .then(data=> {
      if (!networkDataReceived) {
        console.log('From indexedDB', data);
        updateUI(data);
      }
    });
}

function sendData() {
  fetch('ttps://test-ayi-default-rtdb.firebaseio.com/posts.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/test-ayi.appspot.com/o/Roma.jpg?alt=media&token=c62148c9-b098-471a-92d5-1af94191b18e'
    })
  })
    .then(res => {
      console.log('Sent data', res);
      updateUI();
    })
}

form.addEventListener('submit', event =>{

  event.preventDefault();
//para validar que hayan ingresado datos al formulario de posteos
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(sw => {
        let post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value
        };
        writeData('sync-posts', post)
          .then(() => sw.sync.register('sync-new-posts'))
          .then(() => {
            let snackbarContainer = document.querySelector('#confirmation-toast');
            let data = {message: 'Your Post was saved for syncing!'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(err=> {
            console.log(err);
          });
      });
  } else {
    sendData();
  }
});