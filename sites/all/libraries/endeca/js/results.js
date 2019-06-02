
/*
    Endeca results class
    This class represents a container of result classes (refinements, products, etc).
    
    Required Arguments:
        resultData: array describing the results
        templatePath: path of the template to be used for each result created
        parentNode: node for each result node to be inserted into
    Optional Arguments:
        containerTemplatePath: path to a container template. If provided, this.node will be set to the inserted element. 
        
    
    Optional CSS Selectors:
        results-header: this.headerNode will be set to a child of this.parentNode with class results-header
        results: this.contentNode will be set to a child of this.parentNode with class results. If there is no element with .results, this.node will be set as the contentNode.
        
        
    this.node will represent either of the following:
        1. If you provided a containerTemplatePath, this.node will be the inserted container
        2. If containerTemplatePath has not been provided, this.node will be set to this.parentNode
    

*/

generic.endeca.results = site.endeca.generic.Class.create({
    initialize: function( args ) {
        this.parentNode = null; // Node in which this results container will be inserted
        this.node = null; // Container node for results data - same as this.parentNode if there is no template in this class
        this.headerNode = null; // Header node for results data header, eg "Product Results", Refinement Headers
        this.contentNode = null; // Container node for individual result classes
        
        this.resultData = [];
        this.resultNodes = [];
        
        this.resultClass = null;
        
        this.configuration = {};
        this.mixins = {};
        
        jQuery.extend(this, args);
    },
    
    setupNodes: function( args ) {
        var args = args || {};
        var parentNode = args.parentNode || this.parentNode;
        var containerTemplatePath = args.containerTemplatePath || this.containerTemplatePath;
        this.node = parentNode || args.node;
        if ( this.node ) {
            if ( containerTemplatePath ) { this.loadContainer( { parentNode: parentNode, containerTemplatePath: containerTemplatePath } ); }
            this.headerNode = this.node.find('.results-header:first').length ? this.node.find('.results-header:first') : null;
            this.contentNode = this.node.find('.results:first').length ? this.node.find('.results:first') : this.node;
        }
    },
    
    /*
        create result classes for each element in the resultData array. 
    */
    displayResults: function( args ) {
        var args = args || {};
        args.childClass = args.childClass || this.childClass;
        
        this.setupNodes( args );
        
        var resultData = args.resultData || this.resultData;
        
        var that = this;
        jQuery.each( resultData, function(index, result) {
            that.createResult( jQuery.extend( args, {
                result: result,
                index: index
            }));
        });
    },
    
    loadContainer: function( args ) {
        var args = args || {};
        var templatePath = args.containerTemplatePath || this.containerTemplatePath;
        var that = this;
        site.endeca.generic.template.get({
            path: templatePath,
            object: args.resultData || that.resultData,
            rb: rb ? rb.endeca : null,
            callback: function(html) {
                html = jQuery.trim(html);
                if ( html ) {
                    that.node = jQuery(html);
                    if ( args.parentNode && that.node ) {
                        args.parentNode.append( that.node );
                    }
                }
            }
        });
    },
    
    createResult: function( args ) {
        var args = args || {};
        
        this.setResultClass( args );
        
        var result = new this.resultClass({
            parent: this,
            templatePath: args.templatePath || this.templatePath,
            resultData: args.result,
            parentNode: args.contentNode || this.contentNode,
            configuration: args.configuration || this.configuration,
            mixins: args.mixins || this.mixins
        });
        this.resultNodes.push( result ); 
    },
    
    /*
        Determine which class to use in displayResults.
        This will usually be specified in the subclass inheriting from this class. 
    */
    setResultClass: function ( args ) {
        var args = args || {};
        var baseClass = args.baseClass || this.baseClass || site.endeca.result;
        
        if ( !this.resultClass ) {
            args.childClass = args.childClass || this.childClass || "";
            var mixins = args.mixins || this.mixins[ this.resultMixinKey ] || this.mixins['result.' + args.childClass] || this.mixins['result'] || {};
            this.resultClass = args.childClass && baseClass[args.childClass] ? site.endeca.generic.Class.create( site.endeca.generic.Class.mixin( baseClass, mixins ), baseClass[args.childClass] ) : site.endeca.generic.Class.mixin( baseClass, mixins );
        }
    },
    
    displayResultNodes: function () {
        for ( var i = 0; i < this.resultNodes.length; i++ ) {
            this.resultNodes[i].displayResult();
        }
        
        if ( this.resultNodes.length ) {
            if ( this.resultNodes[0].node ) { this.resultNodes[0].node.addClass('first'); }
            if ( this.resultNodes[this.resultNodes.length-1].node ) { this.resultNodes[this.resultNodes.length-1].node.addClass('last'); }
        }
    },
    
    hide: function() {
        this.parentNode.hide();
    },
    
    show: function() {
        this.parentNode.show();
    },
        
    reset: function() {
        if ( this.containerTemplatePath ) { 
            if ( this.node ) { this.node.remove(); }
        } else { 
            if ( this.contentNode ) { this.contentNode.empty(); }
            else if ( this.node ) { this.node.empty(); }
        }
        
        this.resultData = [];
        this.resultNodes = [];
    }
});

site.endeca.results = generic.endeca.results;
