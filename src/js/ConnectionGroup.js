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
ConnectionGroup.openGroups = {}; 