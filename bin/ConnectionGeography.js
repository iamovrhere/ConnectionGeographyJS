/*
 * Reference: //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
/**
 * Used to calculate approximate colour gradients based upon the relative position 
 * of a value between the maximum and minimum values.
 * <br/>
 * (This object is still experimental)
 * <br/>
 * Colours take the form of either 6 letter hex (aa1122) to be parsed or {r:0,g:0,b:0}
 * @param {Number} minValue The value at which the minColour is represented
 * @param {Number} maxValue The value for which the maxColour is represented
 * @param {String|Object} minColour The start or minimum colour
 * @param {String|Object} maxColour The end or maximum colour.
 * @param {String|Object} midColour (Optional) The middle or 50% colour
 * If omitted, the object will attempt graduate between the two.
 * @author Jason J.
 * @version 0.2.1-20140313
 * @type ColourGradient
 */
function ColourGradient(minValue, maxValue, minColour, maxColour, midColour)  {
    /** @type Object|{r,g,b} The start colour. */
    var m_minColour = processArg(minColour);
    /** @type Object|{r,g,b} The middle colour. Sometimes null. */
    var m_midColour = midColour ? processArg(midColour) : null;
    /** @type Object|{r,g,b} The end colour. */
    var m_maxColour = processArg(maxColour);
    
    /** @type Object|{r,g,b} The amounts to shift rgb froms start towards the end. */
    var shift = {   };
    if (!m_midColour){
        /** @type Object|{r,g,b} The amounts to shift rgb froms start towards the end. */
        shift.full = configureGradientShift(m_minColour, m_maxColour);
    } else {
        /** @type Object|{r,g,b} The amounts to shift rgb towards the middle. */
        shift.one = configureGradientShift(m_minColour, m_midColour);
        /** @type Object|{r,g,b} The amounts to shift rgb towards the final goal. */
        shift.two = configureGradientShift(m_midColour, m_maxColour);
    }
    
    
    var m_minValue = minValue;
    //prevent zeroes.
    var m_maxValue = 0 === maxValue ? 0.0001 : maxValue;
    /** @type Number The difference between max and min. */
    var m_range  = maxValue - minValue;
    /** @type Number Mid-way between min & max. */
    var m_middleValue = m_maxValue - m_range/2; 
    
    ////////////////////////////////////////////////////////////////////////////
    //// functions
    ////////////////////////////////////////////////////////////////////////////
    
    /** Tests the argument to see if valid, if not throws error. 
     *  @param {Mixed} arg The argument to test.
     * @returns {Object|ColourGradient.hexToRgb.Anonym$0}
     */
    function processArg(arg){
        if (!arg.r || !arg.g || !arg.b){
            try {
                return ColourGradient.hexToRgb(arg);
            } catch (e){
                console.log('Bad argument passed: %s', arg);
            }
        }
        return arg;
    };
    /**
     * 
     * @param {Object|{r,g,b}} startColour The start colour
     * @param {Object|{r,g,b}} endColour The end colour
     * @returns {Object|{r,g,b}} Gradient in the form {r,g,b}
     */
    function configureGradientShift(startColour, endColour){
        return {
            r: startColour.r - endColour.r,
            g: startColour.g - endColour.g,
            b: startColour.b - endColour.b
        };
    };
    /** Calculates colour bases upon params passed. 
     * @param {Object} initColur The initial colour
     * @param {Object} shift Either shift one, two or full.
     * @param {Number} percent The percent for this shift
     * @param {Number} offset The offset to apply
     * @returns {Object|{r,g,b}} The colour calculated.
     */ 
    function calcColor(initColur, shift, percent, offset){
        var results = {
                        r: initColur.r + (shift.r * percent + offset) ,
                        g: initColur.g + (shift.g * percent + offset) ,
                        b: initColur.b + (shift.b * percent + offset)
                    };
        for (var k in results){
            results[k] = Math.ceil(results[k]);
            if (results[k] > 255){ results[k]= 255; }
            else if (results[k]<0){ results[k] = 0; }
        }
        return results;
    }
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * @param {Number} value The value to get a colour for
     * @param {Number} min The value for which the start colour is returned
     * @param {Number} max The value for which the end colour is returned
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {Object|{r,g,b}} The colour in rgb format.
     * @throws Error If value is less than min or greater than max.     */
    function _getRgbGradient(value, min, middle, max, range, offset){
        if (value < min || value > max ){
            throw new Error('Value is not within the range of (min)%s <= (value)%s <= (max)%s',
                            min, value, max);
        }
        if (!offset){
            offset = 0;
        }
            
        switch (value){
            case min: 
                return m_minColour;
            case max:
                return m_maxColour;
            default:
                if (midColour){
                    var halfPercent = 0;
                    if (value < middle){
                        //first half.
                        halfPercent = value/middle;
                        if (halfPercent < 0.5){
                            return calcColor(m_minColour, shift.one, halfPercent, offset);
                        }//else
                        return calcColor(m_midColour, shift.one, 1-halfPercent, offset);
                        
                    } else if  (value > middle ){
                        //second half.
                        halfPercent = (value-middle)/middle;
                        if (halfPercent < 0.5){
                            return calcColor(m_midColour, shift.two, halfPercent, offset);
                        }//else
                        return calcColor(m_maxColour, shift.two, 1-halfPercent, offset);
                    } else {
                        return m_midColour;
                    }
                } else {
                    var percent = (value-min)/max;
                    if (percent < 0.5){
                        return calcColor(m_minColour, shift.full, percent, offset);
                    } 
                    return calcColor(m_maxColour, shift.full, 1-percent, offset);
                }
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * Optionally offsets this value.
     * @param {Number} value The value to get a colour for
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {String} The colour in hex string format. (#001122)
     * @throws Error If value is less than min or greater than max.     */
    this.getHexGradient = function(value, offset){
        var rgb = _getRgbGradient(value, m_minValue, m_middleValue, m_maxValue, m_range, offset);
        var hex = ColourGradient.rgbToHex(rgb.r, rgb.g, rgb.b);
        return hex;
    };
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * Optionally offsets this value.
     * @param {Number} value The value to get a colour for
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {Object|{r,g,b}} The colour in rgb format.
     * @throws Error If value is less than min or greater than max.     */
    this.getRgbGradient = function (value, offset){
        return _getRgbGradient(value, m_minValue, m_middleValue, m_maxValue, m_range, offset);
    };
}

/** Converts r,g,b to hex.
 * @param {Number} r The red 
 * @param {Number} g The green
 * @param {Number} b The blue
 * @returns {String} The hex in the form of #001122
 */
ColourGradient.rgbToHex = function(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/** Parses the hex into r,g,b format.
 * @param {String|Number} hex attempts to parse the hex into rgb form.
 * @returns {{r,g,b}|ColourGradient.hexToRgb.Anonym$0} In the form of {r: 0, g: 0, b: }. */
ColourGradient.hexToRgb = function(hex){
    var bigint = parseInt(hex, 16);
    return {r: (bigint >> 16 & 255), g: (bigint >> 8 & 255), b: (bigint & 255)};
};/**
 * Caches requests made to the geocoder,
 * may or may not use the server for external caching in the future.
 * 
 * @returns {CachedGeocoder}
 * 
 * @author Jason J.
 * @version 0.3.1-20140310
 * @see google.maps.Geocoder
 */
function CachedGeocoder(){
    /** @type google.maps.Geocoder */
    var  geocoder = new google.maps.Geocoder();
    
    /** @type Object Contains a list of cached values indexed by addresses */
    var cachedValues = {};
        
    
    /** The events container for functions. */
    var events = {
        /** @type Array An Array of functions to perform */
        geocodeupdate: new Array(),
        /** @type Array An Array of functions to perform */
        querylimitreached: new Array(),
        /** @type Array An Array of functions to perform */
        queuecomplete: new Array(),
        /** @type Array An Array of functions to perform */
        unknownerror: new Array()
    };
    
    ////////////////////////////////////////////////////////////////////////////
    //// Private functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * 'geocodeupdate' takes 2 arguments; (result, status), 'querylimitreached', 
     * 'queuecomplete', 'unknownerror'.
     * @param {String} event The event to listen for.
     * Supported values include: 'authorizationerror', 'querylimitreached'
     * @param {mixed} arg1 (Optional) The argument to pass on to the fired event
     * @param {mixed} arg2 (Optional) The argument to pass to the fired event
     */
    var _fireEvent = function(event, arg1, arg2){
        if (/geocodeupdate/.test(event)){
            for (var index =0; index < events[event].length; index++){
                events[event][index](arg1, arg2);
            }
        } else if (events[event]){
            for (var index =0; index < events[event].length; index++){
                events[event][index]();
            }
        }
    };
    
    var _geocodeAddress = function(request, callback){
        if (!request.address){ 
            var req = request;
            try {
                req = JSON.stringify(request);
            } catch(e){}
            throw new Error('Expects an address, got: ' + req); 
        }
        
        if (cachedValues[request.address]){
            var status = google.maps.GeocoderStatus.OK;
            var results = cachedValues[request.address];
            callback(results, status);
        } else {
            geocoder.geocode( request, 
                function(results, status) {
                    if (google.maps.GeocoderStatus.OK === status ||
                        google.maps.GeocoderStatus.ZERO_RESULTS === status) {
                        cachedValues[request.address] = results;
                      }
                      callback(results, status);
                  }
            );
        }
    };
    /**
     * Does geocoding in bulk by referring to a list 
     * @returns {CachedGeocoder.BulkGeocoder}
     */
    var BulkGeocoder = function(onUpdate, onQueueEmpty){
        /** @type {Array} The queue of address to be yet request.*/
        this.inputQueue = new Array();
        /** @type boolean Whether or not we have lingering requests running. */
        this.isGeocoding = false;
        //interval between requests; intially 8/s.
        var startInterval = 120;
        /** @type {Number} The number of retries since last success thus far. */
        this.retryCount = 0;
        /** Strings geocoding requests sequencially.
         * @param {BulkGeocoder} parent The reference to parent for scope.
         * @param {string} address The address to search
         * @param {Number} nextInterval The next interval to use for a request.
         */
        var bulkGeocoding = function(parent, address, nextInterval){
            parent.isGeocoding = true;
            var request = { address: address};
            _geocodeAddress(request, 
            //We need parent in this scope, otherwise we'd have the old array.
                            function(results, status){ 
                                //we may need to retry.
                                var nextAddress = address; 
                                if (google.maps.GeocoderStatus.OVER_QUERY_LIMIT === status ||
                                    google.maps.GeocoderStatus.REQUEST_DENIED === status){
                                    
                                    //According to arithmetic progression, we have
                                    //waited more than [10 * (120 + ~1020)]/2 = ~6s
                                    if (parent.retryCount > 10){
                                        if (google.maps.GeocoderStatus.OVER_QUERY_LIMIT === status){
                                            parent.fireEvent('querylimitreached');
                                        } else {
                                            parent.fireEvent('unknownerror');
                                        }
                                    } else {
                                        //if failed, wait longer and try again.
                                        nextInterval+= 100;
                                        parent.retryCount += 1;
                                    }
                                } else {
                                    //we can continue.
                                    parent.retryCount = 0;
                                    nextAddress = parent.inputQueue.pop();
                                    //we can try to reduce intervals slowly.
                                    if (nextInterval > 150){
                                        //at most we are allowed 10/s, so we do 6.6/s.
                                        nextInterval-= 50;
                                    }
                                }
                                parent.fireEvent('geocodeupdate', results, status);
                                if (parent.inputQueue.length > 0){
                                    setTimeout(
                                            function(){
                                                bulkGeocoding(  parent,
                                                                nextAddress, 
                                                                nextInterval);}, 
                                            nextInterval);
                                } else {
                                    parent.isGeocoding = false;
                                    parent.fireEvent('queuecomplete');
                                }
                            }
                        );
        };
        /**  'geocodeupdate' takes 2 arguments; (result, status), 'querylimitreached', 
     * 'queuecomplete', 'unknownerror'. */
        this.fireEvent = function(event, arg1, arg2){
            _fireEvent(event, arg1, arg2);
        };
        /** Checks to see if the queue has been completed. 
         * If so it returns true, if not it starts the requests and returns false.
         * @returns {Boolean}
         */
        this.queueComplete = function(){
            if (this.inputQueue.length > 0 && !this.isGeocoding){
                bulkGeocoding(this, this.inputQueue[0], startInterval);
                return false;
            }
            return this.isGeocoding == false;
        };
        /** Adds to the queue and attempts to start if if not already started. 
         * @param {string} address the address to add. */
        this.addToQueue = function(address){
            this.inputQueue.push(address);
            if (!this.isGeocoding){
                bulkGeocoding(this, this.inputQueue[0], startInterval);
            }
        };
    };
    var bulk = new BulkGeocoder();
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    /*
     * <ul>
    <li>google.maps.GeocoderStatus.OK indicates that the geocode was successful.</li>
    <li>google.maps.GeocoderStatus.ZERO_RESULTS indicates that the geocode was 
    successful but returned no results. This may occur if the geocode was passed 
    a non-existent address or a latng in a remote location.</li>
    <li>google.maps.GeocoderStatus.OVER_QUERY_LIMIT indicates that you are over 
    your quota. Refer to the Usage limits exceeded article in the Maps for 
    Business documentation, which also applies to non-Business users, for more 
    information.</li>
    <li>google.maps.GeocoderStatus.REQUEST_DENIED indicates that your request 
    was denied for some reason.</li>
    <li>google.maps.GeocoderStatus.INVALID_REQUEST generally indicates that the 
    query (address or latLng) is missing.</li>
    </ul>
     */
    /**
     * 
     * @param {GeocoderRequest} request The geocoding request object as per geocode doc.
     * Expects only addresses.
     * @param {Function} callback The callback to handle the result.
     * Moreover: function(Array.<GeocoderResult>, GeocoderStatus)
     * Status is per GeocoderStatus doc.
     * 
     * 
     */
    this.geocodeAddress = function(request, callback){
        _geocodeAddress(request, callback);
    };
    /**
     * Returns the geocode result for this address.
     * @param {Strings} address The address to get.
     * @returns {results|CachedGeocoder.cachedValues} 
     * The geocode result for this address.
     */
    this.getCachedAddress = function(address){
        return cachedValues[address];
    };    
    
    /**
     * Adds event listeners for when the bulk geocoder 
     * object experiences certain events.
     * 
     * @param {String} event The event to listen for.
     * Supported values include: 
     * 'geocodeupdate', 'querylimitreached', 
     * 'queuecomplete', 'unknownerror'.
     * Note that:<br/>
     * - 'geocodeupdate' takes 2 arguments; (result, status).
     * @param {Function} action The action to take at the event
     * @returns {Function} The action added
     */
    this.addEventListener = function(event, action){
        if (events[event]){
                events[event].push(action);
        }
    };
    
    /** Call after prepareBulkGeocode.
     * Used in bulk geocoding. Queues the address for bulk geocoding
     * and begins trying.
     * @param {String} address The address to geocode.
     */
    this.geocodeQueueAddress = function(address){
        if (bulk){
            bulk.addToQueue(address);
        }
    };
    /**Call after prepareBulkGeocode.
     * Returns if the geocoding is complete, if not starts it.
     * @returns {Boolean} true for complete, false for not complete.
     */
    this.queuedGeocodeComplete = function(){
        return bulk.queueComplete();
    };
    
    /* this.geocodeAddressList = function(addresses, onUpdate, onComplete){
        for(var index = 0, SIZE = addresses.length; index < SIZE; index++){
            
        }
    }; */
    
};

/*For keys:
 * https://developer.linkedin.com/documents/connections-api
 * http://developer.linkedin.com/documents/profile-fields */
/**
 * Caches requests made to Linkedin API.
 * 
 * @returns {ConnectionManager}
 * 
 * @author Jason J.
 * @version 0.1.1-20140311
 */
function ConnectionManager() {
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
                    requestSent = false;
                } else if (xmlreq.status === 403) {
                    fireEvent('linkedin', 'querylimitreached');
                    requestSent = false;
                } else {
                    fireEvent('linkedin', 'unknownerror');
                    requestSent = false;
                }
            }
        };
    };
        
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
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('GET', 'connections.php', true);
            xmlhttp.send();
            xmlhttp.onreadystatechange = onresponse(xmlhttp);
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


/**
 * Builds the linkedin connect button for php authentication.
 * @param {string} id The id to give the button.
 * @param {string} popupHref The popup location
 * @returns {LinkedInConnect}
 * 
 * @author Jason J.
 * @version 0.1.2-20140306
 */
function LinkedInConnect(id, popupHref) {
    /** @type Element */
    var linkedinButton = document.createElement('span');
        linkedinButton.setAttribute('id', id);
        linkedinButton.setAttribute('class', "IN-widget");
        linkedinButton.setAttribute('style', "line-height: 1; vertical-align: baseline; display: inline-block;");
        linkedinButton.innerHTML = '<span style="padding: 0px ! important; margin: 0px ! important; text-indent: 0px ! important; display: inline-block ! important; vertical-align: baseline ! important; font-size: 1px ! important;"><span id="li_ui_li_gen_1393966178953_0"><a id="li_ui_li_gen_1393966178953_0-link" href="javascript:void(0);"><span id="li_ui_li_gen_1393966178953_0-logo">in</span><span id="li_ui_li_gen_1393966178953_0-title"><span id="li_ui_li_gen_1393966178953_0-mark"></span><span id="li_ui_li_gen_1393966178953_0-title-text">Sign in with LinkedIn</span></span></a></span></span>';
    
    var hover = function(){
        var linkedinButton = document.getElementById('li_ui_li_gen_1393966178953_0');
        linkedinButton.setAttribute('class', "IN-widget hovered"); 
    };
    var down = function(){
        var linkedinButton = document.getElementById('li_ui_li_gen_1393966178953_0');
        linkedinButton.setAttribute('class', "IN-widget down"); 
    };
    var normal = function(){  
        var linkedinButton = document.getElementById('li_ui_li_gen_1393966178953_0');
        linkedinButton.setAttribute('class', "IN-widget"); 
    } ;
    
    
    var width = 450;
    var height =650;
    var left = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        left = (screen.width/2)-(width/2) + left;
    var top = window.screenTop !== undefined ? window.screenTop : screen.top;
        top = (screen.height/2)-(height/2)  + top ;
    this.popupWindow = function(){
        //console.log(left+" "+ top);
        window.open(popupHref, "Connect with Linkedin", "toolbar=no,menubar=no,scrollbars=yes,width="+width+",height="+height+",top="+top+",left="+left);
    };
    
    if (linkedinButton.addEventListener) {
        //we are relying on pre-set compatibility functions.
        linkedinButton.addEventListener('mouseover', hover, false);
        linkedinButton.addEventListener('mousedown', down, false);
        linkedinButton.addEventListener('mouseup', normal, false);
        linkedinButton.addEventListener('mouseout', normal, false);
        linkedinButton.addEventListener('click', this.popupWindow, false);
    } else {
        //problems!
        linkedinButton['onmouseover'] = hover;
        linkedinButton['onmousedown'] = normal;
        linkedinButton['onmouseup'] = normal;
        linkedinButton['onmouseout'] = normal;
        linkedinButton['onclick'] = this.popupWindow;
    }    
    
  
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    this.getButton = function(){
        return linkedinButton;
    };
   
};


/**
 * Objects that represents a group of connections.
 * That is: Marker, Polyline, info window.
 * @param {google.maps.Map} map The map to add markers and polylines to
 * @param {FocusMarker} marker The focusable marker for this connection group.
 * @param {FocusPolyline} polyline The focusable polyline for this connection group.
 * @param {GroupInfoWindow} infoWindow The info window for the group.
 * @author Jason J.
 * @version 0.4.0-20140312
 * @type ConnectionGroup
 * @see GroupInfoWindow 0.1.1
 * @see FocusPolyline 0.1.3
 * @see FocusMarker 0.1.0
 */
function ConnectionGroup(map, marker, polyline, infoWindow){
    //var m_infowindow = infowindow;
    var keepFocused = false;
    /** @type Number The last time the window was opened in milliseconds. 0 is never opened. */
    var lastOpened = 0;
    /** Use for closure. */
    var thisGroup = this;
    
   
    /** Closes other opened groups. 
     * @see forceFocus */
    function closeOpenedGroups(){
        for (var key in ConnectionGroup.openGroups){
            var group = ConnectionGroup.openGroups[key];
            if (thisGroup !== group){
                group.forceFocus(false);
            }
        }
    }
    
    /**
     * Focus on the group and adds it to the list of openGroups. 
     * @param {boolean} focus <code>true</code> to focus, <code>false</code> to unfocus.
     */
    function focusGroup(focus){
        if (focus){
            var count = 0;
            do{
                //unique identifier
                lastOpened = new Date().getTime(); 
                if (count++ > 1000){ //should also never happen.
                    throw new Error( //never^1000
                    'The impossible has happened: '+
                    'Groups keep opening at the same time;'+
                    ' we suspect foul play.'); 
                }
                //should never loop.
            }while(ConnectionGroup.openGroups[''+lastOpened]);
            
            ConnectionGroup.openGroups[''+lastOpened] = thisGroup;
            infoWindow.open(map);
            polyline.setFocus(true);
            marker.setFocus(true);
        } else {
            infoWindow.close();
            polyline.setFocus(false);
            marker.setFocus(false);
            delete ConnectionGroup.openGroups[''+lastOpened];
        }
    }
    
    /** The action for when info window is X'd */
    function infoWindowClosed(){
        keepFocused = false;
        polyline.setFocus(false);
        marker.setFocus(false);
    }
    
    /** The click events for this group. */
    function clickEvent(){
        //toggle value.
        keepFocused = !keepFocused;
        focusGroup(keepFocused);
        closeOpenedGroups();
    };
    
    /** The mouseover events for this group. */
    function mouseoverEvent(){
        if (keepFocused){
            return;
        }
        //infoWindow.open(map);
        polyline.setFocus(true);
        marker.setFocus(true);
    };
    
    /** The mouseout events for this group. */
    function mouseoutEvent(){
        if (keepFocused){
            return;
        }
        //infoWindow.close();
        polyline.setFocus(false);
        marker.setFocus(false);
    };
    
    ////////////////////////////////////////////////////////////////////////////
    //// Events
    ////////////////////////////////////////////////////////////////////////////
    
    google.maps.event.addListener(marker, 'click', clickEvent);
    google.maps.event.addListener(marker, 'mouseover', mouseoverEvent); 
    google.maps.event.addListener(marker, 'mouseout', mouseoutEvent); 
    google.maps.event.addListener(polyline, 'click', clickEvent);
    google.maps.event.addListener(polyline, 'mouseover', mouseoverEvent); 
    google.maps.event.addListener(polyline, 'mouseout', mouseoutEvent); 
    
    google.maps.event.addListener(infoWindow, 'closeclick', infoWindowClosed);
    
    //google.maps.event.addListener(infoWindow, 'click', reshuffleGroups);
    
    ////////////////////////////////////////////////////////////////////////////
    //// public functons
    ////////////////////////////////////////////////////////////////////////////
    
    this.addToMap = function(Map){
        if (!Map){
            Map = map;
        }
        marker.setMap(Map);
        polyline.setMap(Map);
        infoWindow.setPosition(marker.getPosition());
    };
    
    this.clear = function(){
        marker.setMap(null);
        polyline.setMap(null);
    };
    
    this.forceFocus = function(on){
        keepFocused = on;
        focusGroup(keepFocused);
    };
}



/** Keys are defined by the milliseconds since epoch, such that:
 * {'time': groupThis,...  }
 * @type Object|ConnectionGroup A 'statically' accessible list of open groups. */
ConnectionGroup.openGroups = {}; //Compatibility functions for IE/Other browsers to allow easier js programming
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
//Safety for IE
if (typeof console.log !== 'function'){
     console.log = function(){};
}

if(!Object.create){
    Object.create=function(o){
        function F(){}
        F.prototype=o;
        return new F();
    };
};

/**
 * Creates the map display, adds, removes and highlights elements.
 * Typically will be a Google Map.
 * @author Jason J.
 * @version 0.2.0-20140305
 * @type MapDisplay
 */
function MapDisplay(){ 
    //Initializing the map. 
     /** A reference to the onscreen map. */
    var map = 0;
    
    ////////////////////////////////////////////////////////////////////////////
    //// functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Returns the onscreen map element. 
     * @returns {google.maps.Map} The map element.
     */
    this.getMap = function(){
        return map;
    };
    //Loads the map.
    this.init = function () {
        var mapOptions = {
            //centered around a point in the middle of the atlantic.
            center: new google.maps.LatLng(34.4, -22.15),
            zoom: 3, 

            panControl: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            overviewMapControl: true,
            
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            }

        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    };  
    
    // TODO: This was changed during the upgrade; newer versions of google maps provide callback
    this.init();
}


/* Reference material: 
 * https://developers.google.com/maps/documentation/javascript/reference#Marker
 * https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions
 * https://developers.google.com/maps/documentation/javascript/reference#Symbol
 */
/**
 * The highlightOptions interface for FocusMarker
 * @type object
 */
/*var focusSymbol ={
    //@type string 	The stroke color. All CSS3 colors are supported except 
    //for extended named colors.
    onFocusStrokeColor: 0,	
    //@type number 	The stroke opacity between 0.0 and 1.0.
    onFocusStrokeOpacity: 0, 	
    //@type number 	The stroke width in pixels.
    onFocusStrokeWeight: 0,

    //@type string 	The fill color. All CSS3 colors are supported except 
    //for extended named colors.
    onFocusFillColor: 0,	
    //@type number 	The fill opacity between 0.0 and 1.0.
    onFocusFillOpacity: 0, 	
    
    //@type number The size of the marker in pixels
    onFocusScale: 0
    // @type string The focus path in SVG notation
    onFocusPath: 0,
};*/

/**
 * Extends google.maps.Marker. 
 * Based on FocusPolyline, 
 * provides a simple means to attach focus colours to a marker.
 * @param {google.maps.PolylineOptions} markerOptions The polyline details 
 * @param {Object} focusSymbol The highlight/focus symbol. Described as:
 * <ul>
 * <li>onFocusStrokeColor 	string 	The stroke color. 
 * All CSS3 colors are supported except for extended named colors.</li>
 * <li>onFocusStrokeOpacity 	number 	
 * The stroke opacity between 0.0 and 1.0.</li>
 * <li>onFocusStrokeWeight 	number 	The stroke width in pixels.</li>
 *
 * <li>onFocusFillColor string 	The fill color. All CSS3 colors are supported except </li>
 * <li>onFocusFillOpacity  number 	The fill opacity between 0.0 and 1.0.</li>
 *  
 * <li>onFocusScale number The size of the marker in pixels</li>
 * <li>onFocusPath string The focus path in SVG notation</li>
 * </ul>
 * See: https://developers.google.com/maps/documentation/javascript/reference#Symbol
 * @author Jason J.
 * @version 0.1.0-20140311
 * @type FocusMarker
 * @see google.maps.Marker
 */
function FocusMarker(markerOptions, focusSymbol){
    //google.maps.Marker.call(this, markerOptions);
    this.parent.constructor.call(this, markerOptions);
    
    var m_focusSymbol = focusSymbol;
    
    var m_icon = markerOptions.icon;
    if (m_icon){
        cacheDefaultSymbol(m_icon);
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //// 'private' functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Appends value if !== false|undefined|null.
     * @param {Object} object The object to add to an return.
     * @param {String} key The key to set
     * @param {Number|String} value The value to test and possibly set.
     * @returns {Object} Either the same or altered object
     */
    function appendSymbolItem(object, key, value){
        if (value !== false && typeof value !== 'undefined' && value !== null){
            object[key] = value;
        }
        return object;
    }
    
    function cacheDefaultSymbol(symbol){ 
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'strokeColor', symbol.strokeColor);
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'strokeOpacity', symbol.strokeOpacity);
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'strokeWeight', symbol.strokeWeight);
        
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'fillColor', symbol.fillColor);
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'fillOpacity', symbol.fillOpacity);
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'scale', symbol.scale);
        m_focusSymbol = appendSymbolItem(m_focusSymbol, 'path', symbol.path);
    };
    
    
    ////////////////////////////////////////////////////////////////////////////
    //// public functions
    ////////////////////////////////////////////////////////////////////////////
    
    /** @param {Object} symbol As per the constructor. */
    this.setFocusSymbol = function(symbol){
        m_focusSymbol = symbol;
    };
    /** Override.
    * @param {google.maps.PolylineOptions} options The polyline details 
    */ //Used to intercept options being set 
    this.setOptions = function(options){
        this.parent.setOptions.call(this, options);
        if (options.icon){
            m_icon = options.icon;
            cacheDefaultSymbol(m_icon);
        }
    };
    
    this.setIcon = function(icon){
        m_icon = icon;
        cacheDefaultSymbol(m_icon);
    };
    
    /**
     * Sets whether or not the polyline has gained focus and shifts attributes accordingly.
     * @param {boolean} focused <code>true</code> if focused.
     */
    this.setFocus = function(focused){
        var curr_icon = m_icon;
        if (focused){
            curr_icon = appendSymbolItem(curr_icon, 'strokeColor', m_focusSymbol.onFocusStrokeColor);
            curr_icon = appendSymbolItem(curr_icon, 'strokeOpacity', m_focusSymbol.onFocusStrokeOpacity);
            curr_icon = appendSymbolItem(curr_icon, 'strokeWeight', m_focusSymbol.onFocusStrokeWeight);
        
            curr_icon = appendSymbolItem(curr_icon, 'fillColor', m_focusSymbol.onFocusFillColor);
            curr_icon = appendSymbolItem(curr_icon, 'fillOpacity', m_focusSymbol.onFocusFillOpacity);
            curr_icon = appendSymbolItem(curr_icon, 'scale', m_focusSymbol.onFocusScale);
            curr_icon = appendSymbolItem(curr_icon, 'path', m_focusSymbol.onFocusPath);
        } else {
            curr_icon = appendSymbolItem(curr_icon, 'strokeColor', m_focusSymbol.strokeColor);
            curr_icon = appendSymbolItem(curr_icon, 'strokeOpacity', m_focusSymbol.strokeOpacity);
            curr_icon = appendSymbolItem(curr_icon, 'strokeWeight', m_focusSymbol.strokeWeight);
        
            curr_icon = appendSymbolItem(curr_icon, 'fillColor', m_focusSymbol.fillColor);
            curr_icon = appendSymbolItem(curr_icon, 'fillOpacity', m_focusSymbol.fillOpacity);
            curr_icon = appendSymbolItem(curr_icon, 'scale', m_focusSymbol.scale);
            curr_icon = appendSymbolItem(curr_icon, 'path', m_focusSymbol.path);
        }
        this.parent.setIcon.call(this, curr_icon);
    };
        
    
}
//FocusMarker =  google.maps.Marker;
/** Inheritence. 
 * @type google.maps.Marker */
FocusMarker.prototype = Object.create(google.maps.Marker.prototype);
/** Constructor. */
FocusMarker.prototype.constructor = FocusMarker;
/** Class parent. */
FocusMarker.prototype.parent = google.maps.Marker.prototype;

/** Override.
 * @param {google.maps.PolylineOptions} options The polyline details 
 */
/* FocusPolyline.prototype.setOptions = function(options){
    this.setOptions(options);
}; */
/**
 * Extends google.maps.InfoWindow 
 * Creates a paginated info window built to handle linkedin records.
 * Once the records appended are larged than the page size (3) it creates a new page
 * and paginates records.
 * <br/>
 * Requires the css group_info_window.css to look reasonable.
 * @param {google.maps.InfoWindowOptions} infoWindowOptions The info window options
 * using the form of google.maps.InfoWindowOptions
 * @param {String} locationName (Optional) The location name to display as the area.
 * @author Jason J.
 * @version 0.2.2-201403014
 * @type GroupInfoWindow
 * @see google.maps.InfoWindow 
 * @see group_info_window.css 0.1.1
 * @see img/nopicture.png
 * @see RES_ROOT
 */
function GroupInfoWindow(infoWindowOptions, locationName){
    this.parent.constructor.call(this, infoWindowOptions);
    
    /** @type Array The pages for the info window. */
    var infoWindowPages = new Array();
    /** @type Number The current page being viewed. */
    var currentPageIndex = 0;
    /** @type Boolean if the info window is currently open. */
    var infoOpen = false;
    
    //Constant max size of pages.
    var MAX_PAGE_SIZE = 3;
    /** @type Number The page size of the last page. */
    var currentPageSize = 0;
    
    /** @type Number The total number of (1st) connections at this city. */
    var firstConnectionsTotal = 0;
    /** @type Number The total number of 2nd connections at this city. */
    var secondConnectionTotal = 0;
    /** @type Whether one or more of the connections has a capped connections. */
    var connectionsPlus = false;
    
    /** @type String|Number The location of this city. */
    var locationName = locationName;
    
    var infoBody = document.createElement('div');
        infoBody.setAttribute('class', 'group-info-window');
     
    var header = document.createElement('div');
        header.setAttribute('class', 'info-header');
    
    /** @TODO create and reset header. */
    
    var nextLink = document.createElement('a');
        nextLink.innerHTML+= 'Next &gt;&gt;';
        nextLink.setAttribute('href', 'javascript:void(0);');
        nextLink.setAttribute('class', 'next-page');
        nextLink.addEventListener('click', nextPage, false);
    var prevLink = document.createElement('a');
        prevLink.innerHTML+= '&lt;&lt; Prev';
        prevLink.setAttribute('href', 'javascript:void(0);');
        prevLink.setAttribute('class', 'prev-page');
        prevLink.addEventListener('click', prevPage, false);
    var pageCount = document.createElement('span');
        pageCount.setAttribute('class', 'page-count');
        pageCount.innerHTML = '1/1';
        
    var footer = document.createElement('div');
        footer.setAttribute('class', 'info-footer');
        footer.appendChild(prevLink);
        footer.appendChild(nextLink);
        footer.appendChild(pageCount);
        
    var pageContainer = document.createElement('div');
        pageContainer.setAttribute('class', 'page-container');
    
    
    infoBody.appendChild(header);
    infoBody.appendChild(pageContainer);
    infoBody.appendChild(footer);
    
    //Reset content.
    this.parent.setContent.call(this,infoBody);
    //Add events
    google.maps.event.addListener(this, 'closeclick', windowClosed);
    
    
    ////////////////////////////////////////////////////////////////////////////
    //// private functions
    ////////////////////////////////////////////////////////////////////////////
    
    
    /** The actions to perform when the window is closer. */
    function windowClosed(){
         infoOpen  = false;
     };
    
    /** Set the current page of the info window. 
     * @param {Number} index The page number to set it to. */
    var setPage = function(index){
        if (index < 0  || index > infoWindowPages.length) return;
        
        if (0 === index){  //disable prev.
            prevLink.setAttribute('style', 'visibility: hidden');
        } else if (index > 0 ){ //enable
            prevLink.setAttribute('style', '');
        }  
        if (index === infoWindowPages.length -1){//disable next
            nextLink.setAttribute('style', 'visibility: hidden');
        } else if (index < infoWindowPages.length ){ //enable
            nextLink.setAttribute('style', '');
        }
        //if we change pages.
        if (index !== currentPageIndex || pageContainer.childNodes.length === 0){
            //remove all children.
            while (pageContainer.childNodes.length > 0){
                pageContainer.removeChild(pageContainer.childNodes[0]);
            }
            pageContainer.appendChild(infoWindowPages[index]);
            pageCount.innerHTML = (index+1)+'/'+(infoWindowPages.length);
            currentPageIndex = index;
        }
    };
    
    function nextPage(){
        if (currentPageIndex + 1 < infoWindowPages.length){
            setPage(currentPageIndex+1);
        }
    };
    
    function prevPage(){
        if (currentPageIndex - 1 >= 0){
            setPage(currentPageIndex-1);
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    
    this.getLocation = function(){
        return locationName;
    };
    
    /** Whether or not the info window is open. */
    this.isOpen = function(){
        return infoOpen;
    };
         
    /**
     * Appends a record to the paganated info window.
     * @param {Object} record The response from a linkedin object.
     * @returns {boolean} true on successfully adding record.
     */
    this.appendRecord = function(record){
        /** @type Element The info page element. */
        var infoPage = 0;
        if (infoWindowPages.length > 0 && currentPageSize < MAX_PAGE_SIZE){
            infoPage = infoWindowPages.pop();
        } else {
            infoPage = document.createElement('div');
            infoPage.setAttribute('class', 'page');
            currentPageSize = 0;
        }
        var recordBlock = document.createElement('div');
            recordBlock.setAttribute('class', 'record');
        var fullname = record.firstName +' '+record.lastName;
        var img = record.pictureUrl ?
                '<img src="'+record.pictureUrl+'" title="'+fullname+'"/>':
                //no picture provided, so no picture given.
                '<img src="'+RES_ROOT+'/img/nopicture.png" title="No Picture"/>';
        var connections = '<span class="connections" >'+
                            record.numConnections+
                            (record.numConnectionsCapped ? '+' : '')+
                        '</span>';
        
            recordBlock.innerHTML = img + '<span class="fullname">'+
                                    fullname+'</span>' + connections;

        infoPage.appendChild(recordBlock);
        
        infoWindowPages.push(infoPage);
        //first connections
        firstConnectionsTotal ++;
        //second connections
        secondConnectionTotal += record.numConnections;
        if (record.numConnectionsCapped){
            connectionsPlus = true;
        }
        
        currentPageSize++;        
        this.updateHeader();
    };
    
    /** Updates the header with the new location info. */ 
    this.updateHeader = function(){
        header.innerHTML =
                '<span class="location-name">'+locationName +'</span><br/>'+
                '1st Connections:'+
                '<span class="connections">'+firstConnectionsTotal +'</span><br/>'+
                '2nd Connections: '+
                '<span class="connections">'+secondConnectionTotal +
                (connectionsPlus ? '+':'')+
                '</span><br/>';
    };
    
    /** Used to indicate use is also here.
     * @param {Object} profileRecord Inserts a preceeding line for "you are here".
     */  
    this.setPreheader = function(profileRecord){
        var message = "You are here";
        var preheader = document.createElement('div');
            preheader.setAttribute('id', 'you-are-here');
            preheader.innerHTML =  '<img src="'+profileRecord.pictureUrl+
                                '" title="'+message+'"/>' +
                                message;
        infoBody.insertBefore(preheader, header);
    };
    
    
    ////////////////////////////////////////////////////////////////////////////
    //// Overriden functions
    ////////////////////////////////////////////////////////////////////////////
    this.toString = function(){
        return '[GroupInfoWindow]'+infoBody.outerHTML;
    };
    
    /* this.close = function(){
        this.parent.close.call(this);
        infoOpen  = false;
        delete GroupInfoWindow.openWindows[''+lastOpened];
    }; */
    
    this.open = function(arg1, arg2){
        this.parent.open.call(this, arg1, arg2);
        infoOpen  = true;
        setPage(0); //always open to page 1.
    };
};


/** Inheritence. 
 * @type google.maps.InfoWindow */
GroupInfoWindow.prototype = Object.create(google.maps.InfoWindow.prototype);
/** Constructor. */
GroupInfoWindow.prototype.constructor = GroupInfoWindow;
/** Class parent. */
GroupInfoWindow.prototype.parent = google.maps.InfoWindow.prototype;

////////////////////////////////////////////////////////////////////////////
//// Functions to override
////////////////////////////////////////////////////////////////////////////


/* GroupInfoWindow.prototype.close = function(){
    this.close();
};

GroupInfoWindow.prototype.open = function(arg1, arg2){
    this.open(arg1, arg2);
}; *//* Reference material: 
 * https://developers.google.com/maps/documentation/javascript/reference#Polyline
 * https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions
 */
/**
 * The highlightOptions interface for HighlightPolyline.
 * @type object
 */
/*var highlightOptions ={
    //@type string 	The stroke color. All CSS3 colors are supported except 
    //for extended named colors.
    onFocusStrokeColor: 0,	
    //@type number 	The stroke opacity between 0.0 and 1.0.
    onFocusStrokeOpacity: 0, 	
    //@type number 	The stroke width in pixels.
    onFocusStrokeWeight: 0 	
};*/

/**
 * Extends google.maps.Polyline. 
 * Provides a simple means to attach focus colours on it.
 * @param {google.maps.PolylineOptions} polylineOptions The polyline details 
 * @param {Object} focusOptions The highlight/focus options. Described as:
 * <ul>
 * <li>onFocusStrokeColor 	string 	The stroke color. 
 * All CSS3 colors are supported except for extended named colors.</li>
 * <li>onFocusStrokeOpacity 	number 	
 * The stroke opacity between 0.0 and 1.0.</li>
 * <li>onFocusStrokeWeight 	number 	The stroke width in pixels.</li>
 * </ul>
 * @author Jason J.
 * @version 0.1.3-20140311
 * @type FocusPolyline
 * @see google.maps.Polyline
 */
function FocusPolyline(polylineOptions, focusOptions){
    //google.maps.Polyline.call(this, polylineOptions);
    this.parent.constructor.call(this, polylineOptions);
    var zIndex = polylineOptions.zIndex ? polylineOptions.zIndex : 0;
    
    var m_focusOptions = focusOptions;
    
    
    ////////////////////////////////////////////////////////////////////////////
    //// 'private' functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Appends value if !== false|undefined|null.
     * @param {Object} object The object to add to an return.
     * @param {String} key The key to set
     * @param {Number|String} value The value to test and possibly set.
     * @returns {Object} Either the same or altered object
     */
    function appendOption(object, key, value){
        if (value !== false && typeof value !== 'undefined' && value !== null){
            object[key] = value;
        }
        return object;
    }
    
    function cacheDefaultOptions(options){ 
        m_focusOptions = appendOption(m_focusOptions, 'strokeColor', options.strokeColor);
        m_focusOptions = appendOption(m_focusOptions, 'strokeOpacity', options.strokeOpacity);
        m_focusOptions = appendOption(m_focusOptions, 'strokeWeight', options.strokeWeight);
    };
    cacheDefaultOptions(polylineOptions);
    
    ////////////////////////////////////////////////////////////////////////////
    //// public functions
    ////////////////////////////////////////////////////////////////////////////
    /* @param {number} the z-index to set. */
   /* this.setZIndex= function(z_index){ 
    * //Causes a recursion loop between setZIndex<->setOptions
        this.setOptions({zIndex: z_index});
    }; */
    
    /** @return {number} Returns the current z index or 0. */
    this.getZIndex= function(){ return zIndex; };
    
    /** @param {Object} options As per the constructor. */
    this.setFocusOptions = function(options){
        m_focusOptions = options;
    };
    /** Override.
    * @param {google.maps.PolylineOptions} options The polyline details 
    */ //Used to intercept options being set 
    this.setOptions = function(options){
        this.parent.setOptions.call(this, options);
        cacheDefaultOptions(options);
        if (options.zIndex){
            zIndex = options.zIndex;
        }
    };
    
    /**
     * Sets whether or not the polyline has gained focus and shifts attributes accordingly.
     * @param {boolean} focused <code>true</code> if focused.
     */
    this.setFocus = function(focused){
        var options = {};
        if (focused){
            options = appendOption(options, 'strokeColor', m_focusOptions.onFocusStrokeColor);
            options = appendOption(options, 'strokeOpacity', m_focusOptions.onFocusStrokeOpacity);
            options = appendOption(options, 'strokeWeight', m_focusOptions.onFocusStrokeWeight);
        } else {
            options = appendOption(options, 'strokeColor', m_focusOptions.strokeColor);
            options = appendOption(options, 'strokeOpacity', m_focusOptions.strokeOpacity);
            options = appendOption(options, 'strokeWeight', m_focusOptions.strokeWeight);            
        }
        this.parent.setOptions.call(this, options);
    };
    
}
/** Inheritence. 
 * @type google.maps.Polyline */
FocusPolyline.prototype = Object.create(google.maps.Polyline.prototype);
/** Constructor. */
FocusPolyline.prototype.constructor = FocusPolyline;
/** Class parent. */
FocusPolyline.prototype.parent = google.maps.Polyline.prototype;

/** Override.
 * @param {google.maps.PolylineOptions} options The polyline details 
 */
/* FocusPolyline.prototype.setOptions = function(options){
    this.setOptions(options);
}; */

/**
 * Module for the main of the program.
 * @param {String} auth_nonce The nonce for the authorization. 
 * @returns {MyConnectionsMap.connectionMap}
 * 
 * @author Jason J.
 * @version 0.9.2-201400314
 * @type Object
 * @see MapDisplay 0.1.0
 * @see CachedGeocoder 0.3.1
 * @see ConnectionManager 0.1.1
 * @see ConnectionGroup 0.4.0
 * @see GroupInfoWindow 0.2.0
 * @see FocusPolyline 0.1.3
 * @see FocusMarker 0.1.0
 * @see ColourGradient 0.2.1
 * @see LinkedInConnect 0.1.2
 */
function MyConnectionsMap(auth_nonce){
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
    var ID_DISCONECT = 'disconnect-app-action';
    /** @type String The id for the control divs with inputs. */
    var ID_INPUT_CONTROLS = 'input-controls';
    /** @type String the id for the colour connections choice. */
    var ID_COLOUR_CHOICE_CONNECT ='colour-by-connections';
    /** @type String the id skip home checkbox. */
    var ID_SKIP_HOME ='skip-home-checkbox';
    /** @type String The id for the run/apply action. */
    var ID_RUN_AND_APPLY= 'perform-action';
    /** @type String The id for the application status. */
    var ID_APP_STATUS = 'app-status';
    /** @type String The id for the application progress spinner */
    var ID_PROGESS_SPINNER = 'app-progress-spinner';
    
    /** @type String The intial value for the run button. */
    var VALUE_BUTTON_RUN = 'Run';
    /** @type String The final value for the run button. */
    var VALUE_BUTTON_APPLY = 'Apply';
    
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
    /** @type Object|ConnectionGroup the list of connection groups kept to clear map. */
    var connectionGroups = {};
    
    /** @type Object indexed by addresses, 1st connections total per captia. */
    var firstConnectionsTotals = {};
    /** @type Object indexed by addresses, 2nd connections total per captia. */
    var secondConnectionsTotals = {};
    
    
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
    /** Resets everything to do with connections. */
    var resetConnections = function(){
        infoWindows = 0;
        firstConnectionsTotals = {};
        secondConnectionsTotals = {};
        for (var address in connectionGroups){
            connectionGroups[address].clear();
        }
        connectionGroups = {};
        resetConnectionManager();
    };
    
    /** 
     * @TODO URGENT: Refactoring needs to be done; all this processing and map
     * plotting should have its own object with this one reserved for UI 
     * interactions.
     * 
     * Should clean up about 200-300 lines
     */
    
   /**
    * Sorts, locates and creates info-windows of the linkedin connections.
    * @param {Object} results The raw results from the linkedin api/ConnectionManager
    */ 
    var processLinkedInConnections = function(results){
        updateAppStatus("Sorting & Locating Connections...", true); 
        var myAddress =   connectionMap.linkedin.userInfo.location.name +', ' +
                        connectionMap.linkedin.userInfo.location.country.code;
        var skipHome = getSkipHomeMode();
        var colourMode = getColourMode();
        
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
                            firstConnectionsTotals[address] = 0;
                            secondConnectionsTotals[address] = 0;
                            //precache locations.
                            cachedGeocoder.geocodeQueueAddress(address);
                            if (address.indexOf(myAddress) >= 0){
                                infoWindows[address].setPreheader(connectionMap.linkedin.userInfo);
                            }
                        }
                        preloadImage(record);
                        infoWindows[address].appendRecord(record);
                        
                        firstConnectionsTotals[address] ++;
                        secondConnectionsTotals[address] += record.numConnections;
                    } catch (e){
                        console.log('Unexpected error?: '+ e);
                        //In case we fail to get an address or something, we will save it as unknown.
                        infoWindows['unknown'] = new GroupInfoWindow({}, 'unknown');
                        infoWindows['unknown'].appendRecord(record);
                    }
                }
                
                if (!cachedGeocoder.queuedGeocodeComplete()){
                    cachedGeocoder.addEventListener('queuecomplete',
                        function(){
                            plotConnections(myAddress,colourMode, skipHome);
                        });
                } else {
                    plotConnections(myAddress,colourMode, skipHome);
                }
            }
        } else {
            plotConnections(myAddress,colourMode, skipHome);
        }
    };
    
    cachedGeocoder.addEventListener('querylimitreached', 
        function(){
            /** @TODO A warning of some kind*/
            updateAppStatus("Sorry, Connections could not be plotted due to: "
                            +"Daily Geocoding Query Limit Reached. Try again later", false);
        });
    
   /**
    * Iterates through the connection totals and calculates the connection delta info.
    * @param {string} myAddress The address to skip 
    * @returns {MyConnectionsMap.calcConnectionDeltaInfo.results} with the elements:
    * deltas: { index list of address=>delta}, max: 0, min: 99
    */
    var calcConnectionDensityDeltaInfo = function(myAddress){
        var results = {
            deltas: {},
            max: 0,
            min: 99
        };
        /** Calculates the delta for connections. */
        var calcConnectionDelta = function(first, second){
             return first + second/(2);
        };
         
        for (var address in firstConnectionsTotals) {
            if (myAddress===address){ continue;}
            var d = calcConnectionDelta(firstConnectionsTotals[address],secondConnectionsTotals[address]);
            results.deltas[address] = d;
            if (d < results.min){
                results.min = d;
            }
            if (d > results.max){
                results.max = d;
            }
        };
        return results;
    };
    
    /**
     * Maps the connections onto the map via the infoWindows list & cachedGeocoder.
     * @param {String} myAddress The address of the current user.
     * @param {Number} mode 0 is for blue, 1 is for stoplight.
     * @param {boolean} skiphome <code>true</code> to skip plotting home.
     */
    function plotConnections(myAddress, mode, skiphome){
        var map = mapDisplay.getMap();
        var bounds = bounds = new google.maps.LatLngBounds();
        
        var deltaInfo = 0;
        var colourGrad = 0;
        if (0 !== mode){
            updateAppStatus("Calculating Gradients...", true); 
            deltaInfo = calcConnectionDensityDeltaInfo(skiphome ? myAddress : '');
            if (1 === mode){
                //Stop-light colours.
                colourGrad =  new ColourGradient(deltaInfo.min, deltaInfo.max, '60ec00', 'df0600', 'ffed00');
            }
        }
        updateAppStatus("Plotting Connections...", true); 
        //map.setZoom(1);
        
        for (var address in infoWindows) {
            var userIsHere =  address.indexOf(myAddress) >=0 ;
            
            //console.log('trying: '+address);
            //Try for safety.
            try {
                //We precached them during sorting.
                var results = cachedGeocoder.getCachedAddress(address);
                if (results){
                    //console.log('adding: '+address);
                    var lightColor = (colourGrad) ? colourGrad.getHexGradient(deltaInfo.deltas[address]) :
                                    '#259CE5';
                    var darkColor =  (colourGrad) ? colourGrad.getHexGradient(deltaInfo.deltas[address], -35) :
                                    '#136991';
                    var latLng = results[0].geometry.location;
                    
                        var marker = new FocusMarker({   //new google.maps.Marker({
                            position: latLng,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: (userIsHere ? 9: 7),
                                fillColor: lightColor,
                                fillOpacity: 0.9,
                                strokeColor: darkColor, 
                                strokeWeight: (userIsHere ? 3 :2),
                                strokeOpacity: (userIsHere ? 1.0 : 0.8)
                              }
                        },
                        {
                            onFocusStrokeColor: lightColor,
                            onFocusStrokeOpacity: 1.0
                        });

                        var polyline = new FocusPolyline({
                            path: [connectionMap.linkedin.userInfo.location.coordinates, latLng],
                            geodesic: true,
                            strokeColor: darkColor,//'#136991',
                            strokeOpacity: 0.7,
                            strokeWeight: 5
                        },
                        {
                            onFocusStrokeColor: lightColor,//'#259CE5',
                            onFocusStrokeOpacity: 1.0
                        });
                        if (connectionGroups[address]){
                            connectionGroups[address].clear();
                        }
                        if (userIsHere && skiphome){
                            continue;
                        }
                        connectionGroups[address]  = new ConnectionGroup(
                                map, marker, polyline, infoWindows[address]);
                        connectionGroups[address].addToMap();
                        bounds.extend(latLng);
                } else {
                    //add to unknown set.
                }
            } catch (e){
                   console.log('Skipped "%s" : %s', address, e);
            }
        }
        map.fitBounds(bounds);
        updateAppStatus("Plotting Complete!", false);
        setRunAndApply(VALUE_BUTTON_APPLY, true);
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
                appSpinner = document.getElementById(ID_PROGESS_SPINNER);
            }
            if (showSpinner){
                appSpinner.setAttribute('style', 'display:block;');
            } else {
                appSpinner.setAttribute('style', 'display:none;');
            }
        }
        if (!appStatus){
            appStatus = document.getElementById(ID_APP_STATUS);
        }
        appStatus.innerHTML = message;
    };
    /** @return {Number} The colour mode selected, 1 for stop-light, 0 for anything else. */
    function getColourMode(){
        var select =document.getElementById(ID_COLOUR_CHOICE_CONNECT);
        var value = ''+select.options[select.selectedIndex].value;
        return value.indexOf('colour-style-stoplight') === 0 ? 1 : 0;
    }
    
    /** @return {boolean} <code>true</code> to skip home, <code>false</code> otherwise. */
    function getSkipHomeMode(){
        var skipHome =document.getElementById(ID_SKIP_HOME);
        return skipHome.checked;
    }
    
    function resetConnectionManager(){
        connectManager = new ConnectionManager();
        connectManager.addEventListener('linkedin', 'fetchcomplete', 
            function(results){
                processLinkedInConnections(results);
                if (results.values){
                    connectionMap.linkedin.numConnections =  results.values.length;
                }
        });
        connectManager.addEventListener('linkedin', 'authorizationerror', 
            function(){ //if not authorized, disconnect.
                updateAppStatus("Warning: Authorization Error");
                    setTimeout(function(){
                        connectionMap.linkedin.disconnectUser(true);
                        updateAppStatus("", false);
                        setRunAndApply(VALUE_BUTTON_RUN);
                    }, 2500);
                
        });
        connectManager.addEventListener('linkedin', 'querylimitreached', 
            function(){
                updateAppStatus("Sorry, LinkedIn Connections could be fetched due to: "
                                +"Daily Query Limit Reached. <br/>Try again later", false);
                setRunAndApply(VALUE_BUTTON_RUN, false);        
        });
        connectManager.addEventListener('linkedin', 'unknownerror', 
            function(){
                updateAppStatus("Sorry, LinkedIn Connections could be fetched due to: "
                                +"An Unknown Error. Try again later", false);
                setRunAndApply(VALUE_BUTTON_RUN, false);
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
     * @param {boolean} sessionTimeOut Default false; whether the session has timedout */
    connectionMap.linkedin.disconnectUser = function(sessionTimeOut){
        var xmlReq = new XMLHttpRequest();

        var disconnect = document.getElementById(ID_DISCONECT);
        //var orgValue = disconnect.innerHTML;
            disconnect.innerHTML = 'Disconnecting...';
        var disconnectUI = function(){
            var stub = ''+window.location.href;
            stub = stub.replace(/\?.*/i, '')+ (sessionTimeOut? '?timeout=1' : '');
            window.location.replace(stub);
            /* document.getElementById('app-controls').style.display = 'none';
            document.getElementById('linkedin-display').innerHTML = '';
            disconnect.innerHTML = orgValue;
            connectionMap.linkedin.showLoginSplash(message); */
        };
        xmlReq.open("GET", "auth.php?logout=1", true);
        xmlReq.onreadystatechange=function() {
            if (xmlReq.readyState === 4 && xmlReq.status === 200) {
               //We don't care about response text, just that it logged out.
               disconnectUI();
               connectionMap.linkedin = {};
            }
        };
        xmlReq.send();
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
        var inConnect = new LinkedInConnect('linkedin-connect-button', 'auth.php?nonce='+auth_nonce);
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
	/*
         * TODO: The API has likely changed quite a bit since I last used it. Will need to recheck.
         * Geocoding Service: This API project is not authorized to use this API.  For more information on authentication and Google Maps JavaScript API services please see: https://developers.google.com/maps/documentation/javascript/get-api-key js:51:110
You have exceeded your request quota for this API. See https://developers.google.com/maps/documentation/javascript/error-messages?utm_source=maps_js&utm_medium=degraded&utm_campaign=billing#api-key-and-billing-errors js:51:110
	 */
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
        setRunAndApply(VALUE_BUTTON_RUN, true);
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
        if (!this.userInfo.pictureUrl ){
            title = '[No picture] ' + title;
            userPic.setAttribute('src', RES_ROOT+'/img/nopicture.png');
        }

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
	    // TODO: Revist this. The controls have been changed since the 2014-2015 version
            // mapDisplay.getMap().controls[google.maps.ControlPosition.TOP_CENTER].push(controlPadding);
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
        var controls = document.getElementById(ID_INPUT_CONTROLS);
        var inputs = controls.getElementsByTagName('input');
        var selects = controls.getElementsByTagName('select');
            
        var run = document.getElementById(ID_RUN_AND_APPLY);
            run.value =  value;
            if (enabled == false){
                run.setAttribute('disabled', 'disabled');
                for(var index =0; index < inputs.length; index++ ){
                    inputs[index].setAttribute('disabled', 'disabled');
                }
                for(var index =0; index < selects.length; index++ ){
                    selects[index].setAttribute('disabled', 'disabled');
                }
            } else {
                run.removeAttribute('disabled');
                for(var index =0; index < inputs.length; index++ ){
                    inputs[index].removeAttribute('disabled');
                }
                for(var index =0; index < selects.length; index++ ){
                    selects[index].removeAttribute('disabled');
                }
            }
    };
    //Sets all click events.
    var setClickEvents = function(){
        document.getElementById(ID_DISCONECT)
                .addEventListener(
                'click', 
                function(){ connectionMap.linkedin.disconnectUser();}, 
                false);
        document.getElementById(ID_RUN_AND_APPLY)
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
                            +"Daily Geocoding Query Limit Reached. Try again later", false);
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
var myConnectionsMap = MyConnectionsMap(AUTH_NONCE);

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
    
    if (/Moz(?!.*(iP[aho]|Android|Mobile).*).*(Firefox\/\d{2,}|AppleWebKit.*Chrom)/i.test(ua)){
        //Developed and tested in desktop FF.
        return 2;
    } else if (/MSIE.*([9]|\d{2,})|Moz(?!.*(iP[aho]|Android|Mobile).*)(Firefox\/\d{2,}|AppleWebKit.*Chrom)/i.test(ua)){
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
    var loaded = function(){
        var banner = document.getElementById('app-notice-banner');
        if (!banner) return; //no loaded
            banner.innerHTML = message;
            banner.style.display = 'block';
        var close = document.createElement('a');
            close.setAttribute('href', 'javascript:void(0);')
            close.setAttribute('id', 'close-notice-banner');
            close.innerHTML = "x";
            close.addEventListener('click', function(){banner.style.display='';}, false);
        banner.appendChild(close);
    };
    loaded();
    window.addEventListener('load', loaded, false);
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
