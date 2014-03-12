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
