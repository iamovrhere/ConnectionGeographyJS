/*For keys:
 * https://developer.linkedin.com/documents/connections-api
 * http://developer.linkedin.com/documents/profile-fields */
/**
 * Caches requests made to Linkedin API.
 * 
 * @returns {ConnectionManager}
 * 
 * @author Jason J.
 * @version 0.1.0-20140307
 */
function ConnectionManager() {
    var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', 'connections.php', true);
    /** Whether or not the request has been sent. */
    var requestSent = false;    
    /** Whether or not the request is complete. */
    var requestComplete = false;
    /** The events container for functions. */
    var events = {
        /** @type Object The events for linkedin. */
        linkedin:  {
            /** @type Array An Array of functions to perform */
            authorizationerror: new Array(),
            /** @type Array An Array of functions to perform */
            querylimitreached: new Array(),
            /** @type Array An Array of functions to perform */
            unknownerror: new Array(),
            /** @type Array An Array of functions to perform */
            fetchcomplete: new Array()
        }
    };
    
    /** @type Object The container for linkedin connections. */
    var linkedinConnections = {};
    
    ////////////////////////////////////////////////////////////////////////////
    //// Private functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * @param {String} network The social media network to add events for.
     * Supports 'linkedin' only.
     * @param {String} event The event to listen for.
     * Supported values include: 'authorizationerror', 'querylimitreached'
     */
    var fireEvent = function(network, event){
        if (events[network]){
            if (/fetchcomplete/.test(event)){
                for (var index =0; index < events[network][event].length; index++){
                    events[network][event][index](linkedinConnections);
                }
            } else if (events[network][event]){
                for (var index =0; index < events[network][event].length; index++){
                    events[network][event][index]();
                }
            }
        }
    };
    
    /** Builds the function to handle the response.
     * @param {XMLHttpRequest} xmlreq  The current request that is responding.
     * @return {Function} The function to handle the response. */
    var onresponse = function(xmlreq){
        return function(){
            if (xmlreq.readyState === 4){
                if (xmlreq.status === 200){
                    var json = 0; 
                    try {
                        json = JSON.parse(xmlreq.responseText);
                    } catch (e){
                        //unexpect behaviour.
                    }
                    if (json){
                        
                        //If undefined, then it must not have anything set.
                        if (typeof linkedinConnections._total === 'undefined'){
                           linkedinConnections= json;
                        } else {
                            //we must have some elements set already.);
                            if (Array.isArray(linkedinConnections.values)){
                                linkedinConnections.values = 
                                    linkedinConnections .values
                                                        .concat(json.values);
                            }
                        }
                        
                        if (linkedinConnections.values && 
                            json._total > linkedinConnections.values.length){
                            var xmlhttp2 = new XMLHttpRequest();
                            var arg = 'start='+linkedinConnections.values.length;
                            
                            xmlhttp2.open('GET', 'connections.php?'+arg, true);
                            xmlhttp2.send();
                            xmlhttp2.onreadystatechange = onresponse(xmlhttp2);
                        } else {
                            fireEvent('linkedin', 'fetchcomplete');
                            requestComplete = true;
                        }
                    }
                } else if (xmlreq.status === 401) {
                    fireEvent('linkedin', 'authorizationerror');
                } else if (xmlreq.status === 403) {
                    fireEvent('linkedin', 'querylimitreached');
                } else {
                    fireEvent('linkedin', 'unknownerror');
                }
            }
        };
    };
    xmlhttp.onreadystatechange = onresponse(xmlhttp);
        
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Adds event listeners for when this object experiences certain events.
     * @param {String} network The social media network to add events for.
     * Supports 'linkedin' only.
     * @param {String} event The event to listen for.
     * Supported values include: 
     * 'authorizationerror', 'querylimitreached', 'unknownerror',
     * 'fetchcomplete'.
     * Note that 'fetchcomplete' takes 1 argument (the response).
     * @param {Function} action The action to take at the event
     * @returns {Function} The action added
     */
    this.addEventListener = function(network, event, action){
        if (events[network]){
            if (events[network][event]){
                events[network][event].push(action);
            }
        }
    };
    /** Fetchs the social media connections and stores them.
     * It is suggested you call addEventListener with 'fetchcomplete'. */
    this.fetchConnections = function(){
        if (!requestSent){
            xmlhttp.send();
            requestSent = true;
        } else if (requestComplete) {
            fireEvent('linkedin', 'fetchcomplete');
        }
    };
    
    /** Returns the linkedin connections in the form of the API. 
     * May be empty. */
    this.getLinkedInConnections = function(){
        return linkedinConnections;
    };
};


