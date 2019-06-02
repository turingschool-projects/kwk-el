
generic.endeca.mixins.summary = { 
    
    initialize: function( args ) {
        this._super(args);
        
        this.summaryResultData = { totalRecords: this.resultData.length };
        this.summaryResultData.resultText = this.summaryResultData.totalRecords == 1 ? site.endeca.generic.rb('endeca').get('result') : site.endeca.generic.rb('endeca').get('results');
    },
    
    setupNodes: function( args ) {
        var args = args || {};    
        this._super(args);
        if ( this.node ) {
            this.summaryNode = this.node.find('.results-summary').length ? this.node.find('.results-summary') : null;
        }
    },
    
    displayResults: function( args ) {
        this._super(args);
        this.setupSummary();
    },
    
    setupSummary: function() {
        if ( this.summaryNode && this.configuration.summaryTemplatePath && this.summaryResultData ) {
            this.summary = new site.endeca.result({
                parentNode: this.summaryNode,
                templatePath: this.configuration.summaryTemplatePath,
                resultData: this.summaryResultData
            });
            this.summary.displayResult();
        }
    },
    
    reset: function( args ) {
        this._super(args);
        if ( this.summaryNode ) { this.summaryNode.empty() }
    }
};

site.endeca.mixins.summary = generic.endeca.mixins.summary;
