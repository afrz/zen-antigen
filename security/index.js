import { perpetual, ephemeral } from './storage';

//define constants
const SECURITY_MANAGER = 'SM';
const PROP_INSTANCE = `${SECURITY_MANAGER}.instance`;
const PROP_LOGIN = `${SECURITY_MANAGER}.login`;
const PROP_JWT = `${SECURITY_MANAGER}.jwt`;
const PROP_SYNC = `${SECURITY_MANAGER}.sync`;

//defines synchronization options
export const SYNC_PERPETUAL = 'P';
export const SYNC_EPHEMERAL = 'E';

//retrieve synchronization mode
function getSyncMode() {
  //here, always use permanent storage
  return perpetual.getItem(PROP_SYNC) || SYNC_EPHEMERAL;
}

//set current storage
let storage = ephemeral;

//recompute storage
function recomputeStorage() {
  storage = getSyncMode() === SYNC_PERPETUAL ? perpetual : ephemeral;
}

/**
  Manage credentials persistance through window's storage
*/
const SecurityManager = {

  init() {

    this.sync = getSyncMode();
    recomputeStorage();
    //user credentials
    this.instance = storage.getItem(PROP_INSTANCE);
    this.login = storage.getItem(PROP_LOGIN);
    this.jwt = storage.getItem(PROP_JWT);
    //authentication mode
    this.authMode = null;
    return this;
  },

  //check if credentials have already been accredited once
  authorized() {
    return this.jwt !== null;
  },

  //extract payload information from token
  _extractPayload(token) {

    let payload = {};
    try {
      //extract
      const parts = token.split('.');
      payload = JSON.parse(atob(parts[1]));

    } catch (e) { return false }

    //and store
    this.instance = payload.instance || '';
    storage.setItem(PROP_INSTANCE, this.instance);

    this.login = payload.login || '';
    storage.setItem(PROP_LOGIN, this.login);

    this.authMode = payload.mode || '';

    //check expiration
    const expired = payload.exp * 1000 <= new Date().getTime();
    //valid if not expired
    return !expired;
  },

  //reload security manager from given token
  _reloadFromToken(token) {

    this.logout(true);
    //store token
    this.jwt = token;
    storage.setItem(PROP_JWT, this.jwt);

    return this._extractPayload(token);
  },

  /** Attempt to restore security manager
    @param {string} token - new token to import
    @returns {bool} - true if token is valid
  */
  restore(token) {

    //import from new fresh token or restore locally stored JWT if existing
    const restoreToken = token || this.jwt;
    if (restoreToken) {
      return this._reloadFromToken(restoreToken);
    }
    return false;
  },

  //change storage synchronization mode
  changeSync(syncMode = SYNC_EPHEMERAL) {

    if (syncMode !== this.sync) {
      perpetual.setItem(PROP_SYNC, syncMode);
      this.sync = syncMode;
      recomputeStorage();
    }
  },

  //clean stored credentials
  logout(cleanCreds) {

    //keep info for future access ?
    if (cleanCreds) {
      ephemeral.removeItem(PROP_INSTANCE);
      perpetual.removeItem(PROP_INSTANCE);
      this.instance = null;

      ephemeral.removeItem(PROP_LOGIN);
      perpetual.removeItem(PROP_LOGIN);
      this.login = null;
    }

    //but always remove token
    ephemeral.removeItem(PROP_JWT);
    perpetual.removeItem(PROP_JWT);
    this.jwt = null;
    this.authMode = null;
  }
};

export default SecurityManager.init();
