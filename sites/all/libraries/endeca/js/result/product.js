
generic.endeca.result.product = {
    initialize: function( args ) {
        this.shadeResults = null;
        this._super( args );
    },
    
    displayResult: function( args ) {
        this.setupReviewData();
        this.setupBrandData();
        this._super( args );
    },
    
    displayResultCallback: function( args ) {
        this.setupQuickShop();
        this.setupAddToBag( this.resultData.skus[0] );
        if ( this.resultData.shaded ) { this.setupShades(); }
        if ( this.resultData.sized ) { this.setupSizeSelect(); }
        if ( typeof this.displayResultCallbackBrand == "function" ) { this.displayResultCallbackBrand() }
    },
    
    setupReviewData: function() {
        this.resultData.ratingDisplay = this.resultData.TOTAL_REVIEW_COUNT ? 'block' : 'none';
        this.resultData.ratingReviewWord = this.resultData.TOTAL_REVIEW_COUNT && this.resultData.TOTAL_REVIEW_COUNT > 1 ? site.endeca.generic.rb("language").get('reviews') : site.endeca.generic.rb("language").get('review');
        this.resultData.ratingRounded = this.resultData.TOTAL_REVIEW_COUNT ? Math.round(this.resultData.AVERAGE_RATING*10)/10 : 0;
    },
    
    setupBrandData: function() {
        this.resultData.formattedPriceRange = this.formatPriceRange();
        this.resultData.price2 = this.resultData.skus[0].formattedPrice2;
        this.resultData.shadedClass = this.resultData.shaded ? 'shaded' : 'nonshaded';
        this.resultData.sizedClass = this.resultData.sized ? 'sized' : 'notsized';
        this.resultData.isComingSoon = eval( jQuery.map( this.resultData.skus, function( sku ) { return sku.isComingSoon }).join('+') ) > 0 ? "coming_soon" : "";
        if ( this.resultData.DESCRIPTION ) {
            this.resultData.descriptionBlurb = this.resultData.DESCRIPTION.substring( 0, ( this.configuration.descriptionBlurb || 120 ) );
            this.resultData.descriptionRest = this.resultData.DESCRIPTION.substring( ( this.configuration.descriptionBlurb || 120 ) );
            this.resultData.descriptionFull = this.resultData.descriptionBlurb + this.resultData.descriptionRest;
        }
        this.resultData.skinTypeText = typeof productPage != 'undefined' && typeof productPage.getAllSkinTypes == 'function' ? productPage.getAllSkinTypes( this.resultData ) : '';
        if( typeof this.resultData.ATTRIBUTE_BENEFIT != 'undefined' ){
            this.resultData.attrBenefit = this.resultData.ATTRIBUTE_BENEFIT.toString().replace(/,/g,", ");
        }
    },
    
    formatPriceRange: function() {
		var minPrice = this.resultData.skus[0];
		var maxPrice = this.resultData.skus[0];
		for(var i = 0; i < this.resultData.skus.length; i++){
			var currSku = this.resultData.skus[i];
			minPrice = (currSku.PRICE < minPrice.PRICE) ? currSku : minPrice;
			maxPrice = (currSku.PRICE > maxPrice.PRICE) ? currSku : maxPrice;
		}
		
		return ( minPrice !== maxPrice ) ? minPrice.formattedPrice + ' - ' + maxPrice.formattedPrice : this.resultData.skus[0].formattedPrice;
    },
    
    setupQuickShop: function() {
        var quickshopLink = this.node.find('a.quickshop-link');
        
        if ( quickshopLink && typeof brx != 'undefined' ) {
            var that = this;
            quickshopLink.bind("click", function (e) {
                e.preventDefault();
                
                if(jQuery.isFunction(productPage.launchQuickshop)){
                    var prodID = jQuery(this).attr('id').replace('quickview-link-','');
                    productPage.launchQuickshop(prodID);
                }else{
                    var view = brx.productView.quickshop({
                        productData: that.resultData
                    });   
                }
            });
            quickshopLink.bind("mouseover", function (e) {
            	jQuery(this).find('.quickshop-btn').addClass('qs-active');
            	jQuery(this).closest('.result').addClass('qs');
            });
            quickshopLink.bind("mouseout", function (e) {
            	jQuery(this).find('.quickshop-btn').removeClass('qs-active');
            	jQuery(this).closest('.result').removeClass('qs');
            });
        }
    },
    
    setupAddToBag: function( sku ) {
        var skuBaseId = typeof sku==="number" ? sku : sku.SKU_BASE_ID;
        var addButtonNode = this.node.find("a.btn-add-to-bag");
        var progressNode = this.node.find("span.add-progress");
        
        addButtonNode.unbind();
        addButtonNode.attr("data-skubaseid", skuBaseId );
        addButtonNode.bind("click", function(e) {
            e.preventDefault();
            
            if ( progressNode.length ) {
                addButtonNode.hide();
                progressNode.show();

                $(document).one("addToCart.success addToCart.failure", function () {
                    progressNode.hide();
                    addButtonNode.show();
                });
            }
            
            site.addToCart({
                skuBaseId: $(this).attr("data-skubaseid")
            });
            
        });
    },
    
    setupNote: function() {
        /*if (this.resultData.MISC_FLAG) {
            var flagImgNode = this.node.select(".prod_details .prod_title .note")[0];
            if ( flagImgNode ) {
                var flagImg = el.productView.flagImages.get(this.resultData);
                var img = new Element("img", { src: flagImg.mppimg, alt: flagImg.alt });
                flagImgNode.update(img);
            }
        }*/
    },
    
    setupGiftSetComponents: function() {
        /*var giftsetNode = this.node.down('.giftset');
        if ( giftsetNode ) { giftsetNode.show(); }*/
    },
    
    setupShades: function() {
        var shadesNode = this.node.find('.shades');
        var selectedShadesNode = this.node.find('.selected-shade-name');
        var priceNode = this.node.find('.shade-price');
        
        if ( shadesNode.length ) {
            var skus;
            
            if ( typeof this.configuration.maxmimumShades != 'undefined' && this.resultData.skus.length > this.configuration.maxmimumShades ) {
                skus = this.resultData.skus.slice( 0, this.configuration.maxmimumShades );
            } else {
                skus = this.resultData.skus.slice( 0 );
            }
            
            shadesNode.addClass( 'shades_' + this.resultData.skus.length );
            
            for ( var i = 0; i < skus.length; i++ ) {
                skus[i].PRODUCT_ID = this.resultData.PRODUCT_ID;
                skus[i].url = this.resultData.url;
            }
            
            this.shadeResults = new site.endeca.results({ 
                resultData: skus,
                parentNode: shadesNode,
                childClass: 'shade',
                configuration: this.configuration,
                mixins: this.mixins
            });
            this.shadeResults.displayResults();
            this.shadeResults.show();
            
            var that = this;
            
            this.node.bind( 'select.sku', function( event, sku ) {
                that.setupAddToBag( sku.resultData.SKU_BASE_ID );
                if ( selectedShadesNode.length ) {
                    selectedShadesNode.text( sku.resultData.SHADENAME );
                }
                if ( priceNode.length ) {
                    priceNode.text( sku.resultData.formattedPrice );
                }
            });
            
            this.shadeResults.resultNodes[0].selectShade();
            
            // Commenting this out for now as it causes the search page to automatically go to SPP when the result/shade node is a link
            //this.shadeResults.resultNodes[0].node.click();
        }
    },
    
    setupSizeSelect: function() {
        var sizeSelectNode = this.node.find('.size-select');
        var priceNode = this.node.find('.size-price');
        
        if ( sizeSelectNode.length ) {
          
            this.sizeResults = new site.endeca.results({ 
                resultData: this.resultData.skus,
                parentNode: sizeSelectNode,
                childClass: 'size',
                configuration: this.configuration,
                mixins: this.mixins
            });
            this.sizeResults.displayResults();
            this.sizeResults.show();
            
            var that = this;
            
            this.node.bind( 'select.sku', function( event, sku ) {
                that.setupAddToBag( sku.resultData.SKU_BASE_ID );
                if ( priceNode.length ) {
                    priceNode.text( sku.resultData.formattedPrice );
                }
            });
            
        }
        
    }
};


site.endeca.result.product = generic.endeca.result.product;
