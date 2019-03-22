// ==UserScript==
// @name        connection-geography
// @namespace   ovrhere.com
// @description Adds a connection map to LinkedIn to show the distribution of connections.
// @version     0.0.0
// @domain       linkedin.com
// @domain       www.linkedin.com
// @include      https://www.linkedin.com/search/*
// @include      https://www.google.com/*
// @include      http://www.linkedin.com/*
// @include      https://www.linkedin.com/*
// @inject-into page
// @grant         GM_xmlhttpRequest
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
        "test": "foobar",
        "Content-Type": "application/json"
      }
    }
    let storage = localStorage.getItem('connection-geography') ? JSON.parse(localStorage.getItem('connection-geography')) : initStorage;
    localStorage.setItem('connection-geography', JSON.stringify(storage));
    console.log('connection-geography : ', localStorage.getItem('connection-geography') );

    // Need to consider encode/decodeURIComponent from the observed endpoints.
    const testPoint = 'https://www.linkedin.com/voyager/api/search/blended?origin=FACETED_SEARCH&count=30&queryContext=List(spellCorrectionEnabled-%3Etrue,relatedSearchesEnabled-%3Etrue,kcardTypes-%3EPROFILE%7CCOMPANY)&q=all&filters=List(network-%3EF%7CS,resultType-%3EPEOPLE)&start=0';
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
        console.log('xhr: ' + xhr.response);
      } else {
        console.error('Failed the UserScript request test')
      }
    };
    xhr.send();

    fetch(testPoint, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: initStorage.linkedInHeaders,
        redirect: "follow" // manual, *follow, error
    })
    .then(response => response.text()) // parses response to JSON
    .then(json => console.log('fetch :' + json))
    .catch(error => console.log(error));

  }());

})();

// Separate idea below

const mountPoint = document.createElement('div');
mountPoint.setAttribute('id', 'connection-geography');

const cssBlock = document.createElement('style');
cssBlock.setAttribute('type', 'text/css');

const scriptBlock = document.createElement('script');
scriptBlock.setAttribute('type', 'text/javascript');

mountPoint.appendChild(cssBlock);
mountPoint.appendChild(scriptBlock);
document.getElementsByTagName('body')[0].appendChild(mountPoint);
//TODO Find a suitable mount point in the page.
//TODO Find a suitable time to mount the mount point.


const URL_BASE = 'example.com';

/**
 * See:
 * - https://violentmonkey.github.io/api/gm/
 * - https://wiki.greasespot.net/GM.xmlHttpRequest
 *
 * @param {string} file The file relative to URL_BASE
 */
function getResource(file) {
  const resource = `${URL_BASE}/${file}`;
  console.log('fetching: ' + resource)
  return new Promise((resolve, reject) => {
  console.log('starting promise');

  GM_xmlhttpRequest({
    method: "GET",
    url: resource,
    onload: function(response) {
      console.log('onload: ' + resource)
      resolve(response.responseText);
    },
    onerror: function(response) {
      console.log('onerror')
      reject(response);
    }
  });
  console.log('end promise');
});

}

const resources = [
  getResource('bin/ConnectionGeography.js')
    .then(jsContent => {
      //scriptBlock.innerHTML = 'console.log("inline experiment 3")'; // This does not work.
      eval('console.log("inline experiment 4")'); // This does work.
      // This half works; the code won't run because our one-line comments break things. Need to remove one-line comments.
      scriptBlock.innerHTML = jsContent;
      // We get one load for inner html of a script node but ONLY if we are adding a script node.
      // If we are adding a script node as text via html it won't run.
      const scriptBlock2 = document.createElement('script');
scriptBlock2.setAttribute('type', 'text/javascript');
      scriptBlock2.innerHTML = 'console.log("inline experiment 3")';
      mountPoint.appendChild(scriptBlock2);

    }),
  getResource('bin/ConnectionGeography.css')
    .then(cssContent => {
      cssBlock.innerHTML = cssContent;
    })
];
Promise.all(resources).then(() => {
  getResource('bin/index.tpl').then(html => mountPoint.innerHTML += html);
});

