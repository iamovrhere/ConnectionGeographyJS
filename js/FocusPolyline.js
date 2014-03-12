/* Reference material: 
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
