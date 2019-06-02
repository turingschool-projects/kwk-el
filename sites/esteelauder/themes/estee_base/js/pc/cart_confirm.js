
var site = site || {};

(function($) {
  site.cartConfirm = function() {
    var that = {
      content : null,
      init : function() {
        this.content = $('script.inline-template[path="cart_confirm"]').html();
        if (typeof this.content == 'undefined' || !this.content) { return null; }
        $(document).bind('addToCart.success', function(e, cartResult) {
          if (!cartResult || typeof(cartResult.getItem) !== 'function') { return null; }
          //update cart count
          var item_count = cartResult.getCount();
          $('.page-utilities__cart-count').html(item_count);

          //don't show cart dropdown if flag is set
          if (typeof (cartResult.updateCountOnly) != 'undefined' ) { return null; }

          //Muliple Hex
          var sku = cartResult.getItem().product.sku
          var shadeHex = cartResult.getItem().product.sku.HEX_VALUE_STRING;
          if (shadeHex != null) {
              // explode
              var shadeHex = shadeHex.split(',');
              if (shadeHex.length == 1) {
                  sku['SWATCH_TYPE'] = 'single';
                  sku['HEX_VALUE_1'] = shadeHex[0];
              } else if (shadeHex.length == 2) {
                  sku['SWATCH_TYPE'] = 'duo';
                  sku['HEX_VALUE_1'] = shadeHex[0];
                  sku['HEX_VALUE_2'] = shadeHex[1];
              } else if (shadeHex.length == 3) {
                  sku['SWATCH_TYPE'] = 'trio';
                  sku['HEX_VALUE_1'] = shadeHex[0];
                  sku['HEX_VALUE_2'] = shadeHex[1];
                  sku['HEX_VALUE_3'] = shadeHex[2];
              } else if (shadeHex.length == 5) {
                  sku['SWATCH_TYPE'] = 'quint';
                  sku['HEX_VALUE_1'] = shadeHex[0];
                  sku['HEX_VALUE_2'] = shadeHex[1];
                  sku['HEX_VALUE_3'] = shadeHex[2];
                  sku['HEX_VALUE_4'] = shadeHex[3];
                  sku['HEX_VALUE_5'] = shadeHex[4];
              }
          }
          var skuBaseID = cartResult.getItem().product.sku.SKU_BASE_ID;
          if (skuBaseID != null) {
          var allItems = cartResult.getAllItems();
            var preOrderCartItems = typeof cartResult.getTransData().preorder !== 'undefined' ? cartResult.getTransData().preorder.items : '';
            allItems = allItems.concat(preOrderCartItems);
          $.each(allItems, function(i, item) {
            if(item['sku.SKU_BASE_ID'] === skuBaseID){
                cartResult.getItem().preOrderMsgShort = item.preOrderMsgShort;
                return false;
            }
          });
          }
          if (skuBaseID != null) {
            that.launch(cartResult.getItem());
          }
        });
          $(document).bind('addToCart.failure', function(e, cartMessage) {
              var overlayContent = '';

              cartMessage.forEach(
                  function(cartMessage){
                      overlayContent = overlayContent.concat(cartMessage.text + '<br>');
                  });
              generic.overlay.launch({
                  content: overlayContent,
                  includeBackground: true,
                  cssStyle:{
                      width:"540px",
                      height:"200px",
                  }
              });
          });
      },
      launch : function(cartItem) {
        var html = Mustache.render(this.content, cartItem);
        $('.cart-confirm__content').html(html).parent().fadeIn('200');
        $(document).trigger('productQV:rendered:LoyaltyPrices', $('.cart-confirm__content'));
        $(document).trigger('cart_confirm_fade_in');
        setTimeout(function() {
          $('.cart-confirm__content').parent().fadeOut('200');
          $(document).trigger('cart_confirm_fade_out');
        }, 3500);
      }
    };
    return that;
  }();
})(jQuery);

(function($) {
  site.wishlistConfirm = function() {
    var that = {
      content : null,
      init : function() {
        this.content = $('script.inline-template[path="wishlist_confirm"]').html();
        if (typeof this.content == 'undefined' || !this.content) { return null; }
        $(document).bind('addToWishlist.success', function(e, cartResult) {
          // var ci = cartResult.getItem();
          that.launch({wishlist_add_success: true});
        });
        $(document).bind('addToWishlist.exists', function(e, result) {
          that.launch({wishlist_add_exists: true});
        });
      },
      launch : function(args) {
        var html = Mustache.render(this.content, args);
        $.colorbox({
          html: html,
          className: 'colorbox__wishlist-confirm',
          width: "350px",
          height: "190px",
        });
        $(".js-wishlist-confirm-close").one( "click", function(){
          $.colorbox.close();
        });
      }
    };
    return that;
  }();
})(jQuery);

(function($) {
  site.offerConfirm = function() {
    var that = {
      content : null,
      init : function() {
        this.content = $('script.inline-template[path="offer_confirm"]').html();
        if (typeof this.content == 'undefined' || !this.content) { return null; }
        $(document).bind('addOffer.success', function(e, offerResult) {
          that.launch(offerResult);
        });
      },
      launch : function(args) {
        var html = Mustache.render(this.content, args);
        $('.cart-confirm__content').html(html).parent().fadeIn('200');
        setTimeout(function() {
          $('.cart-confirm__content').parent().fadeOut('200');
        }, 3500);
      }
    };
    return that;
  }();
})(jQuery);

