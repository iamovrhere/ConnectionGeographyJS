//Compatibility functions for IE/Other browsers to allow easier js programming
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  };
}
/*
 * Alternatively:
 * if (element.addEventListener) {
        element.addEventListener('event', function, false);
    } else if (element.attachEvent) {
        element.attachEvent('event',  function);
    } else {
        element['onevent'] = function;
    } 
 */
if (typeof Document.prototype.addEventListener  !== 'function' ) {
        Document.prototype.addEventListener = function(evt, func, bubble){
            evt = 'on'+evt;
            if (this.attachEvent){
                this.attachEvent(evt, func);
            } else {
                this[evt] = func;
            }
        };
}
//Safety for IE
if (typeof console.log !== 'function'){
     console.log = function(){};
}

if(!Object.create){
    Object.create=function(o){
        function F(){}
        F.prototype=o;
        return new F();
    };
};

