
generic.endeca.mixins.links.event = jQuery.extend( {
    onClick: function( event ) {
        var that = event.data.that;
        jQuery(document).trigger( 'link:clicked', event.data.link );
        event.preventDefault();
        return false;
    }
}, site.endeca.mixins.links );

site.endeca.mixins.links.event = generic.endeca.mixins.links.event;
