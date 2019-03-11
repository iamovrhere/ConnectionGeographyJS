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
// LinkedIn has a pretty locked down CSP; https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
// It may not be possible to do this automatically. One may need to restort to the ol' console copy-paste
// approach.
(function()
  /*
   * In order to use LinkedIn's internal API we need their Cross-Site Request Forgery token.
   * As such, we're going to sneak a peak into all the headers being sent. Once we get our token,
   * we'll reset the call and store token.
   */
  let storage = localStorage.getItem('connection-geography') ? JSON.parse(localStorage.getItem('connection-geography')) : {};
  localStorage.setItem('connection-geography', JSON.stringify(storage));
  console.log('connection-geography : ', localStorage.getItem('connection-geography') );

  /*
   * In order to use LinkedIn's internal API we need their Cross-Site Request Forgery token.
   * As such, we're going to grab the token from the document cookie and re-use some static headers.
   *
   * Current configuration is: "csrf-token", "ajax:12345678901234567890"
   *
   * See:
   *  - https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
   */
  (function() {
    const extractToken = document.cookie.match(/JSESSIONID=\"(ajax:[0-9]+?)\";/);
    const initStorage = {
      linkedInHeaders: {
        "accept": "application/vnd.linkedin.normalized+json+2.1",
        "csrf-token": extractToken[1],
        "x-li-lang": "en_US",
        "x-li-track": "{\"clientVersion\":\"1.2.7986\",\"osName\":\"web\",\"timezoneOffset\":-6,\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\"}",
        "x-restli-protocol-version": "2.0.0",
        "test": "foobar"
      }
    }
    let storage = localStorage.getItem('connection-geography') ? JSON.parse(localStorage.getItem('connection-geography')) : initStorage;
    localStorage.setItem('connection-geography', JSON.stringify(storage));
    console.log('connection-geography : ', localStorage.getItem('connection-geography') );

    // Need to decodeURIComponent from the observed endpoints.
    const testPoint = 'https://www.linkedin.com/voyager/api/search/history?count=10';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', testPoint, true);
    xhr.withCredentials = true;

    for (let header in storage.linkedInHeaders) {
      if (storage.linkedInHeaders.hasOwnProperty(header)) {
        xhr.setRequestHeader(header, storage.linkedInHeaders[header]);
      }
    }

    xhr.onload = () => {
      if (xhr.readyState === xhr.DONE && xhr.status === 200) {
        console.log(xhr.response, xhr.responseXML);
      } else {
        console.error('Failed the UserScript request test')
      }
    };
    xhr.send();

  }());

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

