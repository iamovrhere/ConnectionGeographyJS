<!-- 
    Title: "Connection Geography"
    By: Jason J.
    Description: This serves as the entry point into the application.
-->
<script id="application-js-start" type="text/javascript" ></script>
<div id="google-maps-set-up" style="display: none">
  <input type="password" id="maps-api-key" />
  <input type="submit" id="maps-api-submit" value="Save">
</div>
<!-- TODO Move banner -->
<div id="app-notice-banner" ></div>
<!-- TODO Rework container from 2014 design -->
<div id="app-container" style="display: none">
  <div id="map-canvas" ></div>
  <div id ="app-controls" style="display: none;">
      <div id="app-controls-background" ></div>
      <div id="linkedin-display"  style="display: none;"></div>            
      <div id="right-panel">
        <div id="disconnect-wrapper">
            <a href="javascript:void(0)" id="disconnect-app-action" 
               title="Disconnect from App">Disconnect [x]</a>
        </div>
        <div id="input-controls">
            <form >
              <span id="skip-home-checkbox-wrapper">
                  <input id="skip-home-checkbox" name="skip-home-checkbox" 
                         type="checkbox"  />
                  <label for="skip-home-checkbox">Skip Home</label>
              </span>
              <select id="colour-by-connections" >
                  <option value="colour-style-none" 
                        title="Shows all connections as blue"
                        >All blue</option>
                  <option value="colour-style-stoplight" selected="selected"
                        title="Shows denser connections as red, sparser connections as green"
                        >*Density (Stop-Light)</option>
              </select>
          <input type="button" id="perform-action" value="Run" />
          </form>
        </div>
      </div>
      <div id="app-status" ></div>
    </div>
  <img id="app-progress-spinner" src="bin/img/progress_spinner.gif" />
</div>
<script type="text/javascript">
    console.log('Inline html seems to work? Nice');
    // TODO Move to a bootstap file.
    const AUTH_NONCE = ''; // TODO remove
    const RES_ROOT = 'bin/'; // TODO remove
    function initMap() {
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
       script.setAttribute('src', 'bin/ConnectionGeography.js')
    }
    (function() {
        let storage = localStorage.getItem('connection-geography') ? JSON.parse(localStorage.getItem('connection-geography')) : {};
        const KEY = googleMapsApiKey;
        const SECRET_KEY = storage[KEY];
        
        if (SECRET_KEY) {
          const googleSource = `https://maps.googleapis.com/maps/api/js?key=${SECRET_KEY}&callback=initMap&v=3.33`;
          let script = document.getElementById('google-maps-lib');
          script.setAttribute('src', googleSource);
          // clear inline style.
          document.getElementById('app-start').setAttribute('style', '');
        } else {
          const setUp = document.getElementById('google-map-set-up');
          setUp.setAttribute('style', '');
          setUp.getElementById('maps-api-submit').addEventListener('click', () => {
            storage[KEY] = setUp.getElementById('maps-api-key').value;
            localStorage.setItem('connection-geography', JSON.stringify(storage));
            // Force refresh.
            window.location.href = window.location.href;
          });
        }
    })();
</script>
