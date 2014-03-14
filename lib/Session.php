<?php 
/**
 * A session class used for configuring sessions.
 * Reusable, should be placed a library for reuse!
 * 
 * @author Jason J. <admin@ovrhere.com>
 * @version 0.1.3-20140314
 */
class Session {   
    /** @var String The current session name.     */
    private static $_sess = 'app';	

    /** Static methods and contents only.     */
    final private function __construct() {}

    /** Do not allow cloning.     */
    private function __clone() {}

    /** Start the session and make the session container
     * @param String $session_name (Optional) The session name to give to prevent server 
     * collisions.     */
    public static function startSession($session_name = '') {	
        //Added to prevent potential session classes.
        session_name(session_name().$session_name);
        session_start();	
        if (!isset($_SESSION[self::$_sess])) {
            $_SESSION[self::$_sess] = array();
        } else {
            // get a new session id everytime a request is made		
            session_regenerate_id();
        }
        self::_resetExpiration();
    }

    /** Retrieves the container name     */
    public static function getSessionContainer(){
        return self::$_sess;
    }

    /** End session. Used when logging out the user. 
     * @param String $session_name (Optional) The session name to give to prevent server 
     * collisions.     */     
    public static function endSession($session_name = '') {
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name().$session_name, '', time() - 42000,
                            $params["path"], $params["domain"],
                            $params["secure"], $params["httponly"] );
        }
        if (isset($_SESSION)){
            $_SESSION[self::$_sess] = array();
            session_destroy();
        } 
    }
    /** Sets the expiration time for inactivity. If set to null it is removed.
     *  @param number|boolean $time The time in seconds to expire the session in.
     */
    public static function setExpiration($time){
        if ($time === null || $time === false){
            self::clear('session_expires_in');
        }
        self::write('session_expires_in', $time);    // relative time (in seconds)
        self::_resetExpiration();
    }
    
    
    /** Checks the expiration value and expires the session if it has passed. 
     * Otherwise it resets the count. If unset nothing is done.
     * @return boolean <code>true</code> if the session has expired, 
     * <code>false</code> if it has not.
     */
    public static function checkAndResetExpiration(){
        if (!isset($_SESSION[self::$_sess]['session_expires_at'])){
            return false; //we do nothing if unset.
        }
        $time =  $_SESSION[self::$_sess]['session_expires_at'];
        if (time() >= $time){
            self::endSession();
            return true;
        }
        self::_resetExpiration();
        return false;
    }
    

        /** Changes the session's container name. 
     * Useful for compartmentalizing session variables 
     * @param string $sess_name The session name
     */
    public static function changeSessionContainer($sess_name){
        if (!empty($sess_name)) {
            self::$_sess = $sess_name;
        }
    }

    /**
     * Store the variable in the session
     * @param string $name The key to store the value under.
     * @param mixed $value The value to store.
     */
    public static function write($name, $value) {
        self::ensureParameterNotEmpty($name);
        $_SESSION[self::$_sess][$name] = $value;
    }

    /**Check to seee if variable isset.
     * @param unknown_type $name The key to read.
     * @return boolean true or false.
     */
    public static function is_set($name) {
        self::ensureParameterNotEmpty($name);
        return isset($_SESSION[self::$_sess][$name]);
    }
    
    /** Retrieve the variable from the session
     * @param unknown_type $name The key to read.
     * @return mixed The content of the session or null 
     */
    public static function read($name) {
        self::ensureParameterNotEmpty($name);
        return isset($_SESSION[self::$_sess][$name]) ?
               $_SESSION[self::$_sess][$name] : null;
    }

    /**
     * Clear the variable from session management
     * @param unknown_type $name The key to clear
     */
    public static function clear($name){
        unset($_SESSION[self::$_sess][$name]);        
    }

    /**
     * Place multiple variables under session management
     * @param array $vars Associative array to add.
     */
    public static function multiWrite(array $vars){
        if (empty($vars)) {
            trigger_error('SessionManager::multiWrite() Invalid variable', E_USER_ERROR);
            exit;
        } else {
            foreach ($vars as $k=>$v) {
                $_SESSION[self::$_sess][$k] = $v;
            }
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    /// Utility functions - may be abstracted out to own classes
    ////////////////////////////////////////////////////////////////////////////////
    
    /** Resets the expiration according to the current time. */
    private static function _resetExpiration(){
        if (!isset($_SESSION[self::$_sess]['session_expires_in'])){
            return; //we do nothing if unset.
        }
         // absolute time
        self::write('session_expires_at', time() + $_SESSION[self::$_sess]['session_expires_in']); 
    }
    
    
   /**
    * Checks to ensure a parameter passed to a method is non-empty. If it
    * is empty, trigger an error, otherwise do nothing
    * 
    * This method should be used by the programmer to ensure a parameter to a method
    * he/she creates is non-empty. This method aborts the application and does not produce
    * user-friendly errors, so it should not be used for form validation
    */
   final private static function ensureParameterNotEmpty($param, $msg=''){
        if (empty($param)) {
            $msg = empty($msg) ? 'Invalid parameter received. Cannot be empty ' : $msg;
            trigger_error( $msg . debug_print_backtrace(), E_USER_ERROR);
        }
   }
}