/**
  Check if Web API storage of given type is available in browser.
  @param type (string) : Expected 'localStorage' or 'sessionStorage'
  @returns bool : true if read/write support is active.
*/
function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

//Create fake 'in memory' local storage supportin Web API storage main interface
function memoryStorage() {

  return {
    getItem: function() {},
    setItem: function() {},
    removeItem: function() {},
    length: 0
  }
}

/** Retrieve Web API storage interface for browser usage.
  @param {string} type - expected storage type
  @returns {WebAPI} storage - https://developer.mozilla.org/fr/docs/Web/API/Storage
*/
export function getStorage(type = 'sessionStorage') {

  if (storageAvailable(type)) {
    return window[type];
  }
  return memoryStorage();
}

//initialize both storage pointers
export const perpetual = getStorage('localStorage');
export const ephemeral = getStorage('sessionStorage');

// 
// transfers sessionStorage from one tab to another
// const transferStorageEventHandler = function(event) {
//
//   if (!event) { event = window.event; } // ie hack
//   if (!event.newValue) return; // do nothing if no value to work with
//   if (event.key == '_syncingStorage_') {
//
//     // another tab asked for the sessionStorage -> send it
//     localStorage.setItem('_sessionStorage_', JSON.stringify(sessionStorage));
//     // the other tab should now have it, so we're done with it.
//     localStorage.removeItem('_sessionStorage_'); //could do short timeout as well.
//
//   } else if (event.key == '_sessionStorage_' && !sessionStorage.length) {
//
//     // another tab sent data <- get it
//     var data = JSON.parse(event.newValue);
//     for (var key in data) {
//       sessionStorage.setItem(key, data[key]);
//     }
//     //window.location.reload();
//   }
// };
//
// //listen for changes to localStorage
// if (window.addEventListener) {
//   window.addEventListener("storage", transferStorageEventHandler, false);
// }
//
// //ask other tabs for session storage (this is ONLY to trigger event)
// if (!sessionStorage.length) {
//   localStorage.setItem('_syncingStorage_', 'syncing');
//   localStorage.removeItem('_syncingStorage_');
// }
