/**
 * Caches requests made to the geocoder,
 * may or may not use the server for external caching.
 * 
 * @returns {CachedGeocoder}
 * 
 * @author Jason J.
 * @version 0.1.0-20140306
 * @see google.maps.Geocoder
 */
function CachedGeocoder(){
    /** @type google.maps.Geocoder */
    var  geocoder = new google.maps.Geocoder();
    
    /** @type Object Contains a list of cached values indexed by addresses */
    var cachedValues = {};
    /** @type boolean whether or not bulk geocoding has started. */
    var bulkGeocodingStarted = false;
    
    
    ////////////////////////////////////////////////////////////////////////////
    //// Private functions
    ////////////////////////////////////////////////////////////////////////////
    
    var _geocodeAddress = function(request, callback){
        if (!request.address){ 
            throw new Error('Expects an address'); 
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
    
    var bulkGeocoder = function(){
        //The queue of address to be yet request.
        var inputQueue = new Array();
        //interval between requests
        var currentInterval = 250;
        
        var callback = function(results, status){
            
        };
        /** @TODO fix and complete */
        var bulkGeocoding = function(){
            var in_address = inputQueue.pop();
            waitingQueue.push(in_address);
            var request = { address: in_address};
            _geocodeAddress(request, 
                            function(results, status){ 
                                if (google.maps.GeocoderStatus.OVER_QUERY_LIMIT === status ||
                                    google.maps.GeocoderStatus.REQUEST_DENIED === status){
                                    currentInterval+= 50;
                                } else {
                                    var results
                                    for(var index = 0; index < waitingQueue.length; index++){
                                        waitingQueue
                                    }
                                }
                                callback(results, status);
                            }
                        );
            
            setTimeout(bulkGeocoding ,currentInterval);
        };
        this.start = function(){
            bulkGeocoding();
        };
        this.addToQueue = function(address){
            inputQueue.push(address);
        };
    };
       
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
    
    this.startBulkGeocoding = function(onUpdate){
        if (!bulkGeocodingStarted){
            bulkGeocoder.start();
        }
        return bulkGeocoder;
    };
    this.geocodeAddressList = function(addresses, onUpdate, onComplete){
        for(var index = 0, SIZE = addresses.length; index < SIZE; index++){
            
        }
    };
    
};

