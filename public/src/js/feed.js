let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');


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

// // Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
   console.log('clicked');
   if ('caches' in window) {
     caches.open('user-requested')
       .then(cache=> {
        cache.add('https://httpbin.org/get');
         cache.add('/src/images/sf-boat.jpg');
       });
   }
 }

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

// if ('caches' in window) {
//   caches.match(url)
//     .then(function(response) {
//       if (response) {
//         return response.json();
//       }
//     })
//     .then(function(data) {
//       console.log('From cache', data);
//       if (!networkDataReceived) {
//         var dataArray = [];
//         for (var key in data) {
//           console.log("saved key: " + key);
//           dataArray.push(data[key]);
//         }
//         updateUI(dataArray)
//       }
//     });
// }
