
generic.endeca.result.contentDrupal = {
    displayResult: function( args ) {
        var args = args || {};
        
        var resultData = args.resultData || this.resultData;
        var parentNode = args.parentNode || this.parentNode;
        
        if ( resultData.drupal_node_id ) {
            jQuery.ajax({
                url: '/' + Drupal.settings.pathPrefix + 'elc_api/endeca_content_result/' + resultData.drupal_node_id,
                context: this,
                complete: function( args ) {
                    var html = args.responseText;
                    html = jQuery.trim(html);
                    if ( html ) {
                        this.node = jQuery(html);
                        if ( parentNode && this.node ) {
                            parentNode.append( this.node );
                        }
                        
                        this.displayResultCallback(args);
                    }
                }
            });
        }
    }
};


site.endeca.result.contentDrupal = generic.endeca.result.contentDrupal;
