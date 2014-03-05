
/**
 * Builds the linkedin connect button for php authentication.
 * @param {string} popupHref The popup location
 * @returns {LinkedInConnect}
 * 
 * @author Jason J.
 * @version 0.1.0-20140304
 */
function LinkedInConnect(popupHref) {
    var id = 'linkedin-connect-button';
    /** @type Element */
    var linkedinButton = document.createElement('span');
        linkedinButton.setAttribute('id', id);
        linkedinButton.setAttribute('class', "IN-widget");
        linkedinButton.setAttribute('style', "line-height: 1; vertical-align: baseline; display: inline-block;");
        linkedinButton.innerHTML = '<span style="padding: 0px ! important; margin: 0px ! important; text-indent: 0px ! important; display: inline-block ! important; vertical-align: baseline ! important; font-size: 1px ! important;"><span id="li_ui_li_gen_1393966178953_0"><a id="li_ui_li_gen_1393966178953_0-link" href="javascript:void(0);"><span id="li_ui_li_gen_1393966178953_0-logo">in</span><span id="li_ui_li_gen_1393966178953_0-title"><span id="li_ui_li_gen_1393966178953_0-mark"></span><span id="li_ui_li_gen_1393966178953_0-title-text">Sign in with LinkedIn</span></span></a></span></span>';
    
    var hover = function(){
        var linkedinButton = document.getElementById('li_ui_li_gen_1393966178953_0');
        linkedinButton.setAttribute('class', "IN-widget hovered"); 
    };
    var down = function(){
        var linkedinButton = document.getElementById('li_ui_li_gen_1393966178953_0');
        linkedinButton.setAttribute('class', "IN-widget down"); 
    };
    var normal = function(){  
        var linkedinButton = document.getElementById('li_ui_li_gen_1393966178953_0');
        linkedinButton.setAttribute('class', "IN-widget"); 
    } ;
    
    
    var width = 450;
    var height =650;
    var left = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        left = (screen.width/2)-(width/2) + left;
    var top = window.screenTop !== undefined ? window.screenTop : screen.top;
        top = (screen.height/2)-(height/2)  + top ;
    this.popupWindow = function(){
        console.log(left+" "+ top);
        window.open(popupHref, "Connect with Linkedin", "toolbar=no,menubar=no,scrollbars=yes,width="+width+",height="+height+",top="+top+",left="+left);
    };
    
    if (linkedinButton.addEventListener) {
        linkedinButton.addEventListener('mouseover', hover, false);
        linkedinButton.addEventListener('mousedown', down, false);
        linkedinButton.addEventListener('mouseup', normal, false);
        linkedinButton.addEventListener('mouseout', normal, false);
        linkedinButton.addEventListener('click', this.popupWindow, false);
    } else if (linkedinButton.attachEvent) {
        linkedinButton.attachEvent('onmouseover',  hover);
        linkedinButton.attachEvent('onmousedown',  down);
        linkedinButton.attachEvent('onmouseup',  normal);
        linkedinButton.attachEvent('onmouseout',  normal);
        linkedinButton.attachEvent('onclick',  this.popupWindow);
    } else {
        linkedinButton['onmouseover'] = hover;
        linkedinButton['onmousedown'] = normal;
        linkedinButton['onmouseup'] = normal;
        linkedinButton['onmouseout'] = normal;
        linkedinButton['onclick'] = this.popupWindow;
    }    
    
  
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    this.getButton = function(){
        return linkedinButton;
    };
   
};


