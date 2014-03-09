<?php
require_once 'configure.php';
/** 
 * REQUESTS: 
 *  + auto_page - loads successive pages if paganated.
 *  + start - loads request starting at this element.
 * 
 * Returns:
 * 200 - ok
 * 401 - auth error
 * 403 - throttle error
 * 404 - other error
 * 
 * See doc for details:
 * https://developer.linkedin.com/documents/connections-api
 * http://developer.linkedin.com/documents/profile-fields
 * 
 * @version 0.2.0-20140307
 */

set_error_handler(array('ErrorHandling', 'errorHandlerException'), E_NOTICE | E_WARNING);
Session::startSession(SESSION_NAME);

$request = '/v1/people/~/connections:(firstName,lastName,pictureUrl,numConnections,numConnectionsCapped,location:(name,country:(code)))';
//$request = '/v1/people/~/connections:(firstName,lastName)';
//$t0 = microtime(true);
$args = array('count' => '10');
//$args = array();
if(isset($_GET['start'])||isset($_POST['start'])){
    $args['start'] = isset($_POST['start']) ? $_POST['start'] : $_GET['start'];
}

//So we can do error checking easily.
function linkedinRequest($request, array $args=null){
    try {
        ErrorHandling::$debug = false;
        return LinkedInAPI::get($request, $args);
    } catch (Exception $e){
        $msg = $e->getMessage();
        //either if unauthroized or bad access token.
        if (preg_match('/(401 Unauthorized)|(access.token)/', $msg)){
            header('HTTP/1.1 401 Unauthorized', true, 401);
        } elseif (preg_match('/403/', $msg)){
            header('HTTP/1.1 403 Throttle limit for calls to this resource is reached', true, 403);
        } else {
            header('HTTP/1.1 404 Error of some kind: '.$msg, true, 404);
            echo $msg;
        }
        exit;
    }
}
$connections_json = linkedinRequest($request, $args);

if(!(isset($_REQUEST['auto_page']) && $_REQUEST['auto_page'])){
    print $connections_json; //return them
    exit;
} else {
    $connections = json_decode($connections_json);

    ////If we have all the connections.
    $record_count = count($connections->values);
    $total = $connections->_total ;
    if ($total <= $record_count){
        print $connections_json; //return them
        exit;
    } else {
        //Otherwise, we have work to do.
        while ($total > $record_count){
            //sleep 3 seconds to prevent spamming
            sleep(1);
            $args = array('start' => $record_count);
            $page_json = linkedinRequest($request, $args);
            $page = json_decode($page_json);
            $connections->values = array_merge($connections->values,  $page->values);
            $record_count = count($connections->values);        

        }
        print $connections_json;
        //print json_encode($connections); //return them
        //echo '<br/><br/>took: '. (microtime(true)-$t0).'mcs<br/>';
        exit;    
    }
}
exit;

restore_error_handler();
