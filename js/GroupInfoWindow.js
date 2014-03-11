/**
 * Extends google.maps.InfoWindow 
 * Creates a paginated info window built to handle linkedin records.
 * Once the records appended are larged than the page size (3) it creates a new page
 * and paginates records.
 * <br/>
 * Requires the css group_info_window.css to look reasonable.
 * @param {google.maps.InfoWindowOptions} infoWindowOptions The info window options
 * using the form of google.maps.InfoWindowOptions
 * @param {String} locationName (Optional) The location name to display as the area.
 * @author Jason J.
 * @version 0.1.0-201403010
 * @type GroupInfoWindow
 * @see google.maps.InfoWindow 
 * @see group_info_window.css
 */
function GroupInfoWindow(infoWindowOptions, locationName){
    google.maps.InfoWindow.call(this.parent, infoWindowOptions);
    
    /** @type Array The pages for the info window. */
    var infoWindowPages = new Array();
    /** @type Number The current page being viewed. */
    var currentPageIndex = 0;
    /** @type Boolean if the info window is currently open. */
    var infoOpen = false;
    
    //Constant max size of pages.
    var MAX_PAGE_SIZE = 3;
    /** @type Number The page size of the last page. */
    var currentPageSize = 0;
    
    /** @type Number The total number of (1st) connections at this city. */
    var firstConnectionsTotal = 0;
    /** @type Number The total number of 2nd connections at this city. */
    var secondConnectionTotal = 0;
    /** @type Whether one or more of the connections has a capped connections. */
    var connectionsPlus = false;
    
    /** @type String|Number The location of this city. */
    var locationName = locationName;
    
    var infoBody = document.createElement('div');
        infoBody.setAttribute('class', 'group-info-window');
     
    var header = document.createElement('div');
        header.setAttribute('class', 'info-header');
    
    /** @TODO create and reset header. */
    
    var nextLink = document.createElement('a');
        nextLink.innerHTML+= 'Next &gt;&gt;';
        nextLink.setAttribute('href', 'javascript:void(0);');
        nextLink.setAttribute('class', 'next-page');
        nextLink.addEventListener('click', nextPage, false);
    var prevLink = document.createElement('a');
        prevLink.innerHTML+= '&lt;&lt; Prev';
        prevLink.setAttribute('href', 'javascript:void(0);');
        prevLink.setAttribute('class', 'prev-page');
        prevLink.addEventListener('click', prevPage, false);
    var pageCount = document.createElement('span');
        pageCount.setAttribute('class', 'page-count');
        pageCount.innerHTML = '1/1';
        
    var footer = document.createElement('div');
        footer.setAttribute('class', 'info-footer');
        footer.appendChild(prevLink);
        footer.appendChild(nextLink);
        footer.appendChild(pageCount);
        
    var pageContainer = document.createElement('div');
        pageContainer.setAttribute('class', 'page-container');
    
    
    infoBody.appendChild(header);
    infoBody.appendChild(pageContainer);
    infoBody.appendChild(footer);
    
    //Reset content.
    this.parent.setContent.call(this,infoBody);
    
    ////////////////////////////////////////////////////////////////////////////
    //// private functions
    ////////////////////////////////////////////////////////////////////////////
   
    
    /** Set the current page of the info window. 
     * @param {Number} index The page number to set it to. */
    var setPage = function(index){
        if (index < 0  || index > infoWindowPages.length) return;
        console.log('setPage:'+ index);
        if (0 === index){  //disable prev.
            prevLink.setAttribute('style', 'visibility: hidden');
        } else if (index > 0 ){ //enable
            prevLink.setAttribute('style', '');
        }  
        if (index === infoWindowPages.length -1){//disable next
            nextLink.setAttribute('style', 'visibility: hidden');
        } else if (index < infoWindowPages.length ){ //enable
            nextLink.setAttribute('style', '');
        }
        //if we change pages.
        if (index !== currentPageIndex || pageContainer.childNodes.length === 0){
            //remove all children.
            while (pageContainer.childNodes.length > 0){
                pageContainer.removeChild(pageContainer.childNodes[0]);
            }
            pageContainer.appendChild(infoWindowPages[index]);
            pageCount.innerHTML = (index+1)+'/'+(infoWindowPages.length);
            currentPageIndex = index;
        }
    };
    
    function nextPage(){
        if (currentPageIndex + 1 < infoWindowPages.length){
            setPage(currentPageIndex+1);
        }
    };
    
    function prevPage(){
        if (currentPageIndex - 1 >= 0){
            setPage(currentPageIndex-1);
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    
    /** Whether or not the info window is open. */
    this.isOpen = function(){
        return infoOpen;
    };
         
    /**
     * Appends a record to the paganated info window.
     * @param {Object} record The response from a linkedin object.
     * @returns {boolean} true on successfully adding record.
     */
    this.appendRecord = function(record){
        /** @type Element The info page element. */
        var infoPage = 0;
        if (infoWindowPages.length > 0 && currentPageSize < MAX_PAGE_SIZE){
            infoPage = infoWindowPages.pop();
        } else {
            infoPage = document.createElement('div');
            infoPage.setAttribute('class', 'page');
            currentPageSize = 0;
        }
        var recordBlock = document.createElement('div');
            recordBlock.setAttribute('class', 'record');
        var fullname = record.firstName +' '+record.lastName;
        var img = '<img src="'+record.pictureUrl+
                        '" title="'+fullname+'"/>';
        var connections = '<span class="connections" >'+
                            record.numConnections+
                        '</span>';
        if (record.numConnectionsCapped){
            connectionsPlus = true;
            connections += '+';
        }
            recordBlock.innerHTML = img + '<span class="fullname">'+
                                    fullname+'</span>' + connections;

        infoPage.appendChild(recordBlock);
        
        infoWindowPages.push(infoPage);
        //first connections
        firstConnectionsTotal ++;
        //second connections
        secondConnectionTotal += record.numConnections;
        
        currentPageSize++;        
        this.updateHeader();
    };
    
    /** Updates the header with the new location info. */ 
    this.updateHeader = function(){
        header.innerHTML =
                (locationName ? 'Area: ' + 
                '<span class="location-name">'+locationName +'</span><br/>' : '')+
                '1st Connections:'+
                '<span class="connections">'+firstConnectionsTotal +'</span><br/>'+
                '2nd Connections: '+
                '<span class="connections">'+secondConnectionTotal +
                (connectionsPlus ? '+':'')+
                '</span><br/>';
    };
    
    /** Used to indicate use is also here.
     * @param {Object} profileRecord Inserts a preceeding line for "you are here".
     */  
    this.setPreheader = function(profileRecord){
        var message = "You are here";
        var preheader = document.createElement('div');
            preheader.setAttribute('id', 'you-are-here');
            preheader.innerHTML =  '<img src="'+profileRecord.pictureUrl+
                                '" title="'+message+'"/>' +
                                message;
        infoBody.insertBefore(preheader, header);
    };
    
    ////////////////////////////////////////////////////////////////////////////
    //// Overriden functions
    ////////////////////////////////////////////////////////////////////////////
    
    this.toString = function(){
        return '[GroupInfoWindow]'+infoBody.outerHTML;
    };
    
    this.close = function(){
        this.parent.close.call(this);
        infoOpen  = false;
    };
    
    this.open = function(arg1, arg2){
        this.parent.open.call(this, arg1, arg2);
        infoOpen  = true;
        setPage(0); //always open to page 1.
    };
};


/** Inheritence. 
 * @type google.maps.InfoWindow */
GroupInfoWindow.prototype = new google.maps.InfoWindow();
/** Constructor. */
GroupInfoWindow.prototype.constructor = GroupInfoWindow;
/** Class parent. */
GroupInfoWindow.prototype.parent = google.maps.InfoWindow.prototype;

////////////////////////////////////////////////////////////////////////////
//// Functions to override
////////////////////////////////////////////////////////////////////////////


/* GroupInfoWindow.prototype.close = function(){
    this.close();
};

GroupInfoWindow.prototype.open = function(arg1, arg2){
    this.open(arg1, arg2);
}; */