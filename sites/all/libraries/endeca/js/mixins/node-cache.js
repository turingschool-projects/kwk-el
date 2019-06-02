
/*
    This mixin is used to save the state of the selected node after it is clicked.
*/

generic.endeca.mixins.nodeCache = {
    initialize: function( args ) {
        this._super( args );
        
        this.cachedNode = [];
        this.previouslyCachedNode = [];
        this.nodeCacheUseParent = this.nodeCacheUseParent || 0;
        
        this.nodeCacheNode = ( this.nodeCacheNode && this.nodeCacheNode.length ) ? this.nodeCacheNode : [];
        this.nodeCacheRestoreNode = ( this.nodeCacheRestoreNode && this.nodeCacheRestoreNode.length ) ? this.nodeCacheRestoreNode : [];
        
        if ( !this.nodeCacheNode.length ) {
            if ( this.parent && this.parent.nodeCacheNode && this.parent.nodeCacheNode.length ) {
                this.nodeCacheNode = this.parent.nodeCacheNode;
                this.nodeCacheUseParent = 1;
            }
        }
        
        if ( !this.nodeCacheRestoreNode.length ) {
            if ( this.parent && this.parent.nodeCacheRestoreNode && this.parent.nodeCacheRestoreNode.length ) {
                this.nodeCacheRestoreNode = this.parent.nodeCacheRestoreNode;
                this.nodeCacheUseParent = 1;
            }
        }
        
        this.nodeCacheKey = this.nodeCacheUseParent ? this.parent.resultData[this.configuration.nodeCacheKey] : this.resultData[this.configuration.nodeCacheKey];
    },
    
    displayResult: function( args ) {
        if ( this.isCached() && !this.nodeCacheRestoreNode.length ) {
            this.clearCache();
        }
        this._super( args );
    },
    
    onClick: function( event ) {
        event.preventDefault();
        var that = event.data.that || event.data;        
        
        var _super = this._super || function() {};
        
        if ( that.nodeCacheNode.length ) {
            if ( that.isCached() ) {
                that.loadFromCache();
                return;
            } else if ( that.node.hasClass('recache') && that.previouslyCachedNode.length ) {
                that.recache({ data: that });
                return;
            } else if ( that.node.hasClass('recache') && that.isRestored() ) {
                that.recache({ data: that });
                return;
            } else {
                that.saveToCache();
            }
        }
        
        return _super( event );
    },  
        
        
    isCached: function() {
        this.cachedNode = this.nodeCacheNode.find( "[nodeCacheKey='" + this.nodeCacheKey + "']" );
        return this.cachedNode.length ? 1 : 0;
    },
    
    isRestored: function() {
        this.previouslyCachedNode = this.nodeCacheRestoreNode.find( "[nodeCacheKey='" + this.nodeCacheKey + "']" );
        return this.previouslyCachedNode.length ? 1 : 0;
    },
    
    saveToCache: function() {
        var that = this;
        
        this.node.trigger( 'savedToCache.before', that );
        
        var node = this.nodeCacheUseParent ? this.parent.node : this.node;
        if ( this.nodeCacheUseParent ) {
            this.parent.reset = function() {};
        }
        
        node.attr( 'nodeCacheKey', this.nodeCacheKey );
        this.clearCache();
        this.nodeCacheNode.append(node);
        
        this.node.trigger( 'savedToCache.after', that );
    },
    
    loadFromCache: function() { 
        var that = this;
        
        this.node.trigger( 'loadedFromCache.before', that );
        var restoreNode = 
            ( this.nodeCacheRestoreNode && this.nodeCacheRestoreNode.length ) ? this.nodeCacheRestoreNode :
            ( this.nodeCacheUseParent ) ? this.parent.parentNode : this.parentNode;
            
        var recacheNode = this.cachedNode.find( '.recache:first' );
        recacheNode.unbind( 'click' );
        recacheNode.bind( 'click', this, this.recache );
        restoreNode.append( this.cachedNode );
        
        this.previouslyCachedNode = this.cachedNode;
        this.node.trigger( 'loadedFromCache.after', that );
    },
    
    recache: function( event ) {
        var that = event.data;
        if ( that.previouslyCachedNode.length == 0 ) { return; }
        that.previouslyCachedNode.trigger( 'recached.before', that );
        that.nodeCacheNode.append( that.previouslyCachedNode );
        that.previouslyCachedNode.trigger( 'recached.after', that );
    },
    
    clearCache: function() {
        this.cachedNode.remove();
    }
};

site.endeca.mixins.nodeCache = generic.endeca.mixins.nodeCache;
