
generic.endeca.result.summary = {
    displayResult: function( args ) {
        var args = args || {};

        var templates = jQuery.extend( {
            results: '/templates/endeca/summary/results.tmpl',
            noResults: '/templates/endeca/summary/no-results.tmpl',
            noTerm: '/templates/endeca/summary/no-term.tmpl',
            autoCorrect: '/templates/endeca/summary/auto-correct.tmpl',
            didYouMean: '/templates/endeca/summary/did-you-mean.tmpl'
        }, ( this.configuration.templatePaths || {} ) );
        
        if ( this.resultData.searchTerm == "" ) { this.templatePath = templates['noTerm'] }
        else if ( this.hasResults ) { 
            this.templatePath = templates['results'];
            
            this.resultData.productAnchorLinkDisplay = this.resultData.totalProductRecords > 0 ? 'inline' : 'none';
            this.resultData.contentAnchorLinkDisplay = this.resultData.totalContentRecords > 0 ? 'inline' : 'none';
            this.resultData.productResultText += this.resultData.totalContentRecords > 0 ? ',' : '';
            
        } else { this.templatePath = templates['noResults'] }
        this._super(args);
        
        var searchTerms = this.node.find('.searchTerms');
        if ( this.resultData.breadcrumbs && searchTerms.length ) {
            var breadcrumbs = [];
            for ( var i = 0; i < this.resultData.breadcrumbs.length; i++ ) {
                for ( var j = 0; j < this.resultData.breadcrumbs[i]['Dimension Values'].length; j++ ) {
                    breadcrumbs.push( ', "' + this.resultData.breadcrumbs[i]['Dimension Values'][j]['Dim Value Name'] + '"' );
                }
            }
            searchTerms.append( breadcrumbs.join("") );
        }
        
        var acElement = this.node.find('#auto-correct');
        if ( this.resultData.correctedTerms && this.resultData.correctedTerms.length && acElement.length ) { 
            this.templatePath = templates['autoCorrect'];
            args.resultData = this.resultData;
            args.resultData.correctedTerm = this.resultData.correctedTerms.join(',');
            args.parentNode = acElement;
            this._super(args)
        }
        
        var dymElement = this.node.find('#did-you-mean');
        if ( this.resultData.didYouMean &&this.resultData.didYouMean.length && dymElement.length ) { 
            this.templatePath = templates['didYouMean'];
            args.resultData = this.resultData.didYouMean[0]; // Only handle the first did you mean term
            args.parentNode = dymElement;
            this._super(args)
        }
    },
    
    reset: function() {
        this.parentNode.empty();
    }
};

site.endeca.result.summary = generic.endeca.result.summary;
