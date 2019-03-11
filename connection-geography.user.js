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
   * As such, we're going to sneak a peak into all the headers being sent. Once we get our headers,
   * for the given end point,
   *
   * Current configuration is: "csrf-token", "ajax:12345678901234567890"
   *
   * See:
   *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
   *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
   *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
   */
  (function() {

    const LOCAL_STORAGE = 'connection-geography';
    const setRequestHeaderOriginal = window.XMLHttpRequest.prototype.setRequestHeader;
    const openOriginal = window.XMLHttpRequest.prototype.open;
    const sendOriginal = window.XMLHttpRequest.prototype.send;

    function testAndSaveHeaders(o) {
      if (!o.url || !o.headers) {
        log.warning('Called saved prematurely.');
        return;
      }
      if (
        /\/voyager\/api\//.test(o.url) &&
        /application\/vnd\.linkedin\.normalized\+json/.test(o.headers.accept)
      ) {
        console.log('testAndSaveHeaders - resetting');
        /* We have our token now reset. */
        window.XMLHttpRequest.prototype.setRequestHeader = setRequestHeaderOriginal;
        window.XMLHttpRequest.prototype.open = openOriginal;
        window.XMLHttpRequest.prototype.send = sendOriginal;

        let storage = JSON.parse(localStorage.getItem(LOCAL_STORAGE));
        storage.linkedInHeaders = o.headers;
        localStorage.setItem(LOCAL_STORAGE, JSON.stringify(storage));
      }
    }

    window.XMLHttpRequest.prototype.send = function() {
      /* Call original with original arguments. */
      sendOriginal.apply(this, arguments);

      /* Now we have collected all the header and url info we can test and save. */
      testAndSaveHeaders(this.tokenExtraction);
      delete this.tokenExtraction;
    };

    window.XMLHttpRequest.prototype.open = function(method, url) {
      openOriginal.apply(this, arguments);

      this.tokenExtraction = this.tokenExtraction || {};
      let extract = this.tokenExtraction;
      extract.url = url;

      console.log('open ' + url);
      console.log(extract);
    };

    window.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
      setRequestHeaderOriginal.apply(this, arguments);

      this.tokenExtraction = this.tokenExtraction || {};
      let extract = this.tokenExtraction;
      extract.headers = extract.headers || {};
      extract.headers[header] = value;

      console.log(`setRequestHeader ${header} ${value}`);
      console.log(extract);
    };
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

