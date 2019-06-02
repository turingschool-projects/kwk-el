
generic.endeca.resultsgroup.refinements = {
    
    initialize: function( args ) {
        this.moreRefinements = [];
        this._super( args );
    },
    
    displayResults: function( args ) {
        var args = args || {};
        
        args.childClass = 'refinements';
        this._super( args );
        
        var that = this;        
        jQuery('.expand-all').each( function( el, index ) {
            if ( that.moreRefinements.length ) {
                // Mixed in via endeca.mixins.links...
                if ( that.displayResultCallback ) { 
                    that.displayResultCallback({
                        "Selection Link" : 'Ne=' + that.moreRefinements().join('+'),
                        "node": el
                    }); 
                }
                el.show();
            } else {
                el.hide();
            }
        });
    },
    
    moreRefinements: function() {
        if ( this.moreRefinements.length ) {
            return this.moreRefinements;
        } else {
            for ( var i = 0; i < this.resultNodes.length; i++ ) {
                if ( this.resultNodes[i].moreRefinement ) { this.moreRefinements.push( this.resultNodes[i].moreRefinement ); }
            }
        }
    },
    
    reset: function( args ) {
        this.moreRefinements = [];
        this._super( args );
    }
    
};

site.endeca.resultsgroup.refinements = generic.endeca.resultsgroup.refinements;

