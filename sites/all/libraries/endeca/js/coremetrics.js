
/**

Is this a GENERIC file - if values need to be modified, they either need to be passed in from control.js OR this file can be extended at the instance level (see example in sites/clinique/na/js/pc/site/endeca/instances/foundation_finder/option/coremetrics.js)

**/

generic.endeca.coremetrics = {
    enabled: false,
    category_id: "search",
    page_id: "Search Results",
    productCount: 0,
    contentCount: 0,
    searchTerm: null,
    refinementsList: [],
    numberOfPages: 1,
    currentPage: 1,
    pageView: true,
    dimensionNameMap: {
        "Skin Type" : "Typ",
        "Skin Tone" : "Ton"
    },
    wildcardSearch: false,
    
    initialize: function( args ) {
        jQuery.extend( this, args );
    },
    
    addRefinement: function ( args ) {
        var args = args || {};
        if ( args.dimensionName && args.refinement ) {
            var dimensionName;
            if ( this.dimensionNameMap[args.dimensionName] ) {
                dimensionName = this.dimensionNameMap[args.dimensionName];
            } else {
                var dimensionNameWords = args.dimensionName.split(' ');
                dimensionName = dimensionNameWords.shift().substr(0,3);
                for ( var i = 0; i < dimensionNameWords.length; i++ ) {
                    dimensionName += dimensionNameWords[i].charAt(0);
                }
            }
            
            this.refinementsList.push( dimensionName + ':' + args.refinement );
        }
    },
    
    setPageView: function () {
        if ( this.pageView ) {            
            var PAGE_ID = this.page_id + " " + this.currentPage;
            var CATID = this.category_id;
            var KEYWORDS = this.searchTerm;
            var RESULTS = this.contentCount + this.productCount;
            var FILTERLIST = this.refinementsList.join(' > ');
            
            if ( FILTERLIST ){
                PAGE_ID = 'Search Results Filtered ' + this.currentPage;
            }
            
            if ( this.contentCount > 0 && this.productCount == 0 ) {
                KEYWORDS = '*' + KEYWORDS;
            }
            
            if ( typeof cmCreatePageviewTag == 'function' ) {
                cmCreatePageviewTag( PAGE_ID, KEYWORDS, CATID, RESULTS.toString(), FILTERLIST );
            }
            
            if ( this.wildcardSearch ) {
                if ( typeof cmCreateConversionEventTag == 'function' ) {
        	        cmCreateConversionEventTag("RESULTS PAGE", 1, "ENDECA WILDCARD SEARCH", 1);
        	    }
            } else {
                if ( typeof cmCreateConversionEventTag == 'function' ) {
        	        cmCreateConversionEventTag("RESULTS PAGE", 1, "NO ENDECA WILDCARD SEARCH", 1);
        	    }
            }
        }
    },
    
    contentClick: function() {
        if ( typeof cmCreatePageElementTag == 'function' ) {
            cmCreatePageElementTag("CONTENT", "SEARCH DROPDOWN");
        }
    },
    
    productClick: function() {
        cmCreatePageElementTag("PRODUCTS", "SEARCH DROPDOWN");
        if ( this.wildcardSearch ) {
            if ( typeof cmCreateConversionEventTag == 'function' ) {
	            cmCreateConversionEventTag("SEARCH DROPDOWN", 1, "ENDECA WILDCARD SEARCH", 1);
	        }
        } else {
            if ( typeof cmCreateConversionEventTag == 'function' ) {
	            cmCreateConversionEventTag("SEARCH DROPDOWN", 1, "NO ENDECA WILDCARD SEARCH", 1);
	        }
        }
    },
    
    seeAllClick: function() {
        if ( typeof cmCreatePageElementTag == 'function' ) {
            cmCreatePageElementTag("SEE ALL","SEARCH DROPDOWN");
        }
    },
    
    reset: function() {
        this.refinementsList = [];
        this.pageView = true;
    }
};

site.endeca.coremetrics = generic.endeca.coremetrics;