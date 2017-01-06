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
