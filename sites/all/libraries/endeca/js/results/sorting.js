
generic.endeca.results.sorting = {

    initialize: function( args ) {
        this._super(args);
        this.displayResults();
    },
    
    displayResults: function( args ) {
        this._super( args );
        this.displayResultNodes();
    },
    
    createResult: function( args ) {
        var args = args || {};
        
        if ( args.result['Sort Order'] ) {
            args.templatePath = this.configuration.currentTemplatePath || "/templates/endeca/sort/current.tmpl";
        } else {
            args.templatePath = this.configuration.linkTemplatePath || "/templates/endeca/sort/link.tmpl";
        }
        
        args.result['Sort Key RB'] = args.result['Sort Key'] ? site.endeca.generic.rb('endeca').get( 'sorting_' + args.result['Sort Key'].toLowerCase() ) : "";
        
        this._super(args);
    }
};


site.endeca.results.sorting = generic.endeca.results.sorting;
