
site.endeca.result.product = jQuery.extend( true, {}, generic.endeca.result.product, {

    setupShades: function() {

        var skus = this.resultData.skus;

        //inventory
        if(skus.length > 1){
          // COMING_SOON[3], SOLD_OUT[7], TEMP_OUT_OF_STOCK[2]
          var notShoppable = _.filter(skus, function(sku){
              return sku['INVENTORY_STATUS'] == 3 || sku['INVENTORY_STATUS'] == 7 || sku['INVENTORY_STATUS'] == 2;
          });
          var skusShoppable = _.difference(skus, notShoppable);
          skus = skusShoppable.concat(notShoppable);
        }

        for ( var i = 0; i < skus.length; i++ ) {
            skus[i].PRODUCT_ID = this.resultData.PRODUCT_ID;
            skus[i].url = this.resultData.url;
        }

        var shadesNode = this.node.find('.shades');
        var shadesContainerNode = this.node.find('.shade-select-container');
        var shadesListNode = this.node.find('.shade-select');
        var priceNode = this.node.find('.size-price');
        var imageNode = this.node.find('.sku-image');

        if ( shadesNode.length ) {
            shadesNode.addClass( 'shades_' + this.resultData.skus.length );
            $(skus).each(function(index, sku) {
              var shadeHex = sku.HEX_VALUE_STRING;
              // explode
              var shadeHex = shadeHex.split(',');
              if(shadeHex.length == 1) {
                sku['SWATCH_TYPE'] = 'single';
                sku['HEX_VALUE_1'] = shadeHex[0];
              }else if(shadeHex.length == 2){
                sku['SWATCH_TYPE'] = 'duo';
                sku['HEX_VALUE_1'] = shadeHex[0];
                sku['HEX_VALUE_2'] = shadeHex[1];
              }else if(shadeHex.length == 3){
                sku['SWATCH_TYPE'] = 'trio';
                sku['HEX_VALUE_1'] = shadeHex[0];
                sku['HEX_VALUE_2'] = shadeHex[1];
                sku['HEX_VALUE_3'] = shadeHex[2];
              }else if(shadeHex.length == 5){
                sku['SWATCH_TYPE'] = 'quint';
                sku['HEX_VALUE_1'] = shadeHex[0];
                sku['HEX_VALUE_2'] = shadeHex[1];
                sku['HEX_VALUE_3'] = shadeHex[2];
                sku['HEX_VALUE_4'] = shadeHex[3];
                sku['HEX_VALUE_5'] = shadeHex[4];
              }
              //misc flag for skus
              var skuMiscFlag =  sku.MISC_FLAG;
              if(skuMiscFlag == 1){
                sku['MISC_FLAG_TEXT'] = '- ' + rb.endeca.misc_flag_new;
              }else if(skuMiscFlag == 2){
                sku['MISC_FLAG_TEXT'] = '- ' + rb.endeca.misc_flag_limited_edition;
              }else if(skuMiscFlag == 3){
                sku['MISC_FLAG_TEXT'] = '- ' + rb.endeca.misc_flag_new_shades;
              }else if(skuMiscFlag == 94 || skuMiscFlag == 5){
                sku['MISC_FLAG_TEXT'] = '- ' + rb.endeca.misc_flag_online_exclusive;
              }else{
                sku['MISC_FLAG_TEXT'] = '';
              }
            });

            this.shadeResults = new site.endeca.results({
                resultData: skus,
                parentNode: shadesNode,
                childClass: 'shade',
                configuration: this.configuration,
                mixins: this.mixins
            });
            this.shadeResults.displayResults();
            this.shadeResults.show();
        }

        if ( shadesListNode.length > 0 ) {
            shadesListNode.addClass( 'shades_' + this.resultData.skus.length );

            this.shadeListResults = new site.endeca.results({
                resultData: skus,
                parentNode: shadesListNode,
                childClass: 'shade',
                configuration: jQuery.extend( {
                    shadeTemplatePath: '/templates/endeca/products/shade-select.tmpl'
                }, this.configuration ),
                mixins: this.mixins
            });
            this.shadeListResults.displayResults();
            //this.shadeListResults.show();
        }

        var that = this;

        this.node.bind( 'sku:select', function( event, sku ) {
            // that.setupAddToBag( sku.SKU_BASE_ID );
            if ( priceNode.length ) {
                var formattedPrice = (_.isUndefined(sku.formattedPrice)) ? '' : sku.formattedPrice;
                var price2 = (_.isUndefined(sku.PRICE2)) ? '' : sku.PRICE2;
                var formattedPrice2 = (_.isUndefined(sku.formattedPrice2)) ? '' : sku.formattedPrice2;
                var productSize = (_.isUndefined(sku.PRODUCT_SIZE)) ? '' : sku.PRODUCT_SIZE;
                
                if ( priceNode.hasClass('price-range') && ( that.resultData.priceRange.match(/-/) ) ) {
                    if ( that.resultData.price2Range ) {
                        priceNode.html( '<span class="product__price--non-sale text--bold">' + that.resultData.price2Range + '</span> <span class="product__price--sale text--bold">' + that.resultData.priceRange +'</span>'+ productSize);
                    } else {
                        priceNode.html( '<span class="text--bold">' + that.resultData.priceRange +'</span>'+ productSize);
                    }
                } else if (price2) {
                    priceNode.html('<span class="product__price--non-sale text--bold">' + formattedPrice2 + '</span> <span class="product__price--sale text--bold">' + formattedPrice + '</span>' + productSize);
                } else {
                    priceNode.html( '<span class="text--bold">' + formattedPrice + '</span> ' + productSize );
                }

            }
            if ( imageNode.length ) {
                imageNode.attr( 'src', sku.XS_IMAGE );
            }
        });
        this.node.trigger('sku:select', skus[0]);

        if ( site && site.ShadePicker ) {
            this.shadePricker = new site.ShadePicker( this.resultData );
            shadesContainerNode.show();
        }
    },
    setupAddToBag: function( sku ) {
        var skuBaseId = typeof sku==="number" ? sku : sku.SKU_BASE_ID;
        var $addButton = this.node.find("a.btn-add-to-bag");
        $addButton.attr("data-skubaseid", skuBaseId );
        site.createAddButton($addButton);
        this.setupQuantitySelect();
        this.setupMiscFlag();
        this.setupSkinTypes();
        var $wishlistNode = this.node.find(".js-add-to-favorites");
        site.addFavoritesButton($wishlistNode);
    },
    setupQuantitySelect : function() {
      var $qtySelectNode = this.node.find(".search-product__quantity");
      if( $qtySelectNode.length < 1 ) return null;
      site.qtySelectMenu($qtySelectNode);
      $qtySelectNode.selectBox();
    },
    setupSizeSelect: function() {
        var sizeSelectNode = this.node.find('.size-select');
        var priceNode = this.node.find('.size-price');

        if ( sizeSelectNode.length ) {
            if( this.resultData.skus.length > 1 ){
                priceNode.hide();
                this.sizeResults = new site.endeca.results({
                    resultData: this.resultData.skus,
                    parentNode: sizeSelectNode,
                    childClass: 'size',
                    configuration: this.configuration,
                    mixins: this.mixins
                });
                this.sizeResults.displayResults();
                this.sizeResults.show();
                sizeSelectNode.selectBox();

                var that = this;

                sizeSelectNode.change(function(event) {
                  var selectedSku = sizeSelectNode.find('option:selected').val();
                  var skuData = _.find(that.resultData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
                  site.skuSelect(skuData);
                });
            }
        }
        var $skinTypeSelector = this.node.find('.search-product__skintype-select');
        $skinTypeSelector.trigger('change');
    },
    setupQuickShop: function() {
        //site.quickshop(categoryData);
    },
    setupMiscFlag: function(){
      var miscFlagNode = this.node.find('.misc-flag');
      //misc flag - product level
      var miscFlag =  this.resultData.MISC_FLAG;
      var miscFlagText = false;

      if(miscFlag == 1){
        miscFlagText = rb.endeca.misc_flag_new;
      }else if(miscFlag == 2){
        miscFlagText = rb.endeca.misc_flag_limited_edition;
      }else if(miscFlag == 3){
        miscFlagText = rb.endeca.misc_flag_new_shades;
      }else if(miscFlag == 94 || miscFlag == 5){
        miscFlagText = rb.endeca.misc_flag_online_exclusive;
      }else if(miscFlag == 130) {
        miscFlagText = rb.endeca.misc_flag_new_large_size;
      }else if(miscFlag == 24) {
        miscFlagText = rb.endeca.misc_flag_last_chance;
      }else if(miscFlag == 15) {
        miscFlagText = rb.endeca.pre_order;
      }

      if(miscFlagText){
        miscFlagNode.html(miscFlagText);
        miscFlagNode.show();
      }
    },

    setupSkinTypes: function() {
        //skintypes
        var skintypes = _.pluck(this.resultData.skus, 'SKIN_TYPE');

        var st = _.filter(this.resultData.skus, function(sku) {
            return sku.SKIN_TYPE;
        });
        var skintypes = [];
        var skintypeKey = [];
        var skintypeKeys = [];

        $(st).each(function(index, val) {
            skintypes[index] = [val.SKIN_TYPE, val.SKU_BASE_ID];
        });
        if (skintypes.length > 1) {
            for (var i = 0; i < skintypes.length; i++) {
                if (skintypes[i][0] != 0) {
                    skintypeKey.push(skintypes[i][0]);
                }
            }
            skintypeKey = _.uniq(skintypeKey);
            for (var i = 0; i < skintypeKey.length; i++) {
                skintypeKeys.push([skintypeKey[i], '-']);
            }
            for (var x = 0; x < skintypes.length; x++) {
                for (var i = 0; i < skintypeKeys.length; i++) {
                    if (skintypes[x][0] == skintypeKeys[i][0]) {
                        skintypeKeys[i][1] = skintypeKeys[i][1] + ',' + skintypes[x][1];
                    }
                }
            }
            for (var i = 0; i < skintypeKeys.length; i++) {
                skintypeKeys[i][1] = skintypeKeys[i][1].replace("-,", "");
            }
        }
        var $thisNode = this.node;
        var $skinTypeSelector = $thisNode.find('.search-product__skintype-select');
        var $sizeSelect = $thisNode.find('.size-select');
        if (skintypeKeys.length > 1) {
            var exception_arr = [];
            for (var i in skintypeKeys) {
                var skin_type_value_selector = '[value="' + skintypeKeys[i][0] + '"]';
                exception_arr.push(skin_type_value_selector);
                $skinTypeSelector.find(skin_type_value_selector).attr('data-skus', skintypeKeys[i][1]);
            }
            $skinTypeSelector.find('option').not(exception_arr.join()).remove();
        }
        else {
            $skinTypeSelector.remove();
        }
        $skinTypeSelector.selectBox();
        var that = this;
        $skinTypeSelector.change(function() {
            if ($sizeSelect.length) {
                $sizeSelect.find('option').prop('disabled', true);
                var selectedSkus = $skinTypeSelector.find('option:selected').attr('data-skus').split(',');
                $(selectedSkus).each(function(index, val) {
                    var $option = $('option', $sizeSelect).filter("[value=" + val + "]");
                    $option.prop('disabled', false);
                    if (index == 0) {
                        $option.prop('selected', true);
                    }
                });
                $sizeSelect.trigger('change');
                $sizeSelect.selectBox('refresh');
            } else {
                var selectedSku = $(this).find('option:selected').attr('data-skus');
                var skuData = _.find(that.resultData.skus, function(sku) {
                    return sku.SKU_BASE_ID == selectedSku;
                });
                $addButton = that.node.find("a.btn-add-to-bag");
                $addButton.trigger('sku:select', skuData);
            }
        });
        $skinTypeSelector.trigger('change');
    },

    displayResult: function( args ){
        var prod_quantity_range = Drupal.settings.endeca.prod_quantity ? Drupal.settings.endeca.prod_quantity : 6;
        var html;
         for (i=1;i<=prod_quantity_range;i++)
         {
            html += '<option value="' + i + '">' + rb.endeca.qty + ': ' + i + '</option>';
         };
        this.resultData.prod_quantity_html = html;

        // set up price2Range, which is normally calculated in drupal
        if ( this.resultData.skus && this.resultData.skus.length > 1 ) {
          
            var skusWithPrice2 = jQuery.grep( this.resultData.skus, function( sku ) {
                return ( typeof sku.PRICE2 != 'undefined' );
            });
            
            if ( skusWithPrice2.length == this.resultData.skus.length ) {
                var price2s = jQuery.map( this.resultData.skus, function ( val, i ) {
                    var priceObj = {};
                    // if price2 is set, use that, otherwise use the regular price.
                    // this is specifically to allow for scenarios where not ALL skus for
                    // a specific product are discounted, in which case a range should be displayed
                    // which includes the
                    if ( val.PRICE2 ) {
                        priceObj[ 'PRICE2' ] = val.PRICE2;
                        priceObj[ 'formattedPrice2' ] = val.formattedPrice2;
                    } else {
                        priceObj[ 'PRICE2' ] = val.PRICE;
                        priceObj[ 'formattedPrice2' ] = val.formattedPrice;
                    }
                    return priceObj;
                });
    
                price2s.sort( function( a, b ) {
                    return a['PRICE2'] > b['PRICE2']
                });
    
                if ( price2s[0].PRICE2 != price2s[price2s.length-1].PRICE2 ) {
                    this.resultData.price2Range = price2s[0].formattedPrice2 + ' - ' + price2s[price2s.length-1].formattedPrice2;
                }
            }
        }

        // hide reviews if none present
        if(!this.resultData.hasOwnProperty('ratingDisplay')){
            this.resultData['ratingDisplay'] = this.resultData.hasOwnProperty("TOTAL_REVIEW_COUNT") ? 'block' : 'none';
        }

        // defaultSku
        this.resultData.defaultSku = jQuery.grep( this.resultData.skus, function( el, idx ) {
          return el.DEFAULT_SKU == 1;
        })[0] || this.resultData.skus[0];

        this.resultData.defaultSku.MEDIUM_IMAGE_0 = (typeof this.resultData.defaultSku.MEDIUM_IMAGE == 'object') ?
            this.resultData.defaultSku.MEDIUM_IMAGE[0] :
            this.resultData.defaultSku.MEDIUM_IMAGE;

        this._super( args );
        if(Drupal.settings.globals_variables.enable_preorder) {
          site.isPreOrderSearch(this.resultData.defaultSku);
        }
    }
});
