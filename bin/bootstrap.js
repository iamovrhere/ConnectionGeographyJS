// TODO Remove old nonce & root.
const AUTH_NONCE = ''; // TODO remove
let RES_ROOT = 'bin'; // TODO remove
function initConnectGeoMap() {
  const STORAGE_NAME = 'connection-geography'
  const storage = localStorage.getItem(STORAGE_NAME) ? JSON.parse(localStorage.getItem(STORAGE_NAME)) : {};
  const URL_BASE = storage.URL_BASE;
  RES_ROOT = `${URL_BASE}/bin`; // TODO remove

  const body = document.getElementById('connection-geography');
  let script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', `${URL_BASE}/bin/ConnectionGeography.js`);
  body.appendChild(script);
}
