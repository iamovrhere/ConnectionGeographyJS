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

/** 
 * The entry point into the application. 
 * Always call last.
 * 
 * @author Jason J.
 * @version 0.1.0-20140228 
 * 
 * @type Object
 * @see MapDisplay 0.1.0
 */
var myConnectionsMap = {
    /** The reference to the map element. 
     * @type MapDisplay Typically containing a google.maps.Map */
    map: 0,
    
    /** The linkedin sub object. */
    linkedin: {
        /** The user info for this session. 
         * @type Object As given by the linkedin request:
         * /v1/people/~:(id,pictureUrl,firstName,lastName,location:(name,country:(code)),numConnectionsCapped)*/
        userInfo: {
            id: 0, pictureUrl: 0, firstName: 0, lastName: 0, 
            location: {name:0, country: { code: 0}}, numConnectionsCapped: 0        
        }
    }
};
/** Initializes the application. */
myConnectionsMap.init = function(){
    this.map = new MapDisplay();
};

/** Creates and displays the login splash. */
myConnectionsMap.linkedin.showLoginSplash = function(){
    var inConnect = new LinkedInConnect('linkedin-connect-button', 'auth.php');
    var msg = document.createElement('div');
        msg.innerHTML = '(Opens in a new window)';
    var splash = document.getElementById('connect-splash-inner');
        splash.appendChild(inConnect.getButton());
        splash.appendChild(msg);
        splash.style.display = '';    
};

/** Sets the main user info and then shows it.
 * @param {Object} userJson The user info.
 */
myConnectionsMap.linkedin.setAndShowUser = function (userJson){
    this.setUser(userJson);
    this.showUser();
};

/** Sets the main user info. 
 * @param {Object} userJson The user info.
 */
myConnectionsMap.linkedin.setUser = function (userJson){
    console.log('setUser: %s', JSON.stringify(userJson));
    this.userInfo = userJson;
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
        userPic.setAttribute('title', title.trim());
    
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
        splash.parentNode.removeChild(splash);    
        
    //remove hidden style.
    document.getElementById('app-controls').style.display = '';
    var display = document.getElementById('linkedin-display');
        display.style.display = '';
        display.appendChild(userPic);
        display.appendChild(userInfo);
    
};

myConnectionsMap.init();
