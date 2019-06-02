
generic.endeca.mixins.accordion = { 
    initialize: function( args ) {
        this._super(args);
        
        this.accordionHeaderNode = [];
        this.accordionContentNode = [];
        this.accordionCloseNode = [];
    },
       
    displayResults: function( args ) {
        this._super(args);
        this.setupAccordion();
    },
    
    setupAccordion: function() {
        this.accordionHeaderNode = this.node.find('.accordion-header:first');
        this.accordionContentNode = this.node.find('.accordion-content:first');
        this.accordionCloseNode = this.node.find('.accordion-close:first');
        
        if ( this.accordionHeaderNode.length && this.accordionContentNode.length ) {
            var that = this;
            this.accordionHeaderNode.unbind( 'click' );
            this.accordionHeaderNode.bind( 'click', { that: that }, that.onClick );
            
            if ( this.accordionCloseNode.length ) { 
                this.accordionCloseNode.unbind( 'click' );
                this.accordionCloseNode.bind( 'click', { that: that }, that.closeAccordion );
            }
        }
    },
    
    onClick: function( event ) {
        event.preventDefault();
        
        var that = event.data.that;
        that.toggleAccordion();
        
        return false;
    },
    
    accordionIsOpen: function() {
        return ! this.accordionHeaderNode.hasClass('collapsed');
    },
    
    accordionIsClosed: function() {
        return this.accordionHeaderNode.hasClass('collapsed');
    },
    
    toggleAccordion: function() {
        if ( ! this.accordionHeaderNode.hasClass('collapsed') ) { this.closeAccordion(); }
        else { this.openAccordion(); }
    },
    
    openAccordion: function( event ) {
        var that = event && event.data && event.data.that ? event.data.that : this;
        if ( this.accordionHeaderNode.length && this.accordionContentNode.length && this.accordionIsClosed() ) {
            this.accordionHeaderNode.removeClass('collapsed');
            this.accordionContentNode.addClass('opened');
            this.accordionContentNode.show();
            
            this.accordionContentNode.trigger('accordion:open', that);
        }
    },
    
    closeAccordion: function( event ) {
        var that = event && event.data && event.data.that ? event.data.that : this;
        if ( that.accordionHeaderNode.length && that.accordionContentNode.length && that.accordionIsOpen() ) {
            that.accordionHeaderNode.addClass('collapsed');
            that.accordionContentNode.removeClass('opened');
            that.accordionContentNode.hide();
            
            that.accordionContentNode.trigger('accordion:closed', that);
        }
    }
    
};

site.endeca.mixins.accordion = generic.endeca.mixins.accordion;
