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
            location: {name:0, country: { code: 0},}, numConnectionsCapped: 0        
        }
    }
};
/** Initializes the application. */
myConnectionsMap.init = function(){
    this.map = new MapDisplay();
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
    var userPic = document.createElement('img');
        userPic.setAttribute('src', this.userInfo.pictureUrl);
        userPic.setAttribute('title', this.userInfo.firstName+' '+this.userInfo.lastName);
    document.getElementById('linkedin-display').appendChild(userPic);
};

myConnectionsMap.init();
