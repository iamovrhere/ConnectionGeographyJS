<?php
require_once 'configure.php';
Session::startSession(SESSION_NAME);
/** Either false or JSON. Suppressing warnings. */
set_error_handler(array('ErrorHandling', 'errorHandlerException'), E_NOTICE | E_WARNING);
$user_json = false;
try{
    $user_json = LinkedInAPI::get(LINKEDIN_PROFILE_REQUEST);
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
    <title>Linkedin Connection Map</title>
    <style type="text/css">
      html { height: 100% }
      body { height: 100%; margin: 0; padding: 0 }
      #map-canvas { height: 100% }
    </style>
    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAKEjJoevEsGcoXUiguLQGxuGDm1vY_fg0&sensor=false">
    </script>
    
    <script src="js/MapDisplay.js" type="text/javascript"></script>
    <script src="js/LinkedInConnect.js" type="text/javascript"></script>
    <script id="application-js-start" type="text/javascript" src="js/main.js" ></script>

    <!-- Linkedin button style. -->
    <style type="text/css">* html #li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link{height:1% !important;}#li_ui_li_gen_1393966178953_0{position:relative !important;overflow:visible !important;display:block !important;}#li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link{border:0 !important;height:20px !important;text-decoration:none !important;padding:0 !important;margin:0 !important;display:inline-block !important;}#li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link:link, #li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link:visited, #li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link:hover, #li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link:active{border:0 !important;text-decoration:none !important;}#li_ui_li_gen_1393966178953_0 a#li_ui_li_gen_1393966178953_0-link:after{content:"." !important;display:block !important;clear:both !important;visibility:hidden !important;line-height:0 !important;height:0 !important;}#li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-logo{background:url(http://s.c.lnkd.licdn.com/scds/common/u/img/sprite/sprite_connect_v13.png) 0px -276px no-repeat !important;cursor:pointer !important;border:0 !important;text-indent:-9999em !important;overflow:hidden !important;padding:0 !important;margin:0 !important;position:absolute !important;left:0px !important;top:0px !important;display:block !important;width:20px !important;height:20px !important;float:right !important;}#li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-logo{background-position:-20px -276px !important;}#li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-logo, #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-logo{background-position:-40px -276px !important;}.IN-shadowed #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-logo{}#li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title{color:#333 !important;cursor:pointer !important;display:block !important;white-space:nowrap !important;float:left !important;margin-left:1px !important;vertical-align:top !important;overflow:hidden !important;text-align:center !important;height:18px !important;padding:0 4px 0 23px !important;border:1px solid #000 !important;border-top-color:#E2E2E2 !important;border-right-color:#BFBFBF !important;border-bottom-color:#B9B9B9 !important;border-left-color:#E2E2E2 !important;border-left:0 !important;text-shadow:#FFFFFF -1px 1px 0 !important;line-height:20px !important;border-radius:0 !important;-moz-border-radius:0 !important;border-top-right-radius:2px !important;border-bottom-right-radius:2px !important;-moz-border-radius-topright:2px !important;-moz-border-radius-bottomright:2px !important;background-color:#ECECEC !important;background-image:-moz-linear-gradient(top, #FEFEFE 0%, #ECECEC 100%) !important;}#li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title{border:1px solid #000 !important;border-top-color:#ABABAB !important;border-right-color:#9A9A9A !important;border-bottom-color:#787878 !important;border-left-color:#04568B !important;border-left:0 !important;background-color:#EDEDED !important;background-image:-moz-linear-gradient(top, #EDEDED 0%, #DEDEDE 100%) !important;}#li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title, #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title{color:#666 !important;border:1px solid #000 !important;border-top-color:#B6B6B6 !important;border-right-color:#B3B3B3 !important;border-bottom-color:#9D9D9D !important;border-left-color:#49627B !important;border-left:0 !important;background-color:#DEDEDE !important;background-image:-moz-linear-gradient(top, #E3E3E3 0%, #EDEDED 100%) !important;}.IN-shadowed #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title{}.IN-shadowed #li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title{}.IN-shadowed #li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title, .IN-shadowed #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title{}#li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title-text, #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title-text *{color:#333 !important;font-size:11px !important;font-family:Arial, sans-serif !important;font-weight:bold !important;font-style:normal !important;display:inline-block !important;background:transparent none !important;vertical-align:top !important;height:18px !important;line-height:20px !important;float:none !important;}#li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title-text strong{font-weight:bold !important;}#li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title-text em{font-style:italic !important;}#li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title-text, #li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title-text *{color:#000 !important;}#li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title-text, #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title-text, #li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title-text *, #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title-text *{color:#666 !important;}#li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title #li_ui_li_gen_1393966178953_0-mark{display:inline-block !important;width:0px !important;overflow:hidden !important;}.success #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title{color:#333 !important;border-top-color:#E2E2E2 !important;border-right-color:#BFBFBF !important;border-bottom-color:#B9B9B9 !important;border-left-color:#E2E2E2 !important;background-color:#ECECEC !important;background-image:-moz-linear-gradient(top, #FEFEFE 0%, #ECECEC 100%) !important;}.success #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title-text, .success #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title-text *{color:#333 !important;}.IN-shadowed .success #li_ui_li_gen_1393966178953_0 #li_ui_li_gen_1393966178953_0-title{}.success #li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title{color:#000 !important;border-top-color:#ABABAB !important;border-right-color:#9A9A9A !important;border-bottom-color:#787878 !important;border-left-color:#04568B !important;background-color:#EDEDED !important;background-image:-moz-linear-gradient(top, #EDEDED 0%, #DEDEDE 100%) !important;}.success #li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title-text, .success #li_ui_li_gen_1393966178953_0.hovered #li_ui_li_gen_1393966178953_0-title-text *{color:#000 !important;}.success #li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title, .success #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title{color:#666 !important;border-top-color:#B6B6B6 !important;border-right-color:#B3B3B3 !important;border-bottom-color:#9D9D9D !important;border-left-color:#49627B !important;background-color:#DEDEDE !important;background-image:-moz-linear-gradient(top, #E3E3E3 0%, #EDEDED 100%) !important;}.success #li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title-text, .success #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title-text, .success #li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title-text *, .success #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title-text *{color:#666 !important;}.IN-shadowed .success #li_ui_li_gen_1393966178953_0.clicked #li_ui_li_gen_1393966178953_0-title, .IN-shadowed .success #li_ui_li_gen_1393966178953_0.down #li_ui_li_gen_1393966178953_0-title{}</style>
  </head>
  <body >
      <div id="map-canvas" ></div>
      <div id ="app-controls" >
            <div id="linkedin-display">
               <script type="text/javascript">
            <?php 
            if ($user_json){
                echo 'myConnectionsMap.linkedin.setUser('.$user_json.');'
                  . 'myConnectionsMap.linkedin.showUser();';
            } else {
                ?>
                var inConnect = new LinkedInConnect('auth.php');
                document.getElementById('linkedin-display').appendChild(inConnect.getButton());
                <?php
            }
            ?>
                </script>
            </div>
       </div>

  </body>
</html>