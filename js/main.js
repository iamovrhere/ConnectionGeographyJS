//Compatibility functions for IE

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  };
}
/*
 * Alternatively:
 * if (element.addEventListener) {
        element.addEventListener('event', function, false);
    } else if (element.attachEvent) {
        element.attachEvent('event',  function);
    } else {
        element['onevent'] = function;
    } 
 */
if (typeof Document.prototype.addEventListener  !== 'function' ) {
        Document.prototype.addEventListener = function(evt, func, bubble){
            evt = 'on'+evt;
            if (this.attachEvent){
                this.attachEvent(evt, func);
            } else {
                this[evt] = func;
            }
        };
}

/**@returns {Number} Returns -1 for not supported, 
 * 0 for partial support, 
 * 1 for supported,
 * 2 for tested.  */
var browserSupportCheck = function(){
    var ua = navigator.userAgent;
    
    if (/Firefox\/\d\d/i.test(ua)){
        //Developed and test in FF
        return 2;
    } else if (/MSIE.*([89]|\d\d)|Firefox\/\d\d|Moz.*(?!Android)AppleWebKit.*Chrome/i.test(ua)){
        //supporting IE 8+, Firefox 10+, Chrome 
        return 1;
    } if (/Opera|Safari|Mobile|Android.*Chrome\/[.0-9]*/i.test(ua)){
        //potential support for Opera
        return 0;
    }  
    //no support for IE 6,7
    return -1; 
};

/** 
 * The entry point into the application. 
 * Always call last.
 * 
 * @author Jason J.
 * @version 0.3.0-201400307
 * 
 * @type Object
 * @see MapDisplay 0.1.0
 * @see CachedGeocoder 0.1.0
 */
var myConnectionsMap = {
    /** The reference to the map element. 
     * @type MapDisplay Typically containing a google.maps.Map */
    mapDisplay: 0,
    /** Reference to cached-geocoder; an object that caches geocoded places. 
     * @type CachedGeocoder */
    cGeoCoder: 0,
    
    /** @type String The id for the disconnect action. */
    disconnectId: 'disconnect-app-action',
    
    /** The linkedin sub object. */
    linkedin: {
        /** The user info for this session. 
         * @type Object As given by the linkedin request:
         * /v1/people/~:(id,pictureUrl,firstName,lastName,location:(name,country:(code)),numConnectionsCapped)*/
        userInfo: {
            id: 0, pictureUrl: 0, firstName: 0, lastName: 0, 
            //coordinates are provided by geocode.
            location: {name:0, coordinates: 0, country: { code: 0}}, 
            numConnectionsCapped: 0        
        }
    }
};
/** Initializes the application. */
myConnectionsMap.init = function(){
    this.mapDisplay = new MapDisplay();
    this.cGeoCoder = new CachedGeocoder();
    //Returns true if set
    var setDisconnect = function(){
        var disconnect = document.getElementById(myConnectionsMap.disconnectId);
        if (!disconnect) return false;
        disconnect.addEventListener(
                'click', 
                function(){ myConnectionsMap.linkedin.disconnectUser();}, 
                false);
        return true;
    };
    //if disconnect not set, set it in onload.
    if (!setDisconnect()) {
        window.addEventListener('load', 
            function(){setDisconnect();}, false);
    }
};


/** Zooms to user, provided there are coordinates to zoom to. */
myConnectionsMap.zoomToUser = function(){
    var location = this.linkedin.userInfo.location.coordinates;
    var map = this.mapDisplay.getMap();
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
    
    for (var zoom = map.getZoom(), step=0; zoom !== finalZoom; zoom+=lvl){
        doZoomTimeout(zoom, 60*step++);
    }
    map.panTo(location);
};

/** Used to disconnect the user from the app. */
myConnectionsMap.linkedin.disconnectUser = function(){
    var xmlReq = new XMLHttpRequest();
    
    var disconnect = document.getElementById(myConnectionsMap.disconnectId);
    var orgValue = disconnect.innerHTML;
        disconnect.innerHTML = 'Disconnecting...';
    var fire = function(){
        document.getElementById('app-controls').style.display = 'none';
        document.getElementById('linkedin-display').innerHTML = '';
        disconnect.innerHTML = orgValue;
        myConnectionsMap.linkedin.showLoginSplash();
    };
    xmlReq.open("GET", "auth.php?logout=1", true);
    xmlReq.onreadystatechange=function() {
        if (xmlReq.readyState === 4 && xmlReq.status === 200) {
           //We don't care about response text, just that it logged out.
           fire();
        }
    };
    xmlReq.send();
};

/** Sets the main user info and then shows it.
 * @param {Object} userJson The user info.
 */
myConnectionsMap.linkedin.setAndShowUser = function (userJson){
    this.setUser(userJson);
    this.showUser();
};

/** Creates and displays the login splash. */
myConnectionsMap.linkedin.showLoginSplash = function(){
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
        splash.appendChild(inConnect.getButton());
        splash.appendChild(msg);
        splash.style.display = '';    
};

/** Sets the main user info. 
 * @param {Object} userJson The user info.
 */
myConnectionsMap.linkedin.setUser = function (userJson){
    //console.log('setUser: %s', JSON.stringify(userJson));
    this.userInfo = userJson;
    var address = this.userInfo.location.name+', '+
                  this.userInfo.location.country.code;
    myConnectionsMap.cGeoCoder.geocodeAddress({address:address},
            function(results, status){
               if (google.maps.GeocoderStatus.OK === status ) {
                   myConnectionsMap .linkedin
                                    .userInfo
                                    .location
                                    .coordinates = results[0].geometry.location;
                   myConnectionsMap.zoomToUser();
                }
            });
};
/** Shows the user on the display. */
myConnectionsMap.linkedin.showUser = function(){
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
    document.getElementById('app-controls').style.display = '';
    var displayCard = document.getElementById('linkedin-display');
        displayCard.appendChild(userPic);
        displayCard.appendChild(userInfo);
        
        displayCard.style.display = '';
        displayCard.setAttribute('title', title.trim());
        displayCard.addEventListener('click', 
                                    function(){myConnectionsMap.zoomToUser();}, 
                                    false);
    
};
/** -1 for no support, 0 for partial support, 1 for supported, 2 for supported + tested. */
var browserSupport = browserSupportCheck();
if (browserSupport >= 0){
    myConnectionsMap.init();
    if (browserSupport === 0){
        //warn limit support
        alert('browser has limited support!');
    }
} else {
    alert('browser not supported!');
}
