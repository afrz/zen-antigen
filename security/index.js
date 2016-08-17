import { getStorage } from './storage';

//detect storage to be used safely
const storage = getStorage();

/**
  Manage credentials access using local storage
*/
const SecurityManager = {

  //restore user credentials
  instance: storage.getItem('SM.instance'),
  login: storage.getItem('SM.login'),
  jwt: storage.getItem('SM.jwt'),
  //authentication mode
  authMode: null,

  //check if credentials have already been accredited once
  authorized: function() {
    return (this.jwt !== null);
  },

  //extract payload information from token
  extractPayload: function(jwt) {

    let payload = {};
    try {
      //extract
      const parts = jwt.split('.');
      payload = JSON.parse(atob(parts[1]));

    } catch (e) { /*ignore*/ }

    //and store
    this.instance = payload.instance || '';
    storage.setItem('SM.instance', this.instance);

    this.login = payload.login || '';
    storage.setItem('SM.login', this.login);

    this.authMode = payload.mode || '';
  },

  //compute redentials from token
  storeCredentials: function(jwt) {

    this.logout(true);
    //store token
    this.jwt = jwt;
    storage.setItem('SM.jwt', this.jwt);

    this.extractPayload(jwt);
  },

  //reload security manager from locally stored JWT
  restore: function() {

    if (this.jwt) {
      this.storeCredentials(this.jwt);
    }
  },

  //clean stored credentials
  logout: function(cleanCreds) {

    //keep info for future access
    if (cleanCreds) {
      storage.removeItem('SM.instance');
      this.instance = null;

      storage.removeItem('SM.login');
      this.login = null;
    }

    //but always remove token
    storage.removeItem('SM.jwt');
    this.jwt = null;
    this.authMode = null;
  }
};

export default SecurityManager;
