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
    
    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAKEjJoevEsGcoXUiguLQGxuGDm1vY_fg0&sensor=false">
    </script>
    
    <script src="js/MapDisplay.js" type="text/javascript"></script>
    <script src="js/LinkedInConnect.js" type="text/javascript"></script>
    <script id="application-js-start" type="text/javascript" src="js/main.js" ></script>

    
    
  </head>
  <body >
      <div id="app-container">
        <div id="map-canvas" ></div>
        <div id="connect-splash" class="centered-item-outer" >
            <div id="connect-splash-background" ></div>
            <div id="connect-splash-inner" class="centered-item-middle" style="display: none;"></div>            
        </div>
        <div id ="app-controls" style="display: none;">
            <div id="app-controls-background" ></div>
            <div id="linkedin-display"  style="display: none;"></div>            
                <script type="text/javascript">
              <?php 
              if ($user_json){
                  echo 'myConnectionsMap.linkedin.setAndShowUser('.$user_json.');';
              } else {
                  ?>  
                      myConnectionsMap.linkedin.showLoginSplash();
                  <?php
              }
              ?>
                  </script>
         </div>
      </div>

  </body>
</html>