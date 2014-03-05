<?php
require_once 'Session.php';

/**
 * Used to access the linkedin api to both connect and query.
 * Requires Session class (0.1.0).
 * 
 * @todo abstract linkedin storage to model.
 *
 * @author Jason J.  <admin@ovrhere.com>
 * @version 0.2.0-20140305
 */
class LinkedInAPI {
    
    /** @var String The api key for requests     */
    private $api_key = '';
    /** @var String The api secret for requests. This must remain secret.     */
    private $api_secret = '';
    /** @var String The scope of requests     */
    private $scope = '';
    /** @var String The redirect uri for after the request.     */
    private $redirect_uri = '';
    /** @var number The amount of time to expire the session after. */
    private $session_expiration = 0;
    /**     
     * Builds a new API connection for authorization & server requests.
     * @param String $api_key The api key for requests.
     * @param String The api secret for requests. This must remain secret.
     * @param String $scope The scope of requests.
     * @param String $auth_redirect_uri The redirect uri for after the authentication request.
     * @param number $expires The amount of time (in seconds) to have the the session expire
     * after. Currently set to 30 minutes (1800). 
     * This lesser of the this and the token time is used.
     */
    public function __construct($api_key, $api_secret, $scope, $auth_redirect_uri, $expires=1800) {
        if (empty($api_key) || empty($api_secret) || empty($scope) || empty($auth_redirect_uri)){
            $msg = empty($msg) ? 'Invalid parameter received. Cannot be empty ' : $msg;
            trigger_error( $msg . debug_print_backtrace(), E_USER_ERROR);
        }
        $this->api_key = $api_key;
        $this->api_secret = $api_secret;
        $this->scope = $scope;
        $this->redirect_uri = $auth_redirect_uri;
        $this->session_expiration = $expires;
    }
    /** Checks to see if authorized. If not, return false. 
     * @return boolean <code>true</code> for authorized, <code>false</code> otherwise.
     * @TODO remove this.
     */
    private function isAuthorized(){
        Session::checkAndResetExpiration();
        if (!Session::is_set('access_token')) {
           return false;
        }
        return true;
    }
            
    /** Performs the OAuth 2 authentication checks, calling the appropriate functions
     * to authorize. 
     * @return boolean <code>true</code> when authorized.
     */
    public function authCheck(){
        // OAuth 2 Control Flow
        if (isset($_GET['error'])) {
            // LinkedIn returned an error
            if (strcmp('access_denied',$_GET['error'])===0){
                ?><script type="text/javascript">self.close();</script> <?php
            } else{
                print $_GET['error'] . ': ' . $_GET['error_description'];
            }
            exit;
        } elseif (isset($_GET['code'])) {
            // User authorized your application
            if (Session::is_set('state') && Session::read('state') === $_GET['state'] ) {
                // Get token so you can make API calls
                Session::checkAndResetExpiration();
                $this->getAccessToken();
            } else {
                // CSRF attack? Or did you mix up your states?
                exit;
            }
        } else { 
            Session::checkAndResetExpiration();
            if (!Session::is_set('access_token')) {
                // Start authorization process
                $this->getAuthorizationCode();
            }
        }
        return true;
    }
    
    /** Prepares & executes the redirect link for Linkedin authorization. 
     * Exits script after it is called.     */
    function getAuthorizationCode() {
	$params = array(
                            'response_type' => 'code',
                            'client_id' => $this->api_key,
                            'scope' => $this->scope,
                            'state' => uniqid('', true), // unique long string
                            'redirect_uri' => $this->redirect_uri,
			);
        // Builds Authentication request.
	$url = 'https://www.linkedin.com/uas/oauth2/authorization?' . http_build_query($params);
	
	// Used to indentify the response.
	Session::write('state',  $params['state']);

	// Redirect user to authenticate.
	header("Location: $url");
	exit;
    }
    /** Gets an access token to use for this session of queries. */
    function getAccessToken() {
	$params = array(
                            'grant_type' => 'authorization_code',
                            'client_id' => $this->api_key,
                            'client_secret' => $this->api_secret,
                            'code' => $_GET['code'],
                            'redirect_uri' => $this->redirect_uri,
			  );
	// Build Access Token request.
	$url = 'https://www.linkedin.com/uas/oauth2/accessToken?' . http_build_query($params);
	
	// Tell streams to make a POST request.
	$context = stream_context_create(
					array('http' => 
						array('method' => 'POST',
	                    )
	                )
	            );

	// Retrieve access token information and store in response.
	$response = file_get_contents($url, false, $context);
	// Decode into php object.
	$token = json_decode($response);

	// Store access token and expiration time
        Session::write('access_token', $token->access_token);  // protect this! 
	$expire =   $token->expires_in < $this->session_expiration ?
                    $token->expires_in : $this->session_expiration; 
	Session::setExpiration($expire); 
	
	return true;
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    ///  End authentication above
    ////////////////////////////////////////////////////////////////////////////////
    
    /** Beware! Produces many warnings!
     * Gets a result for the linkedin api.
     * @param String $resource The linked API query string after
     * <code>https://api.linkedin.com</code>
     * @param array $args Additional (and optional) arguments to add.
     * @return JSON|boolean A JSON response requiring <code>json_decode</code>
     * or <code>false</code> on failure.
     * @throws Exception When the access token is invalid
     */
    static public function get($resource, array $args = null){
        //We suppress warnings.
        $response = self::rawFetch('GET', $resource, $args);
        return $response;
    }
    /**
     * Performs raw fetchs from the linkedin server.
     * @param String $method The HTTP method; GET, POST, PUT or DELETE
     * @param String $resource The linked API query string after
     * <code>https://api.linkedin.com</code>
     * @param array $args Additional (and optional) arguments to add.
     * @return \JSON A JSON response requiring <code>json_decode</code>
     * @throws Exception When the access token is invalid
     */
    static public function rawFetch($method, $resource, array $args = null) {
        if (!Session::is_set('access_token')){
            throw new Exception('access_token is invalid', E_NOTICE, null);
        }
	$params = array('oauth2_access_token' => Session::read('access_token'),
					'format' => 'json'
			  );
        if ($args !== null){
            $params = array_merge($params, $args);
        }
	
	// Need to use HTTPS
	$url = 'https://api.linkedin.com' . $resource . '?' . http_build_query($params);
	// Tell streams to make a (GET, POST, PUT, or DELETE) request
	$context = stream_context_create(
					array('http' => 
                                                array('method' => $method)
                                            )
                    );
        $response = file_get_contents($url, false, $context);
        return $response;
    }
}
