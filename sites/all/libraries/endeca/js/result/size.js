
site.endeca.result.size = {
    initialize: function( args ) {
        this._super( args );
        this.templatePath = '/templates/endeca/products/size.tmpl';
        this.displayResult();
    },
    
    displayResultCallback: function( args ) {
        this.initListeners();
    },
    
    initListeners: function( args ) {
        var that = this;
        this.node.bind( 'click', that, function( event ) {
            var that = event.data;
            this.node.trigger( 'select.sku', that );
        });
    }
    
};
