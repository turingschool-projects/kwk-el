
generic.endeca.results.contentzone.content = {
        
    initialize: function( args ) {
        //this.childClass = 'content';
        this._super(args);
        
        if ( this.resultData.length ) {
            this.displayResults();
        }
    },
    
    displayResults: function( args ) {
        this._super(args);
        
        this.displayResultNodes();
        
        /*this.resultNodes.each( function( result ) { 
            if ( result.resultData.content_link == "undefined" ) {
                result.node.down('.content-link').hide();
            }
        });*/
    },
    
    createResult: function( args ) {
        args.result = args.result.Properties;
        if ( args.result.Style.match(/drupal/i) ) { args.childClass = 'contentDrupal'; }
        this._super(args);
    }
    
};

site.endeca.results.contentzone.content = generic.endeca.results.contentzone.content;
