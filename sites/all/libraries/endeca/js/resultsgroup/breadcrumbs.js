
generic.endeca.resultsgroup.breadcrumbs = {
    displayResults: function( args ) {
        var args = args || {};
        args.childClass = 'breadcrumbs';
        this._super(args);
        
        var that = this;        
        jQuery('.clear-all').each( function( index, el ) {
            var $this = jQuery(this);
            // Mixed in via endeca.mixins.links...
            if ( that.displayResultCallback ) { 
                that.displayResultCallback({
                    "Selection Link" : ' ',
                    "node": $this
                }); 
                $this.show();
            } else {
                $this.hide();
            }
        });
    }
};

site.endeca.resultsgroup.breadcrumbs = generic.endeca.resultsgroup.breadcrumbs;

