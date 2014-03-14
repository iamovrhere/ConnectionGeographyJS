<?php
require_once 'configure.php';
require_once 'getprofile_func.php';

/** @version 0.2.3-20140314 */
//Super try: try the entiiire script, in case something goes wrong.
try {

if ((isset($_GET['logout']) && $_GET['logout']) ||
     (isset($_POST['logout']) && $_POST['logout']) ){
    Session::endSession(SESSION_NAME);
    echo 'logout';
    exit;
}
if (!isset($_GET['nonce'])){
    header('HTTP/1.1 401 Unauthorized', true, 401);
    echo 'Invalid nonce';
    exit;
} 

Session::startSession(SESSION_NAME);
$nonce = Session::read ('my_auth_nonce');    
//redirect uri supplied to linkedin for auth. 
define('REDIRECT_URI', 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['SCRIPT_NAME'].'?nonce='.$nonce);


$linkedin = new LinkedInAPI(API_KEY, API_SECRET, SCOPE, REDIRECT_URI);

//check for valid session.
if (!$linkedin->authCheck($_GET['nonce'], $nonce)){
    ?>
<script type="text/javascript">
    window.opener.location.replace(window.opener.location.href);
    self.close();
</script>
    <?php
    exit;
}

// Congratulations! You have a valid token. 
// Now fetch your profile and send it back to the page.
set_error_handler(array('ErrorHandling', 'errorHandlerException'), E_NOTICE | E_WARNING);
$user_json =  0;
try {
    $user_json = getUserProfileJSON();
} catch (Exception $e){
    Session::endSession(SESSION_NAME);
    //reload
    header("Location: ".REDIRECT_URI); 
    exit;
} 
restore_error_handler();



/* $user = json_decode($user_json);
print "Hello <img src='$user->pictureUrl' title='$user->firstName $user->lastName' /> $user->firstName $user->lastName. (id: $user->id)";
        $_location = $user->location;
        $_country = $_location->country;
        print " | Location: $_location->name, $_country->code";
        print " | Capped: " .($user->numConnectionsCapped ? 'yes' : 'no');
        
echo '<br />'; */

?>
<script type="text/javascript">
    var response = <?php echo $user_json; ?>;
function myclose(){
    //console.log('response: %s', response);
    //console.log('response: %s', JSON.stringify(response));
    if (window.opener){
        window.opener   .myConnectionsMap
                        .linkedin
                        .setAndShowUser.call(window.opener.myConnectionsMap.linkedin, response);
    }
    self.close();
}
myclose();
</script>
<?php
exit;


} catch (Exception $ex) {
    echo "Ooops! Something rather unexpecte went wrong.";
}