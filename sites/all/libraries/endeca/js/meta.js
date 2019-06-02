
/*
    Endeca Meta class.
    This provides a convenience wrapper for parsing and normalizing the metadata of Endeca results.
    After parsing, we can access the properties we care about as valid js properties.
    There is no other use for this class (please don't add page/state specific
    code in this module).

*/

generic.endeca.meta = site.endeca.generic.Class.create({
    initialize: function( args ) {
        this.jsonResult = null;
        this.searchKey = "all";
        this.hasRedirects = false;
        this.redirecting = false;
        
        this.pagination = null;
        this.sorting = [];
        this.dimensions = {};
        this.metaInfo = {};
        this.searchInfo = {};
        this.supplementalObjects = [];
        this.supplementalContent = {};
        
        jQuery.extend( this, args );
        
        if ( this.jsonResult ) { this.parseData(); }
    },
    
    parseData: function( args ) {
        this.processMetaInfo();
        this.processSearchInfo();
        this.processSupplemental();
        this.processPagination();
        this.processSorting();
        this.processDimensions();
    },
    
    processMetaInfo: function() {
        this.metaInfo = this.jsonResult.MetaInfo || this.metaInfo;
        
        this.numberOfPages = this.getMetaProp( "Number of Pages" , 1 );
  		this.recordsReturned = this.getMetaProp( "Number of Records Returned", 0 );
  		this.recordsPerPage = this.getMetaProp( "Number of Records per Page", 0 );
  		this.totalMatchRecords = this.getMetaProp( "Total Number of Matching Records", 0 );
  		this.totalAggrRecords = this.getMetaProp( "Total Number of Matching Aggregate Records", 0 );
    },
    
    processSearchInfo: function( args ) {
        var args = args || { totalContentRecords: 0 };
        var searchInfo = this.jsonResult && this.jsonResult["Search Info"] && this.jsonResult["Search Info"][this.searchKey] ? this.jsonResult["Search Info"][this.searchKey] : {};
        this.searchInfo.searchTerm = searchInfo["Search Term"] || "";
        
        if ( this.searchInfo.searchTerm.match(/\*$/) ) {
            this.searchInfo.searchTerm = this.searchInfo.searchTerm.slice(0,-1);
        }
        
        this.searchInfo.totalContentRecords = args.totalContentRecords || 0;
        this.searchInfo.totalProductRecords = this.totalAggrRecords || this.totalMatchRecords;
        
        this.searchInfo.contentResultText = this.searchInfo.totalContentRecords == 1 ? site.endeca.generic.rb('endeca').get('content_result') : site.endeca.generic.rb('endeca').get('content_results');
        this.searchInfo.productResultText = this.searchInfo.totalProductRecords == 1 ? site.endeca.generic.rb('endeca').get('product') : site.endeca.generic.rb('endeca').get('products');
        
        this.searchInfo.totalRecords = parseInt(this.searchInfo.totalContentRecords) + parseInt(this.searchInfo.totalProductRecords);
        this.searchInfo.resultText = this.searchInfo.totalRecords == 1 ? site.endeca.generic.rb('endeca').get('result') : site.endeca.generic.rb('endeca').get('results');
        
        this.searchInfo.startingRecord = this.searchInfo.totalProductRecords ? this.getMetaProp( "Starting Record Number", 1 ) : 0;
  		this.searchInfo.endingRecord = this.getMetaProp( "Ending Record Number", 1 );
        
        this.searchInfo.originalRecords = this.searchInfo.totalRecords;
        this.searchInfo.originalResultText = this.searchInfo.resultText;
        
        
        // If we matched on a computed phrase AFTER the spell correction,
		// then the "Spell Correction" flag is not set properly.
		// Also, the "New Term" will have quotes around it, which further
		// messes up the comparison.  So... to test for spell correction,
		// see if the user's search term is NOT within the corrected term.
		this.searchInfo.correctedTerms = [];
		if ( searchInfo["Spell Correction"] ) {
		    for ( var i = 0; i < searchInfo["Spell Correction"].length; i++ ) {
                if ( searchInfo["Spell Correction"][i]["New Term"].toLowerCase().indexOf( this.searchInfo.searchTerm.toLowerCase() ) < 0 && 
                     searchInfo["Spell Correction"][i]["AutoPhrasing"] == "false" ) {
                    this.searchInfo.correctedTerms.push( searchInfo["Spell Correction"][i]["New Term"] );
                }
            }
		}
        
        if ( this.searchInfo.correctedTerms.length ) { 
            this.searchInfo.originalRecords = 0;
            this.searchInfo.originalResultText = this.searchInfo.originalRecords == 1 ? site.endeca.generic.rb('endeca').get('result') : site.endeca.generic.rb('endeca').get('results');
        }
        
        
  		// Quirk: With computed phrases turned on, if the user enters
  		// an exact phrase that we have in our search config, we'll get
  		// a dym entry of the quoted phrase.  Since this is confusing and unnecessary,
  		// we'll just skip those dym's.
  		
        this.searchInfo.didYouMean = [];
		if ( searchInfo["DYM Information"] ) {
            for ( var i = 0; i < searchInfo["DYM Information"].length; i++ ) {
                if (    searchInfo["DYM Information"][i]["New Term"].toLowerCase().indexOf( this.searchInfo.searchTerm.toLowerCase() ) < 0 && 
                     searchInfo["DYM Information"][i]["AutoPhrasing"] == "false" ) {
                    this.searchInfo.didYouMean.push( {
                        "Selection Link": searchInfo["DYM Information"][i]["Pivot Link"],
                        "Term": searchInfo["DYM Information"][i]["New Term"]
                    });
                }
            }
        }
    },
    
    processPagination: function() {
        if ( this.numberOfPages > 1 ) {
            var viewAllQuery = new site.endeca.query( jQuery.extend( true, {}, site.endeca.configuration.query, { recordsPerPage: 10000 } ) );
            
            this.pagination = {
                numberOfPages: this.numberOfPages,
                numberOfCurrentPage: this.getMetaProp ( "Page Number" , 1 ),
                viewAllLink: this.query.getMergedQueryString( viewAllQuery.toQueryString() ),
                previousPageLink: this.getMetaProp( "Previous Page Link" ),
                nextPageLink: this.getMetaProp( "Next Page Link" ),
      		    directPageLinks: this.getMetaProp( "Direct Page Links", '' )
            };
      	}
      	
      	/** Do we want to merge the select link? If so, we can do that here:
      	if ( this.numberOfPages > 1 ) {
            var query = new site.endeca.query({ recordsPerPage: 10000 });
            
            this.pagination = {
                numberOfPages: this.numberOfPages,
                numberOfCurrentPage: this.getMetaProp ( "Page Number" , 1 ),
                viewAllLink: { "Selection Link": query.toQueryString() },
                previousPageLink: { 'Selection Link': this.getMetaProp( "Previous Page Link" ) },
                nextPageLink: { 'Selection Link': this.getMetaProp( "Next Page Link" ) },
      		    directPageLinks: this.getMetaProp( "Direct Page Links", '' )
            };
            
            for ( var i = 0; i < this.pagination.directPageLinks.length; i++ ) {
                this.pagination.directPageLinks[i] = { "Selection Link": this.pagination.directPageLinks[i], "Content": i+1 };
            }
      	}
      	**/
    },
    
    processSorting: function() {
        var addSort = this.getMetaProp ( "Add Sort Key Links", [] );
        var sortedBy = this.getMetaProp ( "Sorted By", [] );
        
        if ( addSort.length ) {
            this.sorting = this.sorting.concat( addSort );
        }
        
        if ( sortedBy.length ) {
            this.sorting = this.sorting.concat( sortedBy );
        }
    },
    
    processDimensions: function() {        
        var breadcrumbs = [];
        var refinements = [];
        
        if ( this.jsonResult.Breadcrumbs ) {
            for ( var i = 0; i < this.jsonResult.Breadcrumbs.length; i++ ) {
                var bc = this.jsonResult.Breadcrumbs[i];
                if ( bc && bc["Type"] == 'Navigation' ) {
                    for ( var j = 0; j < bc["Dimension Values"].length; j++ ) {
                        bc["Dimension Values"][j]["Removal Link"] = this.query.getMergedQueryString( bc["Dimension Values"][j]["Removal Link"], parseInt( bc["Dimension Values"][j]["Dim Value ID"] ) );
                    }
                    breadcrumbs.push(bc);
                }
            }
        }
        
        if ( this.jsonResult.Refinements ) {
            for ( var i = 0; i < this.jsonResult.Refinements.length; i++ ) {
                var ref = this.jsonResult.Refinements[i];
                if ( ref && ref["Dimensions"] && ref["Dimensions"][0] && ref.Dimensions[0]["Dimension Values"] ) {
                    for ( var j = 0; j < ref.Dimensions[0]["Dimension Values"].length; j++ ) {
                        ref.Dimensions[0]["Dimension Values"][j]["Selection Link"] = this.query.getMergedQueryString( ref.Dimensions[0]["Dimension Values"][j]["Selection Link"] );
                    }
                    refinements.push(ref["Dimensions"][0]);
                }
            }
        }
        
        if ( breadcrumbs.length ) { this.dimensions.breadcrumbs = breadcrumbs; }
        if ( refinements.length ) { this.dimensions.refinements = refinements; }
    },
    
    processSupplemental: function() {
        this.supplementalObjects = this.jsonResult["Supplemental Objects"] || this.supplementalObjects;
        
        for ( var i = 0; i < this.supplementalObjects.length; i++ ) {
            var supplementalObject = this.supplementalObjects[i];
            if ( supplementalObject.Properties ) {
                if ( supplementalObject.Properties["DGraph.KeywordRedirectUrl"] ) {
                    this.hasRedirects = true;
                    if ( this.configuration.followRedirects ) {
                        this.redirecting = true;
                        document.location.href = supplementalObject.Properties["DGraph.KeywordRedirectUrl"];
                    }
		            return false;
				}
				if ( supplementalObject.Properties["DGraph.SeeAlsoMerchId"] ) {
				    var zone = supplementalObject.Properties.Zone;
				    
				    var content = this.supplementalContent[zone] || { records: [] };
				    content.style = supplementalObject.Properties.Style;
				    
                    supplementalObject = this.highlightSearchTermInSupplemental( supplementalObject );
				    
				    if ( !supplementalObject.Properties[ 'suppress_' + ( jQuery.cookie('LOCALE') || 'en_US' ) ] ) {
				        content.records.push( supplementalObject );
				    }
				    
                    this.supplementalContent[zone] = content;
				}
            }
        }
    },
    
    highlightSearchTermInSupplemental: function( supplementalObject ) {
        // Highlight search term in supplemental content -- this is defined on the brand level, see example on BobbiBrown: 
        // drupal-7.9/sites/bobbibrown/modules/custom/bb_endeca/libraries/endeca_search_brand_config/meta.js
        
        return supplementalObject;
    },
    
    // Convenience function to look for prop and return default if not found
	getMetaProp: function( property, def ) {
		var val = ( this.metaInfo[property] || def );
		if ( !isNaN(val) ) {
			val = parseInt(val);
		}
		return val;
	}
    
});

site.endeca.meta = generic.endeca.meta;
