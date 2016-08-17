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

//Create fake local storage supportin Web API storage main interface
function createDummyLocalStorage() {

  return {
    getItem: function() {},
    setItem: function() {},
    removeItem: function() {}
  }
}

/** Returns appropriate Web API storage interface for browser usage.
  @returns object : https://developer.mozilla.org/fr/docs/Web/API/Storage
*/
export function getStorage() {

  if (storageAvailable('localStorage')) {
    return window.localStorage;
  }
  return createDummyLocalStorage();
}
