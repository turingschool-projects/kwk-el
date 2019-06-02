
generic.endeca.results.products = {
        
    initialize: function( args ) {
        this.childClass = 'product';
        this._super( args );
    },
    
    displayResults: function( args ) {
        var args = args || {};
        this._super( args );
        this.displayResultNodes();
    },
    
    createResult: function( args ) {
        args.templatePath = this.childTemplatePath || "/templates/endeca/products/result.tmpl";
        args.result.context = 'product';
        this._super( args );
    }    
};

site.endeca.results.products = generic.endeca.results.products;
