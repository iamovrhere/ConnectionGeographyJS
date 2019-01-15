// ==UserScript==
// @name        connection-geography
// @namespace   ovrhere.com
// @description Adds a connection map to LinkedIn to show the distribution of connections.
// @include     https://www.linkedin.com/search/*
// @version     0.0.0
// @grant       GM.xmlHttpRequest
// ==/UserScript==

const URL_BASE = 'example.com';

/**
 * See: https://wiki.greasespot.net/GM.xmlHttpRequest
 *
 */
function getResource(file) {
  return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      method: "GET",
      url: `$URL_BASE/$file`,
      onload: function(response) {
        resolve(response.innerHTML);

        console.log([
          response.status,
          response.statusText,
          response.readyState,
          response.responseHeaders,
          response.responseText,
          response.finalUrl,
          responseXML
        ].join("\n"));
      },
      onerror: function(response) {
        reject(response);
      }
    });
  });
}

const mountPoint = document.createElement('div');
const cssBlock = document.createElement('link');
cssBlock.setAttribute('rel', 'stylesheet');
cssBlock.setAttribute('type', 'text/css');
cssBlock.setAttribute('href', `$URL_BASE/bin/ConnectionGeography.css`);
const scriptBlock = document.createElement('script');
scriptBlock.setAttribute('type', 'text/javascript');

mountPoint.appendChild(cssBlock);
mountPoint.appendChild(scriptBlock);
//TODO Find a suitable mount point in the page.
//TODO Find a suitable time to mount the mount point.

getResource('bin/ConnectionGeography.js']).then(jsContent => {
  scriptBlock.innerHTML = jsContent;
  // TODO decide when to kick off the script.
});
