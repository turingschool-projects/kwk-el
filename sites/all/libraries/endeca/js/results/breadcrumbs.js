
generic.endeca.results.breadcrumbs = {
    initialize: function(args) {
        this.childClass = 'breadcrumb';
        this._super(args);
        
        if ( (typeof this.resultData.length == "undefined" && this.resultData ) || this.resultData.length ) {
            this.displayResults();
        }
    },
    
    displayResults: function() {
        this.resultData['Dimension Name RB Key'] = this.resultData['Dimension Name'].replace(/\W+/gi, "_").toLowerCase();        
        this.resultData['Dimension Name RB'] = site.endeca.generic.rb('endeca').get( 'dimension_' + this.resultData['Dimension Name RB Key'] );
        this.resultData['Dimension Description RB'] = site.endeca.generic.rb('endeca').get( 'dimension_' + this.resultData['Dimension Name RB Key'] + '.description' );
        
        var that = this;
        var rd = jQuery.map(this.resultData["Dimension Values"], function( dimVal ){ 
            return jQuery.extend( dimVal, { 
                "Dimension Name": that.resultData["Dimension Name"],
                "Dimension Name RB Key": that.resultData["Dimension Name RB Key"],
                "Dimension Name RB": that.resultData["Dimension Name RB"],
                "Dimension Description RB": that.resultData["Dimension Description RB"]
            });
        });
        
        this._super({
            resultData: this.resultData["Dimension Values"]
        });
        
        this.displayResultNodes();
    },
    
    createResult: function( args ) {
        args.templatePath = this.childTemplatePath || this.templatePath || "/templates/endeca/breadcrumbs/link.tmpl";
        
        if ( this.configuration.breadcrumbTemplates && this.configuration.breadcrumbTemplates[ this.resultData["Dimension Name RB Key"] ] ) {
            args.templatePath = this.configuration.breadcrumbTemplates[ this.resultData["Dimension Name RB Key"] ];
        }
        
        args.result['Dim Value Name RB Key'] = args.result['Dim Value Name'].replace(/\W+/gi, "_").toLowerCase();
        args.result['Dim Value Name RB'] = site.endeca.generic.rb('endeca').get( 'refinement_' + args.result['Dim Value Name RB Key'] );
        
        this._super( args );
    }
}; 

site.endeca.results.breadcrumbs = generic.endeca.results.breadcrumbs;
