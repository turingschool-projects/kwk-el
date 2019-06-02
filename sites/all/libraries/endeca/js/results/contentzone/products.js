
generic.endeca.results.contentzone.products = {
        
    initialize: function( args ) {
        this.childClass = 'product';        
        this._super(args);
        this.query = null;
        this.totalProductResults = 0;
        var searchTerms = [];
        
        for ( var i = 0; i < this.resultData.length; i++ ) {
            for ( var j = 0; j < this.resultData[i]['Records'].length; j++ ) {
                searchTerms.push(this.resultData[i]['Records'][j]["Record Spec"]);
                this.totalProductResults++;
            }
        }
        
        this.query = new site.endeca.query( jQuery.extend({ 
                callbackCompleted: site.endeca.helpers.func.bind( this.searchCompleted, this ),
                searchMode: 'matchany',
                searchTerm: searchTerms.join(' '),
                searchKey: 'rec_id'
            }, 
            site.endeca.configuration.query,
            this.configuration.queryArgs || {}
        ));
        
        this.query.prepare();
        this.query.execute();
    },
    
    searchCompleted: function() {
        var productCatalog = new site.endeca.catalog.product({ jsonResult: this.query.jsonResult });
        
        this.displayResults({ resultData: productCatalog.getProducts() });
        this.displayResultNodes();
    },
    
    createResult: function( args ) {
        args.result.context = 'featured-product';
        args.result.callout = site.endeca.generic.rb('endeca').get('callout.featured-product');
        this._super(args);
    }
    
};

site.endeca.results.contentzone.products = generic.endeca.results.contentzone.products;
