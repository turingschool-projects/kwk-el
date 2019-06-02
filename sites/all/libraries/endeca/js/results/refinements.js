
generic.endeca.results.refinements = {
    
    initialize: function( args ) {
        this.containerTemplatePath = '/templates/endeca/refinements/container.tmpl';
        this.childClass = 'refinement';
        this.moreRefinement = null;
        this.refinementIDs = {};
        this._super( args );
        
        this.resultData['Dimension Name RB Key'] = this.resultData['Dimension Name'].replace(/\W+/gi, "_").toLowerCase();        
        this.resultData['Dimension Name RB'] = site.endeca.generic.rb('endeca').get( 'dimension_' + this.resultData['Dimension Name RB Key'] );
        this.resultData['Dimension Description RB'] = site.endeca.generic.rb('endeca').get( 'dimension_' + this.resultData['Dimension Name RB Key'] + '_description' );

        if ( this.configuration.refinementContainerTemplates && this.configuration.refinementContainerTemplates[ this.resultData["Dimension Name RB Key"] ] ) {
            this.containerTemplatePath = this.configuration.refinementContainerTemplates[ this.resultData["Dimension Name RB Key"] ];
        }
        
        this.displayResults({
            resultData: this.resultData["Dimension Values"]
        });
        
        this.displayResultNodes();
    },
    
    createResult: function( args ) {        
        args.templatePath = this.childTemplatePath || this.templatePath || "/templates/endeca/refinements/link.tmpl";
        
        if ( this.configuration.refinementTemplates && this.configuration.refinementTemplates[ this.resultData["Dimension Name RB Key"] ] ) {
            args.templatePath = this.configuration.refinementTemplates[ this.resultData["Dimension Name RB Key"] ];
        }
        
        if ( this.configuration.resultMixinKeys && this.configuration.resultMixinKeys[ this.resultData["Dimension Name RB Key"] ] ) {
            args.mixins = this.mixins[ 
                this.configuration.resultMixinKeys[ this.resultData["Dimension Name RB Key"] ]
            ];
        }
                
        if ( this.resultData["Dim Value Properties"] && this.resultData["Dim Value Properties"]["DGraph.More"] && args.result["Dim Value Name"] == "More..." ) {
            args.templatePath = "/templates/endeca/refinements/show-all.tmpl";
            this.moreRefinement = args.result["Dim Value ID"];
        } else {
            this.refinementIDs[ args.result["Dim Value ID"] ] = 1;
            args.result['Dim Value Name RB Key'] = args.result['Dim Value Name'].replace(/\W+/gi, "_").toLowerCase();        
            args.result['Dim Value Name RB'] = site.endeca.generic.rb('endeca').get( 'refinement_' + args.result['Dim Value Name RB Key'] );
            args.result['Dim Value Description RB'] = site.endeca.generic.rb('endeca').get( 'refinement_description_' + args.result['Dim Value Name RB Key'] );
        }
        
        this._super( args );
    },
    
    reset: function( args ) {
        this.refinementIDs = {};
        this._super( args );
    }

}; 

site.endeca.results.refinements = generic.endeca.results.refinements;
