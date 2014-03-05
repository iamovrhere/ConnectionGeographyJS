<?php
require_once 'configure.php';

/** @version 0.1.0-20140305 */

//redirect uri supplied to linkedin for auth. 
define('REDIRECT_URI', 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['SCRIPT_NAME']);

if (isset($_GET['logout']) && $_GET['logout']){
    Session::endSession();
    echo 'logout';
    exit;
}
Session::startSession(SESSION_NAME);

$linkedin = new LinkedInAPI(API_KEY, API_SECRET, SCOPE, REDIRECT_URI);

//check for valid session.
if (!$linkedin->authCheck()){ 
    exit;
}

// Congratulations! You have a valid token. 
// Now fetch your profile and send it back to the page.
set_error_handler(array('ErrorHandling', 'errorHandlerException'), E_NOTICE | E_WARNING);
$user_json =  0;
try {
    $user_json = LinkedInAPI::get(LINKEDIN_PROFILE_REQUEST);
} catch (Exception $e){
    Session::endSession();
    //reload
    header("Location: ".REDIRECT_URI); 
    exit;
}
restore_error_handler();

$user = json_decode($user_json);
print "Hello <img src='$user->pictureUrl' title='$user->firstName $user->lastName' /> $user->firstName $user->lastName. (id: $user->id)";
        $_location = $user->location;
        $_country = $_location->country;
        print " | Location: $_location->name, $_country->code";
        print " | Capped: " .($user->numConnectionsCapped ? 'yes' : 'no');
        
echo '<br />';

?>
<script type="text/javascript">
    var response = <?php echo $user_json; ?>;
function myclose(){
    console.log('response: %s', response);
    console.log('response: %s', JSON.stringify(response));
    if (window.opener){
        window.opener   .myConnectionsMap
                        .linkedin
                        .setAndShowUser.call(window.opener.myConnectionsMap.linkedin, response);
    }
    //window.opener.myConnectionsMap.linkedin.reconnect();
    //window.opener.testcomplete();
    self.close();
}
myclose();
</script>
<?php
exit;
