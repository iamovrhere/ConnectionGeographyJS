/*
 * Code used to sneak a peak into all the headers being sent. Once we get our headers,
 * for the given end point we can add them statically.
 *
 * Current configuration is: "csrf-token", "ajax:12345678901234567890"
 *
 * See:
 *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
 *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
 *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
 */
(function() {
  const wrapper = function() {
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
  };
}());
