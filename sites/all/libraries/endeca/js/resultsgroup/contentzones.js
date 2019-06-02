
generic.endeca.resultsgroup.contentzones = {
        
    initialize: function( args ) {
        this.resultData = {};
        this.zones = {};
        this.crawlData = [];
        this.hasSoloResults = false;
        this.totalResults = 0;
        this.contentzones = {};
        this._super(args);
    },  
    
    setCrawlData: function( args ) {
        var args = args || { };
        if ( args.crawlData && args.crawlData.length ) { this.resultData.crawlData = { style: 'content', records: args.crawlData }; }
    },
    
    setupNodes: function( args ) {
        var args = args || {};
        this.node = this.parentNode || args.node;
    },
    
    displayResults: function( args ) {
        var args = args || {};
        
        args.baseClass = site.endeca.results.contentzone;
        
        for ( var zone in this.contentzones ) {
            // reset the result class for each zone as they may be following a different inheritance path
            this.resultClass = null; 
            
            var zoneArgs = args;
            var content = this.resultData[zone];
            
            if ( content && content.records && content.records.length ) {
                /*if ( this.contentzones[zone].limit && this.resultData[zone].records.length > this.contentzones[zone].limit ) {
                    zoneArgs.resultData = [ this.resultData[zone].records.slice( 0, this.contentzones[zone].limit ) ];
                } else {
                    zoneArgs.resultData = [ this.resultData[zone].records ];
                }*/
                
                zoneArgs.resultData = [ this.resultData[zone].records ];
                
                zoneArgs.childClass = this.contentzones[zone].childClass || (
                    site.endeca.results.contentzone[this.resultData[zone].style] ? 
                        this.resultData[zone].style : 
                        this.resultData[zone].style.match(/product/i) ? 'products' : 'content' 
                );
                zoneArgs.node = this.contentzones[zone].node;
                if ( this.contentzones[zone].solo ) { this.hasSoloResults = true; }
                if ( this.contentzones[zone].counted ) { this.totalResults += zoneArgs.resultData[0].length; }
                zoneArgs.configuration = this.contentzones[zone];
                zoneArgs.mixins = this.mixins['results.contentzone'];
                this._super(zoneArgs);
                this.contentzones[zone].resultNode = this.resultNodes[ this.resultNodes.length-1 ];
                zoneArgs.node.show();
            } else {
                this.contentzones[zone].node.hide();
            }
            
        }
    },
    
    /*
    //Initial attempt at using styles to build out custom result heirarchy - in order to do this, the contentzone resultsgroup/results/result structure will have to be modified. Currently resultsgroup represents ALL zones and sets up results classes that all have the same subclass, which doesn't allow you to mix product results with content results in one zone. In this setup, each result is a standard "result" class. 
    
    // To improve this, the following heirarchy should be adopted:
    //      resultsgroup.contentzones should still represent all zones. 
    //      results.contentzones should represent each style in a zone.
    //      result.contentzone.style should represent each individual result, with any custom, style-specific logic.
     
    createResult: function( args ) {
        try {
            args.childClass = args.configuration.styles[args.style].childClass;
        } catch(e) {
            args.childClass = 'content';
        }
        this._super( args );
    },
    */
    
    hide: function() {
        for ( var i = 0; i < this.resultNodes.length; i++ ) {
            this.resultNodes[i].hide();
        }
    },
    
    show: function() {
        for ( var i = 0; i < this.resultNodes.length; i++ ) {
            this.resultNodes[i].show();
        }
    },
    
    reset: function() {
        for ( var i = 0; i < this.resultNodes.length; i++ ) {
            this.resultNodes[i].reset();
        }
        this.resultNodes = [];
        this.totalResults = 0;
    }
    
};

site.endeca.resultsgroup.contentzones = generic.endeca.resultsgroup.contentzones;
