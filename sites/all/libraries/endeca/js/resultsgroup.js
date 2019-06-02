
/*
    Endeca resultsgroup class
    This class represents a group of results classes (all refinments, all pagination blocks, all content zones, etc).
    This class inherits from generic.endeca.results, overwriting the createResult function in order to create new results classes as opposed to new result classes.
    
    Additionally, when instantiating this class, you can pass in an obj called resultsArgs, the contents of which will be passed directly to any results class that is instantiated in createResult. 
*/

generic.endeca.resultsgroup = site.endeca.generic.Class.create( site.endeca.results, {
        
    initialize: function( args ) {
        this.baseClass = site.endeca.results;
        this._super( args );
    },
    
    displayResults: function( args ) {
        var args = args || {};
        var that = this;
        
        if ( that.parentNode && that.parentNode.length > 1 ) {
            that.parentNode.each( function() {
                args.parentNode = jQuery(this);
                that._super( args );
            });  
        } else {
            that._super( args );
        }
    },

    createResult: function( args ) {
        var args = args || {};
        
        args.childClass = this.resultsChildClass || args.childClass;
        args.mixins = args.mixins || this.mixins[ this.resultsMixinKey ] || this.mixins['results.' + args.childClass] || this.mixins['results'];        
        this.setResultClass( args );
        
        var result = new this.resultClass( jQuery.extend( { 
            parent: this,
            resultData: args.result,
            parentNode: this.contentNode || this.node || this.parentNode,
            summaryResultData: this.summaryResultData,
            mixins: this.mixins,
            configuration: args.configuration || this.configuration
        }, args.resultsArgs || this.resultsArgs || {} ) ); 
        this.resultNodes.push( result );
    },
    
    reset: function() {
        for ( var i = 0; i < this.resultNodes.length; i++ ) {
            this.resultNodes[i].reset();
        }
        this._super();
    }

}); 

site.endeca.resultsgroup = generic.endeca.resultsgroup;
