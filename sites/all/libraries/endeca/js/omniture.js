
site.endeca.omniture = {
    enabled: false,
    page_id: "Search Results",
    productCount: 0,
    contentCount: 0,
    searchTerm: null,
    searchType: "Regular",
    refinementsList: [],
    numberOfPages: 1,
    currentPage: 1,
    
    initialize: function( args ) {
        jQuery.extend( this, args );
    },
    
    searchResults: function () {
        var PAGE_ID = this.page_id + " " + this.currentPage;
        var KEYWORDS = this.searchTerm;
        var SEARCH_TYPE = this.searchType;
        var RESULTS = this.contentCount + this.productCount;
        
        if ( this.contentCount > 0 && this.productCount == 0 ) {
            KEYWORDS = '*' + KEYWORDS;
        }
        
        omnidata = [KEYWORDS, this.contentCount, this.productCount, PAGE_ID, SEARCH_TYPE];
        if(typeof tms_page_data.tms_page_info != "undefined") {
            tms_page_data.tms_page_info['SEARCH'] = omnidata; 
        } else {
            tms_page_data['SEARCH'] = omnidata;
        }
            jQuery(window).trigger("OMNISEARCH", [omnidata]);
        // console.log("SC PAGE VIEW");
    },
    
    refineSearch: function( refinementName ) {
        omnidata = [refinementName, this.productCount];
        if(typeof tms_page_data.tms_page_info != "undefined") {
            tms_page_data.tms_page_info['FILTERSEARCH'] = omnidata;
        } else {
            tms_page_data['FILTERSEARCH'] = omnidata;
        }
        jQuery(window).trigger("FILTERSEARCH",[omnidata]);
        // console.log("SEARCH FILTER EVENT",omnidata);
    },
    
    contentClick: function() {
        
    },
    
    productClick: function() {
        var PAGE_ID = this.page_id + " " + this.currentPage;
        var KEYWORDS = this.searchTerm;
        var SEARCH_TYPE = this.searchType;
        var RESULTS = this.contentCount + this.productCount;

        if ( this.contentCount > 0 && this.productCount == 0 ) {
            KEYWORDS = '*' + KEYWORDS;
        }

        omnidata = [KEYWORDS, this.contentCount, this.productCount, PAGE_ID, SEARCH_TYPE];
        if(typeof tms_page_data.tms_page_info != "undefined") {
            tms_page_data.tms_page_info['TYPEAHEAD'] = omnidata;
        } else {
            tms_page_data['TYPEAHEAD'] = omnidata;
        }
        jQuery(window).trigger("OMNISEARCH", [omnidata]); 
        //console.log("product click",omnidata);
    },
    
    seeAllClick: function() {
        jQuery(window).trigger("SEARCHALLCLK"); 
    },
    
    reset: function() {
        this.refinementsList = [];
    }
};

