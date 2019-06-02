
/*
    This can be used in conjunction with other mixins if placed last in the mixins array.
*/

generic.endeca.mixins.delayedClick = {
    onClick: function( event ) {
        var that = event.data.that;
        
        var _super = this._super;
        
        that.delayedClickNode = 
            ( that.delayedClickNode && that.delayedClickNode.length ) ? that.delayedClickNode : 
            ( that.node && that.node.find('.delayed-click:first').length ) ? that.node.find('.delayed-click:first') : 
            ( that.parentNode && that.parentNode.find('.delayed-click:first').length ) ? that.parentNode.find('.delayed-click:first') : 
            ( that.parent && that.parent.node && that.parent.node.find('.delayed-click:first').length ) ? that.parent.node.find('.delayed-click:first') : [];
        
        if ( that.delayedClickNode.length ) {
            event.preventDefault();
            that.delayedClickNode.unbind( 'click.delayed' );
            
            if ( !that.isDelayed() ) {
                that.addDelay( _super, event.data );
            } else {
                that.removeDelay();
            }
            
            return false;
        } else {
            return _super( event );
        }
    }, 
    
    addDelay: function( _super, data ) {
        var that = this;
        
        that.delayedClickNode.bind( 'click.delayed', data, _super );
        that.node.siblings('.delayed').removeClass('delayed');
        that.node.addClass('delayed');
        that.node.trigger( 'delay.added', that );
    },
    
    removeDelay: function () {
        var that = this;
        
        that.node.removeClass('delayed');
        that.node.trigger( 'delay.removed', that );
    },
    
    isDelayed: function() {
        return this.node.hasClass('delayed');
    }
};

site.endeca.mixins.delayedClick = generic.endeca.mixins.delayedClick;
