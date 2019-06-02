
generic.endeca.catalog = site.endeca.generic.Class.create({
	initialize: function( args ) {
        this.jsonResult = null;
        this.resultList = [];
        jQuery.extend( this, args || {} );
        
        if ( this.jsonResult ) { this.parseData(); }
	},
	
    parseData: function() {
        if ( this.jsonResult.AggrRecords ) {
            for ( var i = 0; i < this.jsonResult.AggrRecords.length; i++) {
                for ( var j = 0; j < this.jsonResult.AggrRecords[i].Records.length; j++ ) {
                    this._parseRecord( this.jsonResult.AggrRecords[i].Records[j] );
                }
            }
        } else if ( this.jsonResult.Records ) {
            for ( var i = 0; i < this.jsonResult.Records.length; i++ ) {
                this._parseRecord( this.jsonResult.Records[i] );
            }
        }
	}
});

site.endeca.catalog = generic.endeca.catalog;