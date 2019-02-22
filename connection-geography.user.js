// ==UserScript==
// @name        connection-geography
// @namespace   ovrhere.com
// @description Adds a connection map to LinkedIn to show the distribution of connections.
// @include     https://www.linkedin.com/search/*
// @version     0.0.0
// @grant       GM.xmlHttpRequest
// ==/UserScript==

console.log('Is this loading?');

// TODO: Still need to reconsile this with linkedin's Content-Security-Policy
(function()
  /*
   * In order to use LinkedIn's internal API we need their Cross-Site Request Forgery token. 
   * As such, we're going to sneak a peak into all the headers being sent. Once we get our token,
   * we'll reset the call and store token.
   */
	const setRequestHeaderOriginal = XMLHttpRequest.prototype.setRequestHeader;
  console.log('IIFE');
 
 	// Current configuration is: "csrf-token", "ajax:12345678901234567890"
 	XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
  	// Call original with original arguments.
  	setRequestHeaderOriginal.apply(this, arguments);
  
  	// We're only interested in the csrf for now.
  	if (/csrf/.test(header)) {
      console.log('Found our CSRF: %s', value); 
      // TODO store this to local storage & determine its life.
      
      // We have our token now reset.
      XMLHttpRequest.prototype.setRequestHeader = setRequestHeaderOriginal;
    }
	};
})();


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

