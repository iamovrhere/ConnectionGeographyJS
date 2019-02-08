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


