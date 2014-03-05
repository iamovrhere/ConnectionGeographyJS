/**
 * Creates the map display, adds, removes and highlights elements.
 * Typically will be a Google Map.
 * @author Jason J.
 * @version 0.1.0-20140228
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
        return "map";
    };
    //Loads the map.
    this.init = function () {
    var mapOptions = {
      //centered around a point in the middle of the atlantic.
      center: new google.maps.LatLng(34.4, -22.15),
      zoom: 3
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    };  
    
    //Loads the application when the window loads.
    google.maps.event.addDomListener(window, 'load', this.init);    
}


