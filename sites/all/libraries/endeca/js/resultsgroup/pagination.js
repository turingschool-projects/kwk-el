
generic.endeca.resultsgroup.pagination = {
    
    displayResults: function( args ) {
        var args = args || {};
        
        args.childClass = 'pagination';
        
        var that = this;
        jQuery('.pagination').each( function() {
            that.parentNode = jQuery(this);
            args.resultData = [that.resultData];
            that._super(args);
        });
    }
};

site.endeca.resultsgroup.pagination = generic.endeca.resultsgroup.pagination;

