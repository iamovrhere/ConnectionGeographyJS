// ==UserScript==
// @name        connection-geography
// @namespace   ovrhere.com
// @description Adds a connection map to LinkedIn to show the distribution of connections.
// @version     0.0.0
// @domain       linkedin.com
// @domain       www.linkedin.com
// @include      https://www.linkedin.com/*
// @inject-into  content
// @grant         GM_xmlhttpRequest
// @run-at document-idle
// ==/UserScript==

(function() {
  'use strict';
  console.log('connection-geo ' + window.location.href);

  const DEBUG = true;
  const MOUNT_ID = 'extended-nav';
  const STORAGE_NAME = 'connection-geography';
  // Content Security Policy must allow this URL in order to bootstrap.
  const URL_BASE = 'http://example.com';

  // Always redfine the URL_BASE for the application.
  let storage = localStorage.getItem(STORAGE_NAME) ? JSON.parse(localStorage.getItem(STORAGE_NAME)) : {};
  storage.URL_BASE = URL_BASE;
  localStorage.setItem(STORAGE_NAME, JSON.stringify(storage));
  
  /**
   * Simple debug method
   */
  function debug() {
    if (DEBUG) {
      console.log.apply(this, arguments);
    }
  }

  /**
   * Used to fetch resources asynchronously using privileged `GM_xmlhttpRequest`.
   * See: 
   * - https://violentmonkey.github.io/api/gm/
   * - https://wiki.greasespot.net/GM.xmlHttpRequest
   *
   * @param {string} file The file relative to URL_BASE
   * @return {Promise} A promise for the requested resource
   */
  function getResource(file) {
    const resource = `${URL_BASE}/${file}`;
    debug(`fetching: ${resource}`);
    
    return new Promise((resolve, reject) => {
      debug(`promise '${file}' -->  ${window.location.href}`);

      GM_xmlhttpRequest({
        method: "GET",
        url: resource,
        onload: function(response) {
          debug(`onload '${file}' -->  ${window.location.href}`);
          resolve(response.responseText);
        },
        onerror: function(response) {
          debug('onerror')
          reject(response);
        }
      });
    });
  }

  const mountPoint = document.createElement('div');
  mountPoint.setAttribute('id', 'connection-geography');

  const cssBlock = document.createElement('style');
  cssBlock.setAttribute('type', 'text/css');

  const scriptBlock = document.createElement('script');
  scriptBlock.setAttribute('type', 'text/javascript');
  
  document.getElementById(MOUNT_ID).appendChild(mountPoint);

  // Load resources.
  const resources = [
    getResource('bin/index.tpl').then(html => mountPoint.innerHTML += html),
    getResource('bin/ConnectionGeography.css').then(cssContent => {
      cssBlock.innerHTML += cssContent;
      mountPoint.appendChild(cssBlock);
    }),
  ];
  Promise.all(resources).then(() => {
    // Requires that the CSP allows URL_BASE
    scriptBlock.setAttribute('src', `${URL_BASE}/bin/bootstrap.js`);
    mountPoint.appendChild(scriptBlock);
    debug('Loaded bootstrap');

    // Requires that the CSP allows maps.googleapis.com, etc.
    let storage = localStorage.getItem(STORAGE_NAME) ? JSON.parse(localStorage.getItem(STORAGE_NAME)) : {};
    const KEY = 'googleMapsApiKey';
    const SECRET_KEY = storage[KEY];

    if (SECRET_KEY) {
      const googleSource = `https://maps.googleapis.com/maps/api/js?key=${SECRET_KEY}&callback=initConnectGeoMap&v=3.33`;
      const scriptBlock2 = document.createElement('script');
      scriptBlock2.setAttribute('type', 'text/javascript');

      scriptBlock2.setAttribute('src', googleSource);
      mountPoint.appendChild(scriptBlock2);
      // clear inline style.
      document.getElementById('app-container').setAttribute('style', '');
    } else {
      const setUp = document.getElementById('google-map-set-up');
      setUp.setAttribute('style', '');
      setUp.getElementById('maps-api-submit').addEventListener('click', () => {
        storage[KEY] = setUp.getElementById('maps-api-key').value;
        localStorage.setItem(STORAGE_NAME, JSON.stringify(storage));
        // Force refresh.
        window.location.href = window.location.href;
      });
    }
    debug('Loaded Maps');

  });
})();

