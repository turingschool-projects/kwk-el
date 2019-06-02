
generic.endeca.catalog.content = site.endeca.generic.Class.create( site.endeca.catalog, {	
	_parseRecord: function( record ) {
	    this.resultList.push({
	        "Properties": {
    	        "image": site.endeca.generic.rb('endeca').get('content.image_url'),
    	        "title": record.Properties.p_PROD_RGN_NAME,
    		    "description": record.Properties.p_DESCRIPTION,
    		    "link": record.Properties.p_url,
    		    "link_text": site.endeca.generic.rb('endeca').get('content.link_text'),
    		    "Zone": 'crawlData'
    		}
        });
	}
});


site.endeca.catalog.content = generic.endeca.catalog.content;