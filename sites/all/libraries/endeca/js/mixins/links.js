
generic.endeca.mixins.links = {        
    displayResultCallback: function( args ) {
        var args = args || { };
        args.resultData = args.resultData || this.resultData;
        var node = args.node || args.parentNode || this.node || this.parentNode;
        node = node.find('.link-mixin').length ? node.find('.link-mixin') : 
               node.find('a').length ? node.find('a') : node;
               
        var link = args["Selection Link"] || args.resultData["Selection Link"] || args.resultData["Removal Link"] || node.attr( 'rel' );
        
        if ( link && node ) {
            var that = this;
            node.bind( 'click', { that: that, link: link }, that.onClick );
            node.bind( 'simulate:click', { that: that, link: link }, that.onClick );
            
            if ( node.href ) { 
                var params = site.endeca.generic.env.parsedQuery();
                params['qs'] = encodeURIComponent(link);
        
                var url = document.location.pathname + "?" + jQuery.param(params);
                node.href = url;
            }
        }
    }
};

site.endeca.mixins.links = generic.endeca.mixins.links;

