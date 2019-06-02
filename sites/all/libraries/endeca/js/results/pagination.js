
generic.endeca.results.pagination = {

    initialize: function( args ) {
        this._super(args);
        this.displayResults();
    },
    
    displayResults: function() {
        if ( this.resultData ) {
            this.setupNodes();
            
            if ( this.resultData.viewAllLink && this.configuration.viewAllLink ) {
                this.createResult({
                    templatePath: this.configuration.viewAllPageTemplatePath || "/templates/endeca/pagination/viewall.tmpl",
                    result: { "Selection Link": this.resultData.viewAllLink }
                });
            }            
        
            if ( this.resultData.previousPageLink && this.configuration.previousPageLink ) {
                this.createResult({
                    templatePath: this.configuration.previousPageTemplatePath || "/templates/endeca/pagination/previous.tmpl",
                    result: { "Selection Link": this.resultData.previousPageLink }
                });
      		}
      		
      		var oldContentNode = this.contentNode;
      		if ( this.configuration.containerTemplatePath ) {
      		    this.containerTemplatePath = this.configuration.containerTemplatePath
      		    this.setupNodes();
          	}
      		
      		if ( this.resultData.directPageLinks ) {
      		    for ( var i = 0; i < this.resultData.directPageLinks.length; i++ ) {
          		    this.createResult({
        	            templatePath: this.resultData.numberOfCurrentPage == i+1 ?  this.configuration.currentTemplatePath || "/templates/endeca/pagination/current.tmpl" :  this.configuration.linkTemplatePath || "/templates/endeca/pagination/link.tmpl",
                        result: { "Selection Link": this.resultData.directPageLinks[i], "Content": i+1 }
                    });
          		}
      		}
      		
      		this.contentNode = oldContentNode;
      		        
            if ( this.resultData.nextPageLink && this.configuration.nextPageLink ) {
                this.createResult({
                    templatePath: this.configuration.nextPageTemplatePath || "/templates/endeca/pagination/next.tmpl",
                    result: { "Selection Link": this.resultData.nextPageLink }
                });
      		}
      		
      		this.displayResultNodes();
        }
    },
    
    setupSummary: function () {
        return;
        if ( this.paginationSummaryNode ) {
            if ( this.summaryResultData && this.summaryResultData.totalProductRecords > 1 ) {
                var templatePath = "endeca.templates.pagination.summary.shown";            
                if ( this.resultData && this.resultData.numberOfCurrentPage == 1 ) {
                    templatePath = "endeca.templates.pagination.summary.topShown";
                }
                
                this.createResult({
                    templatePath: templatePath,
                    result: this.summaryResultData,
                    contentNode: this.paginationSummaryNode
                });
            }
            
            if ( this.resultData && this.resultData.nextPageLink ) {
                this.createResult({
                    templatePath: "endeca.templates.pagination.summary.next",
                    result: { "Selection Link": this.resultData.nextPageLink },
                    contentNode: this.paginationSummaryNode
                });
            }
            
            if ( this.summaryResultData ) {
                var templatePathView = null;
                var queryArgs = null;
                if ( this.summaryResultData.startingRecord == 1 && this.summaryResultData.endingRecord > 10 ) {
                    templatePathView = "endeca.templates.pagination.summary.viewLess";
                    queryArgs = {};
                } else if ( this.summaryResultData.totalProductRecords > 10 ) {
                    templatePathView = "endeca.templates.pagination.summary.viewAll";
                    queryArgs = { recordsPerPage: 10000 }
                }
                
                if ( templatePathView ) {
                    var query = new site.endeca.base.query(queryArgs);
                    this.createResult({
                        templatePath: templatePathView,
                        result: { "Selection Link": query.toQueryString() },
                        contentNode: this.paginationSummaryNode
                    }); 
                }
            }
            
        }
    }
};

site.endeca.results.pagination = generic.endeca.results.pagination;

