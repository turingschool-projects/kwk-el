
/*
    Endeca result class
    This class represents ONE result ( dom element ) on the page. Each of these results represents one item returned from endeca (product result, content result, refinement link, etc)
    
    Required Arguments:
        resultData: data describing the result, must be a JS obj
        templatePath: path of the template to populate with the resultData
        parentNode: node for the template to be inserted into
        
    this.node will represent the node that has been inserted into the page after the template is rendered.
    

*/

generic.endeca.result = site.endeca.generic.Class.create({
    initialize: function( args ) {
        this.parentNode = null;
        this.node = null;
        this.resultData = null;
        this.templatePath = null;
        
        jQuery.extend( this, args || {} );
    },
    
    displayResult: function( args ) {
        var args = args || {};
        var parentNode = args.parentNode || this.parentNode;
        var that = this;
        site.endeca.generic.template.get({ 
            path: that.templatePath,
            object: args.resultData || that.resultData,
            rb: rb ? rb.endeca : null,
            callback: function(html) {
                html = jQuery.trim(html);
                if ( html ) {
                    that.node = jQuery(html);
                    if ( parentNode && that.node ) {
                        parentNode.append( that.node );
                    }
                    that.displayResultCallback(args);
                }
            }
        });
    },
    
    displayResultCallback: function( args ) { /* Define this in your subclass */ },
    
    reset: function() {
        if ( this.node && this.parentNode && this.node != this.parentNode ) {
            this.node.remove();
        } else {
            this.parentNode.empty();
        }
    },  
    
    hide: function() {
        this.parentNode.hide();
    },
    
    show: function() {
        this.parentNode.show();
    }
});

site.endeca.result = generic.endeca.result;
