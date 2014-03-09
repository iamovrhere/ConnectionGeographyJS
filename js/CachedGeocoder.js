/**
 * Caches requests made to the geocoder,
 * may or may not use the server for external caching in the future.
 * 
 * @returns {CachedGeocoder}
 * 
 * @author Jason J.
 * @version 0.3.0-20140309
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
            return true;
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
    };    c
    
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

