
generic.endeca.results.contentzone = site.endeca.generic.Class.create( site.endeca.results, {
    
    displayResults: function( args ) {
        var args = args || {};
        
        // setting this here doesn't allow for different styles per result -- so you can only have one containerTemplate per zone and it will always be for the first result, this is clunky
        this.zoneName = this.resultData[0].Properties.Zone;
        this.styleName = this.resultData[0].Properties.Style;
        
        this.styleConfig = this.configuration.styles && this.configuration.styles[ this.styleName ] ? 
            this.configuration.styles[ this.styleName ] :
            undefined;
        
        args.containerTemplatePath = this.configuration.containerTemplatePath;
        
        if ( typeof this.configuration.containerTemplatePath == "object" ) {
            args.containerTemplatePath = this.configuration.containerTemplatePath[ this.styleName ]
        } else if ( this.styleConfig && this.styleConfig.containerTemplatePath ) {
            args.containerTemplatePath = this.styleConfig.containerTemplatePath;
        }
        
        this._super(args);
    },
    
    createResult: function( args ) {
        var args = args || {};
        
        // checking this here allows for resultsets with different styles/templates in each result. 
        var styleName = ( args.result.Properties && args.result.Properties.Style ) ? args.result.Properties.Style : this.styleName;
        
        args.templatePath = this.configuration.templatePath;
        
        if ( typeof this.configuration.templatePath == "object" ) {
            args.templatePath = this.configuration.templatePath[ styleName ]
        } else if ( this.styleConfig && this.styleConfig.templatePath ) {
            args.templatePath = this.styleConfig.templatePath;
        }
            
        this._super(args);
    }
    
});

site.endeca.results.contentzone = generic.endeca.results.contentzone;
