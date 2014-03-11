<?php
require_once 'configure.php';
require_once 'getprofile_func.php';
Session::startSession(SESSION_NAME);
/** Either false or JSON. Suppressing warnings. */
set_error_handler(array('ErrorHandling', 'errorHandlerException'), E_NOTICE | E_WARNING);
$user_json = false;
try{
    $user_json = getUserProfileJSON();
} catch (Exception $e){
}
restore_error_handler();

?>
<!DOCTYPE html>
<html>
  <head>
      
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <title>Connections Map</title>
    
    <!-- Linkedin button style. -->
    <link rel="stylesheet" href="css/linkedin_button.css" />
    <!-- The layout of the app. -->
    <link rel="stylesheet"  href="css/app_layout.css" />
    <link rel="stylesheet"  href="css/linkedin_card_layout.css" />
    <link rel="stylesheet"  href="css/group_info_window.css" />
    
    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAKEjJoevEsGcoXUiguLQGxuGDm1vY_fg0&sensor=false">
    </script>
    
    <script src="js/FocusPolyline.js" type="text/javascript"></script>
    <script src="js/GroupInfoWindow.js" type="text/javascript"></script>
    <script src="js/ConnectionGroup.js" type="text/javascript"></script>
    <script src="js/ConnectionManager.js" type="text/javascript"></script>
    <script src="js/CachedGeocoder.js" type="text/javascript"></script>
    <script src="js/MapDisplay.js" type="text/javascript"></script>
    <script src="js/LinkedInConnect.js" type="text/javascript"></script>
    <script src="js/compat.js" type="text/javascript"></script>
    <script id="application-js-start" type="text/javascript" src="js/main.js" ></script>

    
    
  </head>
  <body >
    <div id="app-notice-banner" >Warning yo!</div>
    <div id="app-container">
        <div id="map-canvas" ></div>
        <div id ="app-controls" style="display: none;">
            <div id="app-controls-background" ></div>
            <div id="linkedin-display"  style="display: none;"></div>            
                <script type="text/javascript">
                google.maps.event.addDomListener(window, 'load', function(){ 
                    <?php 
                    if ($user_json){
                        echo 'myConnectionsMap.linkedin.setAndShowUser('.$user_json.');';
                    } else {
                        ?>  
                            myConnectionsMap.linkedin.showLoginSplash();
                        <?php
                    }
                    ?>
                  });
                  </script>
            <div id="right-panel">
              <div id="disconnect-wrapper">
                  <a href="javascript:void(0)" id="disconnect-app-action" 
                     title="Disconnect from App">Disconnect [x]</a>
              </div>
              <div id="input-controls">
                  <form >
                  <span id="colour-by-connections-wrapper" >
                      <span class="colour-choice" 
                            title="Shows denser connections as red, sparser connections as blue">
                          <input type="radio" name="colour-connections-choice" 
                                 id="connections-by-hotcold" /> 
                        <label for="connections-by-hotcold">Density by colour</label>
                      </span>
                      <span class="colour-choice" 
                            title="Shows all connections as blue">
                          <input type="radio" name="colour-connections-choice" 
                                 id="connections-style-none" 
                                 checked="checked" /> 
                        <label for="connections-style-blue">All blue</label>
                      </span>
                  </span>
                <input type="button" id="perform-action" value="Run" />
                </form>
              </div>
            </div>
            <div id="app-status" ></div>
         </div>
        <img id="app-progress-spinner" src="img/progress_spinner.gif" />
      </div>
        

  </body>
</html>