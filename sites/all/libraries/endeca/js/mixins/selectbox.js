
generic.endeca.mixins.selectbox = {
    setupNodes: function( args ) {
        this._super( args );
        var that = this;
        var selectBox = this.node.find('select').length ? this.node.find('select') : 
                        this.parentNode.find('select').length ? this.parentNode.find('select') : '';
                        
        if ( selectBox ) { selectBox.bind( 'change', that, that.onChange ); }
    },
    
    onChange: function( event ) {
        var that = event.data;
        var selectedOption = this.options[this.selectedIndex];
        jQuery(selectedOption).trigger('simulate:click');
        event.preventDefault();
        return false;
    }
};

site.endeca.mixins.selectbox = generic.endeca.mixins.selectbox;
