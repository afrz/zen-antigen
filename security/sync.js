import { perpetual, ephemeral } from './storage';
import { isSyncPerpetual } from '.';

const SYNCING_STORAGE = "_syncingStorage_";
const TRANSFER_STORAGE = "_sessionStorage_";

/** Synchronize perpetual and ephemeral storage of current browsing tab
  @param {func} cb - callback to be executed when sync is done.
*/
export function syncStorage(cb) {

  let _syncTimer;

  //transfers sessionStorage from one tab to another
  function transferStorageEventHandler(e) {

    if (!e) { e = window.event; } // ie hack
    //do nothing if no value to work with
    if (!e.newValue) return;

    clearTimeout(_syncTimer);

    if (e.key === SYNCING_STORAGE) {

      //another tab asked for the sessionStorage -> send it
      perpetual.setItem(TRANSFER_STORAGE, JSON.stringify(ephemeral));
      //the other tab should now have it, so we're done with it.
      perpetual.removeItem(TRANSFER_STORAGE);

    } else if (e.key === TRANSFER_STORAGE && !ephemeral.length) {

      //another tab sent data <- get it
      const data = JSON.parse(e.newValue);
      for (let key in data) {
        ephemeral.setItem(key, data[key]);
      }
      cb(true);
    }
  }

  //listen for changes to perpetual storage
  if (window.addEventListener) {
    window.addEventListener("storage", transferStorageEventHandler, false);
  }

  //only when not perpetual sync and nothing yet in ephemeral storage
  if (!ephemeral.length && !isSyncPerpetual()) {

    //ask other tabs for session storage (ONLY to trigger event handler)
    perpetual.setItem(SYNCING_STORAGE, 'syncing');
    perpetual.removeItem(SYNCING_STORAGE);

    //timer to ensure that callback will be invoked at least once (case first connection to app with no previous storage information at all)
    _syncTimer = setTimeout(() => cb(false), 400);
  } else {
    //default case where no sync is required
    cb(false);
  }
}
