<?php
require_once 'configure.php';
Session::startSession(SESSION_NAME);

//My auth nonce.
$auth_nonce = md5(uniqid('', true).'saltis:25262'. time());
Session::write('my_auth_nonce', $auth_nonce); // unique long string

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
      <!-- 
          Title: "My Connections Map"
          Version: 0.1.2a-20140314
          By: Jason J.
      -->
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <title>My Connections Map (Alpha)</title>
    
    <!-- Linkedin button style. -->
    <link rel="stylesheet" href="<?php echo RES_ROOT; ?>/css/linkedin_button.css" />
    <!-- The layout of the app. -->
    <link rel="stylesheet"  href="<?php echo RES_ROOT; ?>/css/app_layout.css" />
    <link rel="stylesheet"  href="<?php echo RES_ROOT; ?>/css/linkedin_card_layout.css" />
    <link rel="stylesheet"  href="<?php echo RES_ROOT; ?>/css/group_info_window.css" />
    
    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAKEjJoevEsGcoXUiguLQGxuGDm1vY_fg0&sensor=false">
    </script>

    <script type="text/javascript"> 
        var AUTH_NONCE = '<?php echo $auth_nonce; ?>' ;
        var RES_ROOT = '<?php echo RES_ROOT; ?>';
    </script>
    
    <script src="<?php echo RES_ROOT; ?>js/FocusMarker.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>js/FocusPolyline.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/GroupInfoWindow.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/ConnectionGroup.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/ConnectionManager.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/CachedGeocoder.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/MapDisplay.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/LinkedInConnect.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/ColourGradient.js" type="text/javascript"></script>
    <script src="<?php echo RES_ROOT; ?>/js/compat.js" type="text/javascript"></script>
    <script id="application-js-start" type="text/javascript" src="<?php echo RES_ROOT; ?>/js/main.js" ></script>

  </head>
  <body >
      <div id="app-notice-banner" ></div>
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
                        echo 'myConnectionsMap.linkedin.showLoginSplash('.
                               (isset($_GET['timeout']) ? '"Session Timed-out"' : '').
                             ')'; 
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
                    <span id="skip-home-checkbox-wrapper">
                        <input id="skip-home-checkbox" name="skip-home-checkbox" 
                               type="checkbox"  />
                        <label for="skip-home-checkbox">Skip Home</label>
                    </span>
                    <select id="colour-by-connections" >
                        <option value="colour-style-none" 
                              title="Shows all connections as blue"
                              >All blue</option>
                        <option value="colour-style-stoplight" selected="selected"
                              title="Shows denser connections as red, sparser connections as green"
                              >*Density (Stop-Light)</option>
                    </select>
                <input type="button" id="perform-action" value="Run" />
                </form>
              </div>
            </div>
            <div id="app-status" ></div>
         </div>
        <img id="app-progress-spinner" src="<?php echo RES_ROOT; ?>/img/progress_spinner.gif" />
      </div>
        

  </body>
</html>