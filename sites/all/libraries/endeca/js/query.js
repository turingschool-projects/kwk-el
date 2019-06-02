
/*
    Endeca query class
        
*/

var Drupal = Drupal || {};
Drupal.settings = Drupal.settings || {};
Drupal.settings.endeca = Drupal.settings.endeca || {};

generic.endeca.query = site.endeca.generic.Class.create({
    initialize: function( args ) {
        this.configuration = args || {};
        
        this.sessionId = Math.floor(Math.random()*999999)+1; // no longer used to allow for akamai caching
        
        this.url = '/enrpc/JSONControllerServlet.do';
        this.urlParams = {};
        
        this.queryString = null;
        this.searchTerm = '';
        this.searchKey = 'all';
        this.searchMode = 'matchallpartial';
        
        this.searchDimensions = true;
        this.computePhrasings = true;
        this.didYouMean = true;
        
        this.recordsPerPage = 10;
        this.pageNumber = 1;
        
        this.sortKey = null;
        
        this.rollup = true;
        this.rollupId = 'p_PRODUCT_ID';
        this.rollupDetail = true;
/*

// Moved to site-level configuration.js

        this.defaultRangeFilters = {
            skuShoppable: 's_shoppable|GT+0',
            skuPromotional: 's_promotional|GT+0',
            skuSearchable: 's_searchable|GT+0',
            productTrFlag: 'p_TR_FLAG|LT+1',
            productDisplayable: 'p_displayable|GT+0',
            productShoppable: 'p_shoppable|GT+0'
        };
        this.rangeFilters = ['skuSearchable'];
        this.additionalRangeFilters = [];
                
        this.defaultRecordFilters = {
            products: 'rec_type:product',
            content: 'rec_type:content',
            locale: 'locale:' + site.endeca.generic.cookie('LOCALE'),
            activeSkus: 'NOT(s_INVENTORY_STATUS:5)',
            discontinued: 'NOT(s_discontinued:1)',
            shoppableOrComingSoon: 'OR(s_shoppable:1,s_isComingSoon:1)'
        };
        this.recordFilters = [];
        this.additionalRecordFilters = [];
*/

        // These should be configured in the sitewide configuration.js file.
        
        this.configuredRangeFilters = {} // collection of pre-built range filters 
        this.defaultRangeFilters = []; // which pre-built range filters to use on this query
        this.rangeFilters = []; // pre-built range filters applied via instance configuration
        this.additionalRangeFilters = []; // endeca sytnax range filters applied via instance configuration
        
        this.configuredRecordFilters = {}; // collection of pre-built record filters        
        this.defaultRecordFilters = []; // which pre-built record filters to use on this query
        this.recordFilters = []; // pre-built record filters applied via instance configuration
        this.additionalRecordFilters = []; // endeca sytnax record filters applied via instance configuration
        
        this.recordId = null; // only set this if you want to only retrieve this specific record
        
        this.configureLocale( { 
            'props': [ 'MDEXHost', 'MDEXPort', 'logHost', 'logPort', 'defaultDimensionIds' ],
            'locale': jQuery.cookie('LOCALE') || Drupal.settings.endeca.locale || 'en_US'
        } );
                
        jQuery.extend( this, this.configuration );
        
        this.recordFilters.push('locale'); //always filter by locale
        
        this.completed = 0; //indicates whether the query is new or not
        this.exportUrlParams = [ 'N', 'Ne', 'Nao', 'Ntt', 'D', 'M' ];
        
        this.setupServer();
	},
	
	reset: function() {
	    this.urlParams = {};
	    this.queryString = null;
	    this.jsonResult = null;
	    this.completed = 0;
	},
	
	prepare: function() {
	    this.setupServer();
	    
	    if ( this.recordId ) { this.setupRecordId(); }
        else if ( this.searchTerm ) {   
            this.searchTerm = jQuery.trim( this.parsedSearchTerm() );
            if ( this.computePhrasings ) { this.setupPhraseComputation(); }
            if ( this.didYouMean ) { this.setupDidYouMean(); }
            if ( this.searchDimensions ) { this.setupDimensionSearch(); }
            this.setupSearch();
        }
        
        if ( this.pageNumber ) { this.setupPage(); }
        if ( this.sortKey ) { this.setupSort(); }
        if ( this.rollup ) { this.setupRollUp(); }
        this.setupNavigation();
        this.setupRangeFilters();
        this.setupRecordFilters();
        
        if ( this.queryString ) { 
            this.queryString = decodeURIComponent(this.queryString);
            this.processQueryString();
        } else {
            this.setupDimensionIds();
        }
	},
	
	execute: function() {
		var url = this.url + '?' + this.toQueryString();
		jQuery.ajax({
            url: url,
	  		type: 'get',
	  		context: this,
	  		complete: this.onComplete
	  	});
	},
	
	onComplete: function(t) {
	    this.completed = 1;
		this.rawResult = t.responseText;
		this.jsonResult = jQuery.parseJSON( this.rawResult );
		this.callbackCompleted();
	},
	
    toQueryString: function( args ) {
	    var args = args || {};
	    var queryString = args.urlParams ? jQuery.param(args.urlParams) : jQuery.param(this.urlParams);
	    queryString = queryString.replace(/%2B/gi, '+'); //Endeca is picky about pluses being unencoded
	    return queryString;
	},
	
	processQueryString: function() {
	    this.urlParams = jQuery.extend( true, this.urlParams, site.endeca.helpers.string.toQueryParams( this.queryString ) );
        this.searchTerm = this.urlParams['Ntt'] || '';
        this.setupDimensionIds();
        this.setupRangeFilters();
        this.setupRecordFilters();
	},
	
	/** 
	    Return a new query string reflecting the merging of the current instance's query string and the passed in query string
        Used when preparing a new query for the url with the existing query instance
	 **/
	getMergedQueryString: function( queryString, dimIdsToRemove ) {
	    var newUrlParams = site.endeca.helpers.string.toQueryParams( queryString );
	    
        // If there is no record offset in the new query, add one.
	    if ( !newUrlParams['Nao'] ) { newUrlParams['Nao'] = 0; } 
	    
	    var mergedUrlParams = jQuery.extend(true, {}, this.urlParams, newUrlParams );
	        
	    // Merge Dimension Ids
	    var Ne = this._getDimensionIds({ urlParams: newUrlParams, oldDimensionIds: this.urlParams['Ne'] });
	    Ne = site.endeca.helpers.array.remove( Ne, this.defaultDimensionIds );
	    // For nested dimensions, make sure to remove the selected dimension (this mainly applies to breadcrumbs)
	    Ne = dimIdsToRemove ? site.endeca.helpers.array.remove( Ne, dimIdsToRemove ) : Ne;
	    mergedUrlParams['Ne'] = Ne.join('+');
	    
	    return this.toQueryString({ urlParams: site.endeca.helpers.obj.slice( mergedUrlParams, this.exportUrlParams ) });
	},
	
	setupServer: function() {
	    this.urlParams['M'] = 'host:' + this.MDEXHost + '|port:' + this.MDEXPort + '|recs_per_page:' + this.recordsPerPage;
	    //this.urlParams['L'] = 'SESSION_ID:' + this.sessionId + '|host:' + this.logHost + '|port:' + this.logPort;
	    this.urlParams['L'] = 'host:' + this.logHost + '|port:' + this.logPort;
	},
	
	setupRecordId: function() {
	    this.urlParams['R'] = this.recordId
	},
	
	setupNavigation: function() {
	    this.urlParams['N'] = this.defaultNavigation ? this.defaultNavigation.join('+') : '';
	},
	
	setupDimensionIds: function() {
	    var NeString = this._getDimensionIds({ urlParams: this.urlParams });
	    if ( NeString.length ) { this.urlParams['Ne'] = NeString.join('+') }
	},
	
	setupSearch: function( args ) {
	    var args = args || {};
	    
	    this.urlParams['Ntt'] = ( args.searchTerm || this.searchTerm ).toLowerCase();
	    this.urlParams['Ntk'] = this.searchKey
	    this.urlParams['Ntx'] = this.searchMode.match(/mode\+/) ? this.searchMode : ('mode+' + this.searchMode)
	},
	
	setupDimensionSearch: function( args ) {
	    var args = args || {};
	    
	    this.urlParams['D'] = ( args.searchTerm || this.searchTerm ).toLowerCase();
	    this.urlParams['Dx'] = this.searchMode.match(/mode\+/) ? this.searchMode : ('mode+' + this.searchMode)
	    
	    /* Currently unused. Allows searching of specific dimensions: Di=DIMID+DIMID+DIMID
	    this.queryString += 'Di=';
	    */
	},
	
	setupPhraseComputation: function() {
	    this.urlParams['Ntpc'] = 1
	    this.urlParams['Ntpr'] = 1
	},	
	
	setupDidYouMean: function() {
        this.urlParams['Nty'] = 1  
	},
	
	setupSort: function() {
	    this.urlParams['Ns'] = this.sortKey
	},
	
	setupRollUp: function() {
	    this.urlParams['Nu'] = this.rollupId
	    
	    // type of rollup.  1 = summary only, 2 = all records
	    this.urlParams['Np'] = this.rollupDetail ? 2 : 1
	},
	
	setupPage: function() {
	    // This is actually a record offset, not a page number
	    this.urlParams['Nao'] = (this.pageNumber - 1) * this.recordsPerPage
	},
	
	setupRangeFilters: function() {
	    var filters = this._getFilters(this.defaultRangeFilters, this.rangeFilters, this.additionalRangeFilters, this.configuredRangeFilters);
	    	    
	    if (filters.length) {
	        this.urlParams['Nf'] = filters.join('|')
	    }	    
	},
	
	setupRecordFilters: function() {
        var filters = this._getFilters(this.defaultRecordFilters, this.recordFilters, this.additionalRecordFilters, this.configuredRecordFilters);
	    
	    if (filters.length) {
	        this.urlParams['Nr'] = 'AND(' + filters.join(',') + ')'
	    }
	},
	
	_getFilters: function(defaultFilters, filters, additionalFilters, configuredFilters) {
	    var filterArray = [];
	    
	    jQuery.each( filters, function( index, filter ) {
	         filterArray.push( configuredFilters[filter] );
	    });
	    
	    jQuery.each( defaultFilters, function( index, filter ) {
	         filterArray.push( configuredFilters[filter] );
	    });
	    
	    jQuery.each( additionalFilters, function( index, filter ) {
	        filterArray.push(filter);
	    });
	    
	    return filterArray;
	},
	
	_getDimensionIds: function( args ) {	    
	    var Ne = [];
	    
	    if ( args.oldDimensionIds ) { Ne = Ne.concat( args.oldDimensionIds.split('+') ) }
	    if ( args.addDefaultDimensionIds ) { Ne = Ne.concat( (args.oldDimensionIds).split('+') ) }
	    Ne = Ne.concat( args.urlParams && args.urlParams['Ne'] ? (args.urlParams['Ne']).split('+') : [] );
	    Ne = Ne.concat( this.defaultDimensionIds );
	    Ne = site.endeca.helpers.array.toInt( Ne );
	    Ne = site.endeca.helpers.array.unique( Ne );
	    
	    return Ne;
	},
	
	parsedSearchTerm: function( args ) {
	    var args = args || {};
	    var searchTerm = args.searchTerm || this.searchTerm;
	    
	    var parsedSearchTerm;
	    try {
	        parsedSearchTerm = decodeURIComponent( searchTerm )
	    } catch (e) {
	        parsedSearchTerm = searchTerm;
	    }
	    parsedSearchTerm = parsedSearchTerm.replace(/\+/g, " ");
	    return parsedSearchTerm.match(/[<>\/]/) == null ? parsedSearchTerm : '';
	},
	
	configureLocale: function( args ) {
	    var args = args || { 'props': [], 'locale': '' };
	    
	    for ( var i = 0; i < args.props.length; i++ ) {
	        if (    typeof this.configuration[ args.props[i] ] == "object" && 
	                typeof this.configuration[ args.props[i] ][ args.locale ] != "undefined" ) {
	            this.configuration[ args.props[i] ] = this.configuration[ args.props[i] ][ args.locale ];
	        }
	    }
	}
   
});


site.endeca.query = generic.endeca.query;
