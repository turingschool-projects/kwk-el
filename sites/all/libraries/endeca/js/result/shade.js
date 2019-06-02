
generic.endeca.result.shade = {
    initialize: function( args ) {
        this._super( args );
        this.templatePath = this.configuration.shadeTemplatePath || '/templates/endeca/products/shade.tmpl';
        this.displayResult();
    },
    
    displayResultCallback: function( args ) {
        this.drawSwatch();
        if ( ! this.configuration.suppressShadeEvents ) {
            this.initListeners();
        }
    },
    
    // Clinique style drawSwatch - this can be customized at the SITE level
    drawSwatch: function( args ) {
        if (!this.resultData.HEX_VALUE_STRING || this.resultData.HEX_VALUE_STRING.length < 1) {
            return;
        }
        
        var swatchContainerNode = this.node.find('.search-swatch-container');
        //var swatchWidth = swatchContainerNode.css('width');
        //swatchWidth = parseInt( swatchWidth.replace('px', '') );
                
        var hexVals = this.resultData.HEX_VALUE_STRING.split(',');
        //var swatchShadeWidth = Math.ceil(swatchWidth/hexVals.length);
        
        for (var i=0; i<hexVals.length; i++) {
            var d = jQuery("<div/>");
            d.css({ 
                //width: swatchShadeWidth + "px",
                'background-color': hexVals[i] 
            });
            if ( i == 0 ) { d.addClass('first'); }
            if ( i == hexVals.length-1 ) { d.addClass('last') }
            if ( hexVals.length == 1 ) { d.addClass('single') }
            
            swatchContainerNode.append(d);
        }
        
        swatchContainerNode.css('width', 'auto');  
    },
    
    initListeners: function( args ) {
        var that = this;
        this.node.bind( 'click', that, function( event ) {
            var that = event.data;
            that.selectShade();
        });
    },
    
    selectShade: function( args ) {
        this.node.siblings('.shade').removeClass('active');
        this.node.addClass('active');
        this.node.trigger( 'select.sku', this );
    }
};

site.endeca.result.shade = generic.endeca.result.shade;
