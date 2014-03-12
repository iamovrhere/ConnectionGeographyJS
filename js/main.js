
/**
 * Module for the main of the program.
 * @returns {MyConnectionsMap.connectionMap}
 * 
 * @author Jason J.
 * @version 0.8.0-201400311
 * @type Object
 * @see MapDisplay 0.1.0
 * @see CachedGeocoder 0.3.1
 * @see ConnectionManager 0.1.1
 * @see ConnectionGroup 0.2.0
 * @see GroupInfoWindow 0.1.2
 * @see FocusPolyline 0.1.3
 * @see FocusMarker 0.1.0
 */
function MyConnectionsMap(){
    /** The reference to the map element. 
     * @type MapDisplay Typically containing a google.maps.Map */
    var mapDisplay=  new MapDisplay();
    /** Reference to cached-geocoder; an object that caches geocoded places. 
     * @type CachedGeocoder */
    var cachedGeocoder = new CachedGeocoder();
    /** Reference to connection manager which retrieves + caches connections from
     * social media. NOTE: CAN BE RESET.
     * @type ConnectionManager */
    var connectManager =  0;
    resetConnectionManager();
    
    /** @type String The id for the disconnect action. */
    var DISCONECT_ID = 'disconnect-app-action';
    /** @type String The id for the run/apply action. */
    var RUN_AND_APPLY_ID= 'perform-action';
    /** @type String The id for the application status. */
    var APP_STATUS_ID = 'app-status';
    /** @type String The id for the application progress spinner */
    var PROGESS_SPINNER_ID = 'app-progress-spinner';
    
    /** @type String The intial value for the run button. */
    var BUTTON_RUN_VALUE = 'Run';
    /** @type String The final value for the run button. */
    var BUTTON_APPLY_VALUE = 'Apply';
    
    /** @type Object|Number The connections list sorted by 'address' that is: 
     * { "city, country-code": new Array( {record1}, {record2} ), ... }. 
     * <br/>
     * Intial value is empty. 
     * For keys:
     * https://developer.linkedin.com/documents/connections-api
     * http://developer.linkedin.com/documents/profile-fields */
    //var connectionsList = 0;
    /** @type Object|GroupInfoWindow Contains a list of addresses that point to info windows. */
    var infoWindows = 0;
    /** @type Object 2nd connections total per captia. */
    var secondConnectionsTotals = {};
    /** @type Object|ConnectionGroup the list of connection groups kept to clear map. */
    var connectionGroups = {};
    
    ////////////////////////////////////////////////////////////////////////////
    //// 'Private' helper functions
    ////////////////////////////////////////////////////////////////////////////
   /** Attempts to preload an image if possible.
    * 
    * @param {Object} record If image exists in record, preload it.
    */
    var preloadImage = function (record){
        if (record.pictureUrl){
            var img = new Image();
                img.src = record.pictureUrl;
        }
    };
    
    var resetConnections = function(){
        infoWindows = 0;
        secondConnectionsTotals = {};
        for (var address in connectionGroups){
            connectionGroups[address].clear();
        }
        connectionGroups = {};
        resetConnectionManager();
    };
    
   /**
    * Sorts, locates and creates info-windows of the linkedin connections.
    * @param {Object} results The raw results from the linkedin api/ConnectionManager
    */ 
    var processLinkedInConnections = function(results){
        updateAppStatus("Sorting & Locating Connections...", true); 
        var myAddress =   connectionMap.linkedin.userInfo.location.name +', ' +
                        connectionMap.linkedin.userInfo.location.country.code;
        if ( !infoWindows){
            infoWindows = {};
            secondConnectionsTotals = {};
            if(results.values){
                for(var index=0,SIZE=results.values.length; index < SIZE; index++){
                    try{
                        var record = results.values[index];
                        var address = record.location.name +', '+record.location.country.code;
                        if (!infoWindows[address]){ 
                            //if unset, create window
                            infoWindows[address] = new GroupInfoWindow({}, record.location.name);
                            secondConnectionsTotals[address] = 0;
                            //precache locations.
                            cachedGeocoder.geocodeQueueAddress(address);
                            if (address.indexOf(myAddress) >= 0){
                                infoWindows[address].setPreheader(connectionMap.linkedin.userInfo);
                            }
                        }
                        preloadImage(record);
                        infoWindows[address].appendRecord(record);
                        
                        secondConnectionsTotals[address] += record.numConnections;
                    } catch (e){
                        console.log('unexpected error?: '+ e);
                        //In case we fail to get an address or something, we will save it as unknown.
                        infoWindows['unknown'] = new GroupInfoWindow({}, 'unknown');
                        infoWindows['unknown'].appendRecord(record);
                    }
                }
                
                if (!cachedGeocoder.queuedGeocodeComplete()){
                    cachedGeocoder.addEventListener('queuecomplete',
                        function(){
                            plotConnections(myAddress);
                        });
                }
            }
        } else {
            plotConnections(myAddress);
        }
    };
    var bounds = 0;
    
    /**
     * Maps the connections onto the map via the infoWindows list & cachedGeocoder.
     * @param {String} myAddress The address of the current user.
     */
    function plotConnections(myAddress){
        updateAppStatus("Plotting Connections...", true); 
        var map = mapDisplay.getMap();
        
        //map.setZoom(1);
        bounds = new google.maps.LatLngBounds();
        for (var address in infoWindows) {
            var userIsHere =  address.indexOf(myAddress) >=0 ;
            console.log('trying: '+address);
            //Try for safety.
            try {
                //We precached them during sorting.
                var results = cachedGeocoder.getCachedAddress(address);
                if (results){
                    console.log('adding: '+address);

                    var latLng = results[0].geometry.location;
                        var marker = new FocusMarker({   //new google.maps.Marker({new FocusMarker({ 
                            position: latLng,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: (userIsHere ? 9: 7),
                                fillColor: '#259CE5',
                                fillOpacity: 0.9,
                                strokeColor: '#136991',
                                strokeWeight: (userIsHere ? 3 :2),
                                strokeOpacity: (userIsHere ? 1.0 : 0.8)
                              }
                        },
                        {
                            onFocusStrokeColor: '#259CE5',
                            onFocusStrokeOpacity: 1.0
                        });

                        var polyline = new FocusPolyline({
                            path: [connectionMap.linkedin.userInfo.location.coordinates, latLng],
                            geodesic: true,
                            strokeColor: '#136991',
                            strokeOpacity: 0.7,
                            strokeWeight: 5
                        },
                        {
                            onFocusStrokeColor: '#259CE5',
                            onFocusStrokeOpacity: 1.0
                        });
                        if (connectionGroups[address]){
                            connectionGroups[address].clear();
                        }
                        connectionGroups[address]  = new ConnectionGroup(
                                map, marker, polyline, infoWindows[address]);
                        connectionGroups[address].addToMap();
                        bounds.extend(latLng);
                } else {
                    //add to unknown set.
                }
            } catch (e){
                   console.log('Skipped "%s" :', address);
            }
        }
        map.fitBounds(bounds);
        updateAppStatus("Plotting Complete!", false);
        setRunAndApply(BUTTON_APPLY_VALUE, true);
        //clear the status after 2.5 s
        setTimeout(function(){updateAppStatus(""); }, 2500);
    }
    
    var appStatus = 0;
    var appSpinner = 0;
    /** Updates the app status and shows/hides spinner as required. 
     * @param {String} message The message to display
     * @param {Boolean} showSpinner (Optional) shows the spinner if true,
     * hides the spinner if false.
     */
    function updateAppStatus(message, showSpinner){
        if (typeof showSpinner !== 'undefined'){
            if (!appSpinner){
                appSpinner = document.getElementById(PROGESS_SPINNER_ID);
            }
            if (showSpinner){
                appSpinner.setAttribute('style', 'display:block;');
            } else {
                appSpinner.setAttribute('style', 'display:none;');
            }
        }
        if (!appStatus){
            appStatus = document.getElementById(APP_STATUS_ID);
        }
        appStatus.innerHTML = message;
    };
    
    function resetConnectionManager(){
        connectManager = new ConnectionManager();
        connectManager.addEventListener('linkedin', 'fetchcomplete', 
            function(results){
                console.log('fetchAndApplyConnections async: %s', JSON.stringify(results) );
                processLinkedInConnections(results);
                if (results.values){
                    connectionMap.linkedin.numConnections =  results.values.length;
                }
        });
        connectManager.addEventListener('linkedin', 'authorizationerror', 
            function(){ //if not authorized, disconnect.
                updateAppStatus("Warning: Authorization Error");
                    setTimeout(function(){
                        connectionMap.linkedin.disconnectUser('Session Timed-out');
                        updateAppStatus("", false);
                        setRunAndApply(BUTTON_RUN_VALUE);
                    }, 2500);
                
        });
        connectManager.addEventListener('linkedin', 'querylimitreached', 
            function(){
                updateAppStatus("Sorry, LinkedIn Connections could be fetched due to: "
                                +"Daily Query Limit Reached. <br/>Try again later", false);
                setRunAndApply(BUTTON_RUN_VALUE, false);        
        });
        connectManager.addEventListener('linkedin', 'unknownerror', 
            function(){
                updateAppStatus("Sorry, LinkedIn Connections could be fetched due to: "
                                +"An Unknown Error. Try again later", false);
                setRunAndApply(BUTTON_RUN_VALUE, false);
        });
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public function/object
    ////////////////////////////////////////////////////////////////////////////
    /** @type Object The public object. */
    var connectionMap = {
         /** @type Object The linkedin sub object. */
        linkedin: {
            /** The user info for this session. 
             * @type Object As given by the linkedin request:
             * /v1/people/~:(id,pictureUrl,firstName,lastName,location:(name,country:(code)),numConnectionsCapped)*/
            userInfo: {
                id: 0, pictureUrl: 0, firstName: 0, lastName: 0, 
                //coordinates are provided by geocode.
                location: {name:0, coordinates: 0, country: { code: 0}}, 
                numConnectionsCapped: 0,
                //Manually added
                numConnections: 0
            }
        }
    };
    
    /** Fetches and applies connections. */
    connectionMap.fetchAndApplyConnections = function(){
        updateAppStatus("Fetching Connections...", true);
        connectManager.fetchConnections();
        //see resetConnectionManager();
    };
    
    /** Zooms to user, provided there are coordinates to zoom to. 
     * @param {boolean} zoom (Optional) Whether to zoom into the user, default is false. */
    connectionMap.moveToUser = function(zoom){
        var location = this.linkedin.userInfo.location.coordinates;
        var map = mapDisplay.getMap();
        //We have nothing to use, give up.
        if (!location || !map) return;

        var doZoomTimeout = function(zoom, time) {
            setTimeout(function() { 
                map.setZoom(zoom); 
            }, time);
        };
        var finalZoom = 7;
        //if less than our final zoom? zoom in, else: zoom out
        var lvl = map.getZoom() < finalZoom ? 1 : -1;    
        if (zoom){
            for (var zoom = map.getZoom(), step=0; zoom !== finalZoom; zoom+=lvl){
                doZoomTimeout(zoom, 60*step++);
            }
        }
        map.panTo(location);
    };


    /** Used to disconnect the user from the app. 
     * @param {String} message The message to pass on to the login splash. */
    connectionMap.linkedin.disconnectUser = function(message){
        var xmlReq = new XMLHttpRequest();

        var disconnect = document.getElementById(DISCONECT_ID);
        var orgValue = disconnect.innerHTML;
            disconnect.innerHTML = 'Disconnecting...';
        var disconnectUI = function(){
            document.getElementById('app-controls').style.display = 'none';
            document.getElementById('linkedin-display').innerHTML = '';
            disconnect.innerHTML = orgValue;
            connectionMap.linkedin.showLoginSplash(message);
        };
        xmlReq.open("GET", "auth.php?logout=1", true);
        xmlReq.onreadystatechange=function() {
            if (xmlReq.readyState === 4 && xmlReq.status === 200) {
               //We don't care about response text, just that it logged out.
               disconnectUI();
            }
        };
        xmlReq.send();
        resetConnections();
    };

    /** Sets the main user info and then shows it.
     * @param {Object} userJson The user info.
     */
    connectionMap.linkedin.setAndShowUser = function (userJson){
        this.setUser(userJson);
        this.showUser();
    };

    /** Creates and inserts the login splash. 
     * @param {string} message An extra message to insert above/below the connect button. */
    connectionMap.linkedin.showLoginSplash = function(message){
        var connectSplash = document.createElement('div');
            connectSplash.setAttribute('id', 'connect-splash');
            connectSplash.setAttribute('class', 'centered-item-outer');
            connectSplash.innerHTML = 
                '<div id="connect-splash-background" class="splash-background" ></div>'+
                '<div id="connect-splash-inner" class="centered-item-middle" style="display: none;">'+
                '</div>';
        document.getElementById('app-container').appendChild(connectSplash);
        var inConnect = new LinkedInConnect('linkedin-connect-button', 'auth.php');
        var msg = document.createElement('div');
            msg.innerHTML = '(Opens in a new window)';
        var splash = document.getElementById('connect-splash-inner');
            if (message){
                var msg2 = document.createElement('div');
                    msg2.innerHTML = message;
                    msg2.setAttribute('id', 'connect-splash-message');
                splash.appendChild(msg2);
            }
            splash.appendChild(inConnect.getButton());
            splash.appendChild(msg);
            splash.style.display = '';    
    };

    /** Sets the main user info. 
     * @param {Object} userJson The user info.
     */
    connectionMap.linkedin.setUser = function (userJson){
        //console.log('setUser: %s', JSON.stringify(userJson));
        this.userInfo = userJson;
        var address = this.userInfo.location.name+', '+
                      this.userInfo.location.country.code;
        cachedGeocoder.geocodeAddress({address:address},
                function(results, status){
                   if (google.maps.GeocoderStatus.OK === status ) {
                       connectionMap .linkedin
                                        .userInfo
                                        .location
                                        .coordinates = results[0].geometry.location;
                       connectionMap.moveToUser(true);
                    }
                });
        setRunAndApply(BUTTON_RUN_VALUE, true);
    };
    /** Shows the user on the display. */
    connectionMap.linkedin.showUser = function(){
        var truncate = function(input, length){
            return  input.length > length ?
                    input.substr(0, length-3)+'...' :
                    input;
        };
        var userNameLength = 44;
        var userLocLength = 50;
        var fullname  =  this.userInfo.firstName+' '+this.userInfo.lastName;
        var location = this.userInfo.location.name;
        var title = fullname+', '+location;

        var userPic = document.createElement('img');
            userPic.setAttribute('id', 'linkedin-user-pic');
            userPic.setAttribute('src', this.userInfo.pictureUrl);


        var userName = document.createElement('div');
            userName.setAttribute('id', 'linkedin-user-name');
            userName.innerHTML = truncate(fullname, userNameLength);
        var userLoc = document.createElement('div');
            userLoc.setAttribute('id', 'linkedin-user-location');
            userLoc.innerHTML = truncate(location, userLocLength);

        var userInfo = document.createElement('div');
            userInfo.setAttribute('id', 'linkedin-user-info');
            userInfo.appendChild(userName);
            userInfo.appendChild(userLoc);

        // Remove splash
        var splash = document.getElementById('connect-splash');
            if (splash){
               splash.parentNode.removeChild(splash);    
            }

        //remove hidden style.
        var controlPanel = document.getElementById('app-controls');
        
        
        var displayCard = document.getElementById('linkedin-display');
            displayCard.appendChild(userPic);
            displayCard.appendChild(userInfo);

            displayCard.style.display = '';
            displayCard.setAttribute('title', title.trim());
            displayCard.addEventListener('click', 
                                    function(){connectionMap.moveToUser();}, 
                                    false);
        controlPanel.style.display = '';
        
        if (!document.getElementById('special-hidden-control-padding')){  
            //simple hack to prevent overlap
            var controlPadding = document.createElement('div');
                controlPadding.setAttribute('id', 'special-hidden-control-padding');
                controlPadding.setAttribute('style', 'width: 100%; height: 55px;');
            mapDisplay.getMap().controls[google.maps.ControlPosition.TOP_CENTER].push(controlPadding);
        } 
        
    };

    
    ////////////////////////////////////////////////////////////////////////////
    //// 'Private' Internal functions
    ////////////////////////////////////////////////////////////////////////////
    /** Sets the run & apply button's text and ablity.
     *  @param {string} value The button value to have
     * @param {boolean} enabled (Optional) Whether to enable or disable the button. Default enabled.
     */
    var setRunAndApply = function(value, enabled){
        var run = document.getElementById(RUN_AND_APPLY_ID);
            run.value =  value;
            if (enabled == false){
                run.setAttribute('disabled', 'disabled');
            } else {
                run.removeAttribute('disabled');
            }
        
    };
    //Sets all click events.
    var setClickEvents = function(){
        document.getElementById(DISCONECT_ID)
                .addEventListener(
                'click', 
                function(){ connectionMap.linkedin.disconnectUser();}, 
                false);
        document.getElementById(RUN_AND_APPLY_ID)
                .addEventListener(
                'click', 
                function(){
                 setRunAndApply('Running', false);
                 connectionMap.fetchAndApplyConnections();
                },
                false);
    };
    
    
    ////////////////////////////////////////////////////////////////////////////
    //// Last minute items
    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    //// Events
    ////////////////////////////////////////////////////////////////////////////
    
    //see resetConnectionManager(); 
        
    cachedGeocoder.addEventListener('querylimitreached', 
        function(){
            /** @TODO A warning of some kind*/
            updateAppStatus("Sorry, Connections could not be plotted due to: "
                            +"Daily Query Limit Reached. Try again later");
        });
    cachedGeocoder.addEventListener('unknownerror', 
        function(){
            /** @TODO A warning of some kind*/    
            updateAppStatus("Sorry, Connections could not be plotted due to: "
                            +"An Unknown Error. Try again later");
        });
    
    // set it in onload.
    window.addEventListener('load', function(){setClickEvents();}, false);
      
    
    return connectionMap;
};

/** 
 * The entry point into the application. 
 * Always call last.
 */
var myConnectionsMap = MyConnectionsMap();

//Encapuslation is your friend
var browserSupport = {
    suggestion: 'Firefox or Chrome.'
};

/**@returns {Number} Returns -1 for not supported, 
 * 0 for partial support, 
 * 1 for supported,
 * 2 for tested.  */
browserSupport.browserSupportCheck = function(){
    var ua = navigator.userAgent;
    
    if (/Moz(?!.*(iP[aho]|Android|Mobile).*).*Firefox\/\d{2,}/i.test(ua)){
        //Developed and tested in desktop FF.
        return 2;
    } else if (/MSIE.*([9]|\d{2,})|Moz(?!.*(iP[aho]|Android|Mobile).*)(Firefox\/\d{2,}|AppleWebKit.*Chrome)/i.test(ua)){
        //supporting IE 9+, Firefox 10+, Chrome; all non-mobile
        return 1;
    } else if (/MSIE.*[0-7]/.test(ua)){
        //no support for IE 6,7, & under. 
        return -1;
    }
    /* if (/Opera|Safari|Mobile|iPhone|iPad|iPod|Android|Chrome/i.test(ua)){
        return 0;
    }   */
    //Deprecated to partial support of IE8; it's annoy and behind on standards
    //and *should* leave the market.
    //potential support for other browsers: buyer beware
    return 0; 
};
/** Updates the banner notice.
 *  @param {String} message The message to add
 */
browserSupport.bannerNotice = function(message){
    window.addEventListener('load', function(){
        var banner = document.getElementById('app-notice-banner');
            banner.innerHTML = message;
            banner.style='display: block;';
        var close = document.createElement('a');
            close.setAttribute('href', 'javascript:void(0);')
            close.setAttribute('id', 'close-notice-banner');
            close.innerHTML = "x";
            close.addEventListener('click', function(){banner.style.display='';}, false);
        banner.appendChild(close);
    }, false);
};

browserSupport.run = function(){
    /** -1 for no support, 0 for partial support, 1 for supported, 2 for supported + tested. */
    var support = browserSupport.browserSupportCheck();
    if (support >= 0){
        if (support === 0){
            //warn limit support
            //alert('browser has limited support!');
            browserSupport.bannerNotice('There is limited support for your browser. <br/>' +
                        'If you encounter diffculty, please consider using a recent version of '
                        + browserSupport.suggestion);
        }
    } else {
        //alert('browser not supported!');
        browserSupport.bannerNotice('Sorry, your browser is not supported... =( <br/>' +
                    'Consider using a recent version of either ' +browserSupport.suggestion);
    }
};
browserSupport.run();
