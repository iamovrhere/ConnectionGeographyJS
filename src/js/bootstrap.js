// TODO Remove old nonce & root.
const AUTH_NONCE = ''; // TODO remove
const RES_ROOT = 'bin/'; // TODO remove
function initConnectGeoMap() {
  const STORAGE_NAME = 'connection-geography'
  const storage = localStorage.getItem(STORAGE_NAME) ? JSON.parse(localStorage.getItem(STORAGE_NAME)) : {};
  const URL_BASE = storage.URL_BASE;

  let script = document.getElementById('application-js-start');
  script.onload = function() {
    const userInfo = { // TODO remove
      firstName: 'John',
      lastName: 'Doe',
      location: {
        name: 'Calgary, AB',
        country: {code: 'CA', name: 'Canada'}
      }
    };
    myConnectionsMap.linkedin.setAndShowUser(userInfo);
  };
  script.setAttribute('src', `${URL_BASE}/bin/ConnectionGeography.js`);
}
