<?php
/** 
 * Returns the user profile JSON either from the session or from the API.
 * In the latter case, it is cached.
 * @return \JSON
 * @throws Exception When there is an issue with the getting of profile data.
 */
function getUserProfileJSON(){
    $sess_key = 'user_profile';
    if (Session::is_set($sess_key)){
        return Session::read($sess_key);
    } else {
        $user_json = LinkedInAPI::get(LINKEDIN_PROFILE_REQUEST);
        Session::write('user_profile', $user_json);
        return $user_json;
    }
}
