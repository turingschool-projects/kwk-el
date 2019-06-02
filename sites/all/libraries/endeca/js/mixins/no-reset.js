
generic.endeca.mixins.noReset = {
    displayResults: function( args ) {
        if ( this.resultNodes.length == 0 ) {
            this._super( args );
        }
    },
    reset: function() {}
};

site.endeca.mixins.noReset = generic.endeca.mixins.noReset;
