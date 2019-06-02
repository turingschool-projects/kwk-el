
//
// EndecaCatalog class.
// This class parses the Endeca JSON data into category, product, and sku objects,
// and maintains lists (hashes) for each type.  You can then access each list by id,
// such as:
//		var catObj = this.categoryList[catid];
// The structure of the lists/objects is essentially the same as the "CatProdData" class
// of the CL-US project.  Thus, each product object also contains a "skus" list which
// is a list of references to sku objects (also on the skuList) which are skus for that
// product.  Thus, when you get a product object from the productList, that product
// object will have a list of all it's skus (at least the skus that were included
// in the data).
//
// There is a "rec_type" property on each data record that indicates either "product"
// or "content".  "product" record types have cat/prod/sku data, and are stored as such.
// "content" records are not products, and the data for these records is stored
// essentially verbatim on the "contentList" hash.  Typically content records are
// things like articles and videos on the site.
//
// NOTE - this class is intended only to be a convenient container for the data
// returned from an Endeca query.  Please do not add page/state data to this class.
//
// A discussion of the Endeca data format is at the end of this file.
//	

generic.endeca.catalog.product = site.endeca.generic.Class.create( site.endeca.catalog, {

	initialize: function(args) {
		
		this.categoryList = {};
		this.productList = {};
		this.skuList = {};
		
		this.parseOrderHi = 0;
		this.parseOrderLo = 0;
		
		this._super(args);
		
		this.resultList = this.getProducts();
	},
	
	_parseRecord: function( record ) {
	    if ( record.Properties["rec_type"] == 'product'  ) {
            var props = { 'c': {}, 'p': {}, 's': {} };
            
            props['p']['matched'] = 1;
            props['s']['matched'] = 0;
	        
	        for ( var prop in record.Properties ) {
	            var propValue = record.Properties[prop];
	            
	            if ( propValue && propValue != "" && !isNaN( propValue ) ) {
	                if ( propValue.match(/\./) ) { propValue = parseFloat(propValue); }
	                else { propValue = parseInt(propValue); } 
                }
                
                if ( prop.match(/_json/i) ) { 
                    prop = prop.replace(/_json/i, '');
                    propValue =  jQuery.parseJSON( propValue );
                }
                
                if ( prop.match(/^([a-z])_/) ) {
                    props[RegExp.$1] = props[RegExp.$1] ? props[RegExp.$1] : [];
                    props[RegExp.$1][prop.substr(2)] = propValue;
                }
                
                if ( prop == "DGraph.WhyDidItMatch" ) {
                    props['s']['matchedOn'] = propValue;
                    
                    var matchedOnString = typeof propValue == "object" ? propValue.join() : propValue;
                    
                    if ( matchedOnString.match(/s_/) ) {
                        props['p']['matched'] = 0;
                        props['s']['matched'] = 1;
                    } 
                }
	        }
            
            this.addProps( props['c'], props['p'], props['s'] );
	    }
	},

	//from legacy
	addProps: function ( catProps, prodProps, skuProps, insert ) {
		// For now, i'm using id's, but we may want to use the "path", which is more specific...
		var catId = catProps.CATEGORY_ID;
		var prodId = prodProps.PRODUCT_ID;
		var skuId = skuProps.SKU_ID;
		
		// I'm paranoid - check for id's
		if ( !catId || !prodId || !skuId ) return;
		
		// Insert/update sku object
		var skuObj = this.skuList[skuId] || {};
		this.skuList[skuId] = jQuery.extend(skuObj,skuProps);
		
		// If existing product record, use that and update.
		// Else create new one.
		var prodObj = this.productList[prodId] || { parseOrder: ++this.parseOrderHi };
		
		// If inserting, parse order should be negative.
		if ( insert && prodObj.parseOrder > 0 ) {
			prodObj.parseOrder = --this.parseOrderLo;
		}
		
		prodObj = jQuery.extend(prodObj,prodProps);
		if ( !prodObj.skus )
			prodObj.skus = [];
		if ( !prodObj.skuList )
			prodObj.skuList = {};
		// Make sure each sku is listed only once per product
		if ( !prodObj.skuList[skuId] ) 
			prodObj.skus.push(skuObj);
		prodObj.skuList[skuId] = skuObj;
		this.productList[prodId] = prodObj;
		
		skuObj.product = prodObj;
		
		var catObj = this.categoryList[catId] || {};
		catObj = jQuery.extend(catObj,catProps);
		if ( !catObj.prods ) catObj.prods = [];
		catObj.prods.push(prodObj);		
		this.categoryList[catId] = catObj;
	},
	
	
	// Return an array of product objects, sorted by parseOrder
	getProducts: function() {
	    function sortByParseOrder( a, b ) {
		    if ( a.parseOrder > b.parseOrder ) { return 1; }
		    else if ( a.parseOrder < b.parseOrder ) { return -1; }
            return 0;
		}
		
		function sortByDisplayOrder( a, b ) {
		    if ( a.DISPLAY_ORDER > b.DISPLAY_ORDER ) { return 1; }
		    else if ( a.DISPLAY_ORDER < b.DISPLAY_ORDER ) { return -1; }
            return 0;
		}
		
		var prods = [];
	    
	    for ( var prodId in this.productList ) {
	        this.productList[prodId].skus.sort(sortByDisplayOrder);
	        prods.push( this.productList[prodId] );
	    }
	    
	    prods.sort(sortByParseOrder);
		
		return prods;
	},
	
	// Return an array of sku objects
	getSkus: function() {
		var skus = [];
		for ( var sku in this.skuList ) {
		    skus.push( this.skuList[sku] );
		}
		return skus;
	},
	
	getCategory: function(catid) {
		var catObj = ( this.categoryList ? this.categoryList[catid] : null );
		return catObj;
	},
	
	getProduct: function(prodid) {
		var prodObj = ( this.productList ? this.productList[prodid] : null );
		return prodObj;
	},
	
	getSku: function(skuid) {
		var skuObj = ( this.skuList ? this.skuList[skuid] : null );
		return skuObj;
	}
	
});

site.endeca.catalog.product = generic.endeca.catalog.product;


/*
The Endeca data arrives as a JSON hash.  Each record in the hash is a complete sku record,
including all the category, product, and sku properties for that sku.

When we request the data, we request a rollup on PRODUCT_ID.  This groups the
data by product.  The "parent" product is called the "Aggregate Record" (in Endeca-land).
Thus, in the hash, the first sku is the "AggrRecord" (which is a sku representative of
the rolled-up product record), and all the other skus (if any) then follow that record.

Because Endeca flattens the entire database into sku-specific records, before sending
the data to Endeca, we pre-pend each property name with a "c_", "p_", or "s_", to indicate
if that property is a Category, Product, or Sku property (respectively). Then, when
we parse out each Endeca record, we can split the record into category, product, and
sku properties.  As we parse the data, we create a category, product, and sku object
for each sku, and then merge that object into the list of cats/prods/skus in our
EndecaCatalog class.

Note that because a product often has multiple skus, we will see the same product id
more than once as we process those skus.  Thus, we want to "update" the product record
in our list with the new sku info, and not just "add" the product record (since that would
potentially create duplicate product records).  A similar scenario may occur if a
product belongs to more than one category.

Here is a very simplified synopsys of the Endeca data JSON format:

	AggrRecords: [
		{	-- new product
			Records: [
				{
					Properties: {
						c_*
						p_*
						s_*
					}
				}
				{
					Properties: {
						c_*
						p_*
						s_*
					}
				}
			]
		}
		{	-- new product
			Records: [
				{
					Properties: {
						c_*
						p_*
						s_*
					}
				}
				{
					Properties: {
						c_*
						p_*
						s_*
					}
				}
			]
		}
	]
*/
	
