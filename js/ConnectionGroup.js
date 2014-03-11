/**
 * Objects that represents a group of connections.
 * That is: Marker, Polyline.
 * @param {new google.maps.Map} map The map to add markers and polylines to
 * @param {google.maps.Marker} marker The marker for this connection group.
 * @param {FocusPolyline} polyline The focusable polyline for this connection group.
 * @param {GroupInfoWindow} infoWindow The info window for the group.
 * @author Jason J.
 * @version 0.1.0-20140309
 * @type ConnectionGroup
 * @see GroupInfoWindow 0.1.1
 * @see FocusPolyline 0.1.2
 */
function ConnectionGroup(map, marker, polyline, infoWindow){
    //var m_infowindow = infowindow;
    var keepFocused = false;
    
    /** The action for when info window is X'd */
    function infoWindowClosed(){
        keepFocused = false;
        polyline.setFocus(false);
    }
    
    /** The click events for this group. */
    function clickEvent(){
        //toggle value.
        keepFocused = !keepFocused; 
        if (keepFocused){
            infoWindow.open(map);
        } else {
            infoWindow.close();
        }
    };
    
    /** The mouseover events for this group. */
    function mouseoverEvent(){
        if (keepFocused){
            return;
        }
        //infoWindow.open(map);
        polyline.setFocus(true);
    };
    
    /** The mouseout events for this group. */
    function mouseoutEvent(){
        if (keepFocused){
            return;
        }
        //infoWindow.close();
        polyline.setFocus(false);
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
    
    this.addToMap = function(Map){
        if (!Map){
            Map = map;
        }
        marker.setMap(Map);
        polyline.setMap(Map);
        infoWindow.setPosition(marker.getPosition());
    };
}


