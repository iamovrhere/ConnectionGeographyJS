<?php
/**
 * Performs basic error handling once set.
 * Static calls only.
 *
 * @author Jason J. <admin@ovrhere.com>
 * @version 0.1.0-20140305
 */
class ErrorHandling {
    /** Whether or not debugging is on. */
    static $debug = false;
    
    /* * Sets the error handler to the custom handler.
     * See Documentation on <code>set_error_handler</code>. 
     *      */
   /*  public static function setHandler(){
        set_error_handler(array('ErrorHandling', 'errorHandler'));
    } */
    
    /* * Resets error handling to php interal.
     * See Documentation on <code>set_error_handler</code>. */
    /* public static function resetHandler(){
        restore_error_handler();
    } */
    
    /**
     * Throws exceptions instead of warnings; easier handling. 
     * Be sure to check $errno and $errstring
     * To be used <code>by set_error_handler</code>.
     * See: http://in3.php.net/en/set_error_handler
     * @param type $errno
     * @param type $errstr
     * @param type $errfile
     * @param type $errline
     * @return boolean
     */
    public static function errorHandlerException($errno, $errstr, $errfile, $errline){
        if (!(error_reporting() & $errno)) {
            // This error code is not included in error_reporting
            return null;
        }

        switch ($errno) {
        case E_USER_WARNING:
            if (self::$debug){
                echo "<b>My WARNING</b> [$errno] $errstr<br />\n";
            }
            throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
            //return true; 

        
        default:
            if (self::$debug){
                echo "Unknown error type: [$errno] $errstr<br />\n";
            }
            throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
            //return null; //use internal handler.
        }

        /* Don't execute PHP internal error handler */
        return true;
    }
    
}


