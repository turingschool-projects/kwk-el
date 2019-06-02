
/* BEGIN LivePerson View cart Monitor. */
(function($) {

  $(document).on('addToCart.success', function(event, data) {
    var cartItems = data.getAllItems();
    var cartInformation = {};
    cartInformation["type"] = "cart";
    cartInformation["total"] = 0;
    cartInformation["numItems"] = data.getCount();
    cartInformation["products"] = [];
    cartItems.forEach(function(product) {
      var products = {};
      products["product"] = {};
      products["product"]["name"] = product["prod.PROD_RGN_NAME"];
      products["product"]["category"] = product["prod.FAMILY_CODE"];
      products["product"]["sku"] = product["sku.SKU_ID"];
      products["product"]["price"] = product["UNIT_PRICE"];
      products["quantity"] = product["ITEM_QUANTITY"];
      cartInformation["total"] += product["APPLIED_PRICE"];
      cartInformation["products"].push(products);
    });
    lpTag.sdes = lpTag.sdes||[];
    lpTag.sdes.push(cartInformation);
  });
/* END LivePerson View cart Monitor. */
 
/* Visitor Error Track */
  function lpTrackVisitorError(message,code) {
    lpTag.sdes = lpTag.sdes||[];
    lpTag.sdes.push({
      "type": "error",  //MANDATORY
      "error": {
        "message": message,  // THE ERROR MESSAGE
        "code": code  // THE ERROR CODE
      }
    });
  }

  var error_tag = {"no_search_result":{"message":"No items found matching","code":"er100004"}};

  $(document).one('endeca.search.results.loaded', function(event, data) {
    var productData = data.results.products.resultData || {};
    if (productData.length == 0) {
      if (lpTag) {
        lpTrackVisitorError(error_tag['no_search_result']['message'],error_tag['no_search_result']['code']);
      }
    }
  }); 

  $('.search-page a.search-link__chat, .mobile-search-page a.search-link__chat').live('click', function(event) {
      event.preventDefault();
      $('#footer_chat a')[0].click();
  });
  
  $('.search-link__chat').live('click', function(event) {
      event.preventDefault();
      $('#lower_footer_sticky_chat a.button--inverted')[0].click();
  });

  $('.search-link-ca__chat').live('click', function(event) {
      event.preventDefault();
      $('#footer_sticky_chat a.button--inverted')[0].click();
  });

})(jQuery);
