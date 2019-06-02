
/*
    Base endeca control class.
    
    This is the base class that will control all instances of endeca. All instances of endeca will have a control
    class that inherits from this base class.

*/

generic.endeca.control = site.endeca.generic.Class.create({
    initialize: function( args ) {            
        this.configuration = args || site.endeca.configuration;
        
        this.queryString = site.endeca.generic.env.query('qs') || "";
        this.searchTerm = site.endeca.generic.env.query('search') || "";
        
        this.hasResults = false;
        this.hasSearched = 0;
        this.wildcardSearch = false;
        
        this.customClasses = {};
        this.results = {};
        this.queries = {};
        this.catalogs = {};
        this.nodes = {};
        
        if ( this.configuration.mustacheMappings ) { this.loadMustacheMappings(); }
        if ( this.configuration.queries ) { this.generateQueries(); }
        if ( this.configuration.results ) { this.generateResults(); }
        if ( this.configuration.nodes ) { this.generateNodes(); }
        
        if ( this.configuration.coremetricsEnabled ) {
            site.endeca.coremetrics.initialize({ enabled: true });
        }

        if ( this.configuration.omnitureEnabled ) {
            if (site.endeca.omniture) {
                site.endeca.omniture.initialize({ enabled: true });
            }
        }
        
        if ( this.hasAnalyticsIntegrated() && !this.isTypeahead() ) {
            if ( site && site.track ) {
                site.track.disableDefaultPageView();
            }
        }
        
    },
    
    loadMustacheMappings: function () {
        if ( this.configuration.mustacheMappings ) {
            site.endeca.generic.template.loadMustacheMappings({ mappings: this.configuration.mustacheMappings });
        }
    },
    
    generateQueries: function() {
        /*
            Take the information provided from the configuration and instantiate all of the necessary queries for this
            class. Queries will be accessible from this.queries[queryName].
            
        */
        
        for ( var query in this.configuration.queries ) {
            this.queries[query] = new site.endeca.query( jQuery.extend(
                { callbackCompleted: site.endeca.helpers.func.bind( this.searchCompleted, this ) }, this.configuration.query,
                this.configuration.queries[query] || {}
            ));
        }
    },
    
    generateResults: function() {
        /*
            Create custom classes for each of the results configuration objects.
        */
        
        for ( var resultsName in this.configuration.results ) {
            // Allow for optional childClass setting in configuration
            this.configuration.results[resultsName].childClass = this.configuration.results[resultsName].childClass || "";
            
            /* 
                Determine which mixins we should be using for this custom class:
                
                1. Use the mixinKey provided in the configuration for this class.
                2. Remove 'site.endeca' from the childClass string and use the remainder as the mixinKey: 
                    childClass = 'site.endeca.results.products', mixinKey = 'results.products'
                3. Remove 'site.endeca' from the baseClass string and add on the resultName as the mixinKey
                    baseClass = 'site.endeca.results', resultsName = 'products', mixinKey = 'results.products'
                4. Remove 'site.endeca' from the baseClass string as the mixinKey
                    baseClass = 'site.endeca.results', mixinKey = 'results'
                
            */
            
            var mixins =    this.configuration.mixins[this.configuration.results[resultsName].mixinKey] || 
                            this.configuration.mixins[this.configuration.results[resultsName].childClass.replace(/site\.endeca\./, '')] ||
                            this.configuration.mixins[this.configuration.results[resultsName].baseClass.replace(/site\.endeca\./, '') + '.' + resultsName] ||
                            this.configuration.mixins[this.configuration.results[resultsName].baseClass.replace(/site\.endeca\./, '')];

            var baseClass = eval(this.configuration.results[resultsName].baseClass);
            
            // Use childClass provided in configuration or
            // Use resultsName to retrieve childClass from baseClass or
            // use an empty object
            var childClass = eval(this.configuration.results[resultsName].childClass) || baseClass[resultsName] || {};
            
            // Create a custom class created from the baseClass, appropriate mixins, and the childClass
            this.customClasses[resultsName] = site.endeca.generic.Class.create( site.endeca.generic.Class.mixin( baseClass, mixins ), childClass );
            
            // Instantiate custom class in this.results[resultsName]
            // Pass in the mixins from configuration for use in result(s) generation
            // Pass in any configuration settings specified in the configuration file for this class
            // Pass in any instanceArgs specified in the configuration file for this class
            this.results[resultsName] = new this.customClasses[resultsName]( jQuery.extend( {}, { mixins: this.configuration.mixins, configuration: this.configuration.results[resultsName].configuration || {} }, this.configuration.results[resultsName].instanceArgs || {} ) );
        }
    },
    
    generateNodes: function() {
        for ( var nodeName in this.configuration.nodes ) {
            this.nodes[nodeName] = this.configuration.nodes[nodeName];
        }
    },
    
    search: function( args ) {
        var args = args || {
            searchTerm: null,
            queryString: null
        };
        
        this.hasSearched++;
        
        this.showLoading();
        this.resetQueries();
        
        // Get searchTerm from queryString here in order to synchronize all queries on the same search term
        var queryString = args.queryString || this.queryString || '';
        var searchTerm = queryString ? site.endeca.helpers.string.toQueryParams( queryString )['Ntt'] : ( args.searchTerm || this.searchTerm || '' );
        
        for ( var query in this.queries ) {
            this.queries[query].searchTerm = searchTerm;
            this.queries[query].queryString = this.queries[query].noQueryString ? '' : queryString;
            this.queries[query].prepare();
            this.queries[query].execute();
            
            this.searchTerm = this.queries[query].searchTerm;
        }
    },
    
    searchCompleted: function( args ) {
        if ( this.queriesCompleted() ) {
            this.resetResults();
            
            for ( var query in this.queries ) {
    		    this.catalogs[query] = new site.endeca.catalog[query]({ jsonResult: this.queries[query].jsonResult });
    		}
    		
            this.meta = new site.endeca.meta({ query: this.queries.product, jsonResult: this.queries.product.jsonResult, searchKey: this.queries.product.searchKey, configuration: { followRedirects: this.configuration.followRedirects, contentzones: this.configuration.contentzones } });
            
            if ( this.meta.redirecting ) { 
                // fire redirection event
                if ( this.hasAnalyticsIntegrated() && site && site.elcEvents ) {
                    site.elcEvents.dispatch('track:searchRedirect', this);
                }
                return false; 
            }
            
            this.hideLoading();
           
            // fire search loaded event - delayed to give utag a chance to load
            if ( this.hasAnalyticsIntegrated() && !this.wildcardSearch && site && site.elcEvents ) {
                var that = this;
                if ( this.isTypeahead() ) {
                    site.elcEvents.addListener('track:ready', function() {
                        site.elcEvents.dispatch('track:searchTypeaheadLoaded', that);
                    });
                } else {
                    site.elcEvents.addListener('track:ready', function() {
                        site.elcEvents.dispatch('track:searchPageLoaded', that);
                    });
                }
            }
            
            return true;
        }
        
        return false;
    },
    
    
    
    queriesCompleted: function() {
        for ( var query in this.queries ) {
            if ( !this.queries[query].completed ) { return false; }
        }
        return true;
    },
    
    processCoremetrics: function( args ) {
        var args = args || {
            pageView: true
        };
        // this should be called from your searchCompleted in your instance's control subclass.
        if ( this.configuration.coremetricsEnabled ) { 
            site.endeca.coremetrics.reset();
            site.endeca.coremetrics.pageView = args.pageView;
            site.endeca.coremetrics.productCount = this.meta.searchInfo.totalProductRecords;
            site.endeca.coremetrics.contentCount = this.meta.searchInfo.totalContentRecords;
            site.endeca.coremetrics.searchTerm = this.meta.searchInfo.correctedTerms && this.meta.searchInfo.correctedTerms.length ? this.meta.searchInfo.correctedTerms[0] : this.queries.product.parsedSearchTerm();
            site.endeca.coremetrics.wildcardSearch = this.wildcardSearch;
            site.endeca.coremetrics.numberOfPages = this.meta.pagination ? this.meta.pagination.numberOfPages : 1;
            site.endeca.coremetrics.currentPage = this.meta.pagination ? this.meta.pagination.numberOfCurrentPage : 1;
            if ( this.meta.dimensions.breadcrumbs ) {
                for ( var i = 0; i < this.meta.dimensions.breadcrumbs.length; i++ ) {
                    for ( var j = 0; j < this.meta.dimensions.breadcrumbs[i]["Dimension Values"].length; j++ ) {
                        site.endeca.coremetrics.addRefinement({
                            dimensionName: this.meta.dimensions.breadcrumbs[i]["Dimension Name"],
                            refinement: this.meta.dimensions.breadcrumbs[i]["Dimension Values"][j]["Dim Value Name"]
                        });
                    }
                }
            }
            site.endeca.coremetrics.setPageView(); 
        }
    },

    processOmniture: function() {
        // this should be called from your searchCompleted in your instance's control subclass.
        if ( this.configuration.omnitureEnabled ) {
            site.endeca.omniture.reset();

            // Will use tms_page_data instead of site.endeca because that brings this data under the helm of the Generic
            // Data Dictionary for tagging.
            site.endeca.omniture.productCount = this.meta.searchInfo.totalProductRecords;
            site.endeca.omniture.contentCount = this.meta.searchInfo.totalContentRecords;
            site.endeca.omniture.searchTerm = this.meta.searchInfo.correctedTerms && this.meta.searchInfo.correctedTerms.length ? this.meta.searchInfo.correctedTerms[0] : this.queries.product.parsedSearchTerm();
            site.endeca.omniture.numberOfPages = this.meta.pagination ? this.meta.pagination.numberOfPages : 1;
            site.endeca.omniture.currentPage = this.meta.pagination ? this.meta.pagination.numberOfCurrentPage : 1;
            
            var searchType = this.configuration.searchType || this.queries.product.searchKey;
            if ( searchType ) {
                site.endeca.omniture.searchType = searchType;
            }

            if (searchType == "all") {
               if ( this.meta.dimensions.breadcrumbs ) {
                  var lastBC = this.meta.dimensions.breadcrumbs[ this.meta.dimensions.breadcrumbs.length - 1 ];
                  var lastBCVal = lastBC["Dimension Values"][ lastBC["Dimension Values"].length - 1 ];
                  site.endeca.omniture.refineSearch( lastBCVal["Dim Value Name"] );
               } else {
                  site.endeca.omniture.searchResults();
               }
           }
        }
    },
    
    //somewhat fragile, but can be overridden at the brand level if needed.
    isTypeahead: function() {
        if ( this.configuration.minSearchLength ) {
            return 1;
        } else {
            return 0;
        }
    },
    
    hasAnalyticsIntegrated: function() {
        if ( Drupal && Drupal.settings && Drupal.settings.analytics ) {
            return Drupal.settings.analytics.analytics_integrated;
        } else {
            return 0;
        }
    },
    
    showLoading: function() {
        if ( this.nodes.loading ) {
            this.nodes.loading.show();
        }
    },
    
    hideLoading: function() {
        if ( this.nodes.loading ) {
            this.nodes.loading.hide();
        }
    },
    
    displayResults: function() {
        if ( this.hasResults ) {
            if ( this.results.bestsellers ) { this.results.bestsellers.hide(); }
            if ( this.results.content ) { this.results.content.show(); }
            if ( this.nodes.resultsContainer ) { this.nodes.resultsContainer.show(); }
            if ( this.nodes.noResultsContainer ) { this.nodes.noResultsContainer.hide(); }
	        this.processCoremetrics();
                this.processOmniture();
            this.wildcardSearch = false;
            return true;
        } else {
            if ( this.wildcardSearch ) {
                if ( this.nodes.resultsContainer ) { this.nodes.resultsContainer.hide(); }
                if ( this.nodes.noResultsContainer ) { this.nodes.noResultsContainer.show(); }
                if ( this.results.content ) { 
                    if ( this.configuration.noResultsContentZone ) {                
                        this.results.content.contentzones = this.configuration.noResultsContentZone;
                        this.results.content.resultData = this.meta.supplementalContent;
                        this.results.content.displayResults();
                        this.results.content.show();
                    } else {
                        this.results.content.hide(); 
                    }
                }
                if ( this.results.bestsellers ) {
            	    this.results.bestsellers.displayResults();
            	    this.results.bestsellers.show();
                }
                
	            this.processCoremetrics();
                    this.processOmniture();
                this.wildcardSearch = false;
                return true;
            } else {
                this.wildcardSearch = true;
                this.search({ searchTerm: this.searchTerm + '*' });
                return false;
            }
        }
    },  
         
    
    resetQueries: function() {
        for ( var query in this.queries ) {
            this.queries[query].reset();
        }
    },
    
    resetResults: function() {  
        this.hasResults = false;
        for ( var resultsName in this.results ) {
            this.results[resultsName].reset();
        }
    }
});

site.endeca.control = generic.endeca.control;
