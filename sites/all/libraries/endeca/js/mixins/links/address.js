
generic.endeca.mixins.links.address = jQuery.extend( {
    onClick: function( event ) {
        var that = event.data.that;
        jQuery.address.value( "?" + event.data.link );
        if (    that.configuration.scrollTo &&
                that.configuration.scrollTo.length ) {
            jQuery(window).scrollTop( that.configuration.scrollTo.position().top );
        } else if ( !( that.noScroll || that.configuration.noScroll ) ) {
            scroll(0,0)
        }
        event.preventDefault();
        return false;
    }
}, site.endeca.mixins.links );

site.endeca.mixins.links.address = generic.endeca.mixins.links.address;
