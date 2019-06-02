
generic.endeca.results.bestsellers = {
        
    initialize: function( args ) {
        this.childClass = 'product';
        this._super( args );
    },
    
    displayResults: function() {
        var that = this;
        
        this.query = new site.endeca.query( jQuery.extend({ 
                callbackCompleted: function() {
                    var productCatalog = new site.endeca.catalog.product({ jsonResult: that.query.jsonResult });
                    that.resultData = productCatalog.getProducts();
                    
                    that._super();
                    that.displayResultNodes();
                    if ( typeof that.configuration.queryCallback == 'function' ) {
                        that.configuration.queryCallback();
                    }
                }
            }, 
            site.endeca.configuration.query,
            this.configuration.queryArgs || {}
        ));
        
        this.query.prepare();
        this.query.execute();
    },
    
    createResult: function( args ) {
        args.result.context = 'bestseller-product';
        args.templatePath = this.childTemplatePath || this.templatePath || "/templates/endeca/products/bestseller-result.tmpl";
        this._super(args);
    }
};

site.endeca.results.bestsellers = generic.endeca.results.bestsellers;
