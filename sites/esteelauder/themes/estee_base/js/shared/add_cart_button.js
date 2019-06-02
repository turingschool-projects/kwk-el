
var site = site || {};

site.addToCart = function(args) {
  var skuBaseId;
  if (args.skuData && args.skuData.SKU_BASE_ID) {
    skuBaseId = args.skuData.SKU_BASE_ID;
  } else if (args.skuBaseId) {
    skuBaseId = args.skuBaseId;
  } else {
    return null;
  }

  var quantity;
  if (args.quantity) {
    quantity = args.quantity;
  } else {
    quantity = 1;
  }

 // Support Replenishment
  var replAmount;
  if (args.replAmount && args.replAmount != 0) {
    replAmount = args.replAmount;
    args.action       = 'add';
    args.itemType     = 'replenishment';
    args.add_to_cart  = 1;
  } else {
    replAmount = 0;
  }

  var catBaseId = '';
  if (args.skuData && args.skuData.PARENT_CAT_ID) {
    var matchResult = args.skuData.PARENT_CAT_ID.match("[0-9]+");
    if (matchResult) {
      cat_base_id = matchResult[0];
    }
  }

  args.skus = args.skus || [skuBaseId];
  args.itemType = args.itemType || 'cart';
  args.INCREMENT = 1;
  args.CAT_BASE_ID = args.CAT_BASE_ID || catBaseId;
  args.QTY = args.QTY || quantity;
  args.REPLENISHMENT_FREQ = args.REPLENISHMENT_FREQ || replAmount;

  generic.checkout.cart.updateCart({
    params: args,
    onSuccess: function(r) {
      var resultObj = r.getCartResults();
      var msgs = r.getMessages();
      if (msgs){
          $(msgs).each(function(){
            if($(this)[0].key === 'offer_criteria_not_met' && $(this)[0].tags[2] === 'one_time_purchase'){
                generic.overlay.launch({
                    content: $(this)[0].text,
                    includeBackground: true,
                    cssClass: "add_cart_response",
                    cssStyle: {
                        width: '400px',
                        height:'auto',
                        padding: '25px'
                    }
                });
                $('.cart-confirm').addClass("one_time_hide");
            }
         });
      } else if ($(".cart-confirm").hasClass("one_time_hide"))
        {
            $('.cart-confirm').removeClass("one_time_hide");
        }
      // // Report product view based on either loctmpl attribute (if it exists) or last QV location.
      // // Call with URL_CLICK 0 to unset location override. We only neeed it for for add to cart.
      // // This seems kind of horrible to me.
      // if ( typeof Analytics =='object' ){
      //     var locType = $(thisButton).attr("loctmpl");
      //     var params = {};
      //     if (locType) {
      //         location_params = locType.split(",");
      //         params['TYPE_LOCATION'] = location_params[0];
      //         params['PRODUCT_KEY'] = location_params[1];
      //         params['URL_CLICK'] = 0;
      //         Analytics.reportProductView(params);
      //     }
      // }
      $(document).trigger("addToCart.success", [resultObj]);
    },
    onFailure: function(ss) {
      var errorObjectsArray = ss.getMessages();
        $(document).trigger("addToCart.failure", [errorObjectsArray]);
        // // Escape any html in the alert box.
        prodAddedMsg = $('<div/>').html(errorObjectsArray[0].text).text();
        // TODO replace alert message with something nicer
        //alert(prodAddedMsg);
        generic.overlay.launch({
            content: errorObjectsArray[0].text,
            includeBackground: true,
            cssClass: "add_cart_response",
            cssStyle: {
               width: '300px',
               height:'auto',
               padding:'25px'
            }
        });
        var resultObj = ss.getCartResults();
        $(document).trigger("addToCart.success", [resultObj]);
      }
  });
};


site.productData = {
  isActive: function(skuData) {
    return skuData.INVENTORY_STATUS && skuData.INVENTORY_STATUS == 1;
  },
  isTempOutOfStock: function(skuData) {
    return skuData.INVENTORY_STATUS && skuData.INVENTORY_STATUS == 2;
  },
  isComingSoon: function(skuData) {
    return skuData.INVENTORY_STATUS && skuData.INVENTORY_STATUS == 3;
  },
  isInactive: function(skuData) {
    return skuData.INVENTORY_STATUS && skuData.INVENTORY_STATUS == 5;
  },
  isSoldOut: function(skuData) {
    return skuData.INVENTORY_STATUS && skuData.INVENTORY_STATUS == 7;
  },
  isShoppable: function(skuData) {
    return site.productData.isActive(skuData) ||  site.productData.isTempOutOfStock(skuData);
  }
};

site.addToFavorites = function(args) {

  var params = {
    "_SUBMIT": "alter_collection",
    "action": "add"
  };

  var skuBaseId;
  if (args.skuData && args.skuData.SKU_BASE_ID) {
    skuBaseId = args.skuData.SKU_BASE_ID;
  } else if (args.skuBaseId) {
    skuBaseId = args.skuBaseId;
  } else {
    return null;
  }
  params.SKU_BASE_ID = skuBaseId;

  var catBaseId = '';
  if (args.skuData && args.skuData.PARENT_CAT_ID) {
    var matchResult = args.skuData.PARENT_CAT_ID.match("[0-9]+");
    if (matchResult) {
      params.CAT_BASE_ID = matchResult[0];
    }
  }

  if ($.cookie('csrftoken')) {
    params._TOKEN = $.cookie('csrftoken');
  }

  var id = generic.jsonrpc.fetch({
    method : 'rpc.form',
    params: [params],
    onSuccess:function(jsonRpcResponse) {
      var d = jsonRpcResponse.getData();
      var r = d.ac_results[0].result;

      if (r.KEY == 'SKU_ALREADY_IN_COLLECTION.ADD_SKU.COLLECTION.SAVE') {
        $(document).trigger("addToWishlist.exists", [r]);
      } else if (r.SUCCESS == 1 || r.KEY == 'SUCCESS.ADD_SKU.COLLECTION.SAVE') {
        var cr = jsonRpcResponse.getCartResults();
        $(document).trigger("addToWishlist.success", [cr]);
      }
    },
    onFailure: function(jsonRpcResponse) {
      console.log("add to favorites failure");
      console.log(jsonRpcResponse.getError());
    }
  });
};

/*
 * DEPRECATED - Use createAddButton instead
 */
site.addButton = function(args) {
  var p = args.productData;
  var $addButton = $(".js-add-to-cart[data-product-id=" + p.PRODUCT_ID + "]");
  var $notifyMe = $('.js-notify-me[data-product-id=' + p.PRODUCT_ID + ']');

  $addButton.bind("click", function(clickEvt) {
    var skuBaseId = $(this).attr("data-sku-base-id");
    var quantity = $(this).attr("data-qty");
    site.addToCart({skuBaseId: skuBaseId, quantity : quantity}  );
  });
  var selectSku = function(skuBaseId) {
    $addButton.attr("data-sku-base-id", skuBaseId);
    $notifyMe.attr('data-sku-base-id', skuBaseId);
    updateInvStatus();
  }
  var updateInvStatus = function() {
    var currentSkuId = "SKU" + $addButton.attr("data-sku-base-id");
    var skuDataL2 = $(document).data(currentSkuId);
    if (skuDataL2 && !skuDataL2.isShoppable) {
      $addButton.hide();
    } else {
      $addButton.show();
    }
  }

  selectSku(p.skus[0]["SKU_BASE_ID"]);

  $(document).on('sku:select', function(e, skuData) {
    if (skuData.PRODUCT_ID == p.PRODUCT_ID) {
      selectSku(skuData.SKU_BASE_ID);
    }
  });
  $(document).bind('inventory_status_stored', function(e, skuData) {
    updateInvStatus();
  });
  var selectQuantity = function(quantity) {
    $addButton.attr("data-qty", quantity);
  }
  $(document).bind('qty:select', function(e, quantity) {
    selectQuantity(quantity);
  });
  var selectReplAmount = function(replAmount) {
    $addButton.attr("data-replenishment", replAmount);
  }
  $(document).bind('repl:select', function(e, replAmount) {
    selectReplAmount(replAmount);
  });
};

site.addFavoritesButton = function($favButton) {
  var that = {};
  that.$favButton = $favButton;

  $favButton.bind("click", function(clickEvt) {
    clickEvt.preventDefault();
    var skuBaseId = $(this).attr("data-sku-base-id");
    site.addToFavorites({skuBaseId: skuBaseId});
  });
  var selectSku = function(skuBaseId) {
    $favButton.attr("data-sku-base-id", skuBaseId);
  };
  $favButton.bind('sku:select', function(e, skuData) {
    selectSku(skuData.SKU_BASE_ID);
    e.stopPropagation();
  });
};

site.qtySelectMenu = function($selectNode) {
  var that = {
    $selectNode: $selectNode
  };
  that.$selectNode.on("change", function(event) {
    var productId = that.$selectNode.attr("data-product-id");
    var quantity = that.$selectNode.val();
    site.qtySelect(productId, quantity);
  });
  return that;
};

//
// site.sizeSelectMenu = function($selectNode) {
//   var that = {
//     $selectNode: $selectNode,
//   };
//   that.$selectNode.on("change", function(event) {
//     var selectedSku = $that.selectNode.find('option:selected').attr('data-sku-base-id');
//       var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
//       site.skuSelect(skuData);
//     });
//     var productId = that.$selectNode.attr("data-product-id");
//     var quantity = that.$selectNode.val();
//     site.qtySelect(productId, quantity);
//   });
//   return that;
// };


site.createAddButton = function($addButton) {
  var that = {};
  that.$addButton = $addButton;
  that.productId = that.$addButton.attr("data-product-id");
  that.replAmount = that.$addButton.attr("data-replenishment");
  that.$quantity = $('.js-quantity').filter("[data-product-id=" + that.productId +  "]");
  that.$notifyMe = $('.js-notify-me').filter('[data-product-id=' + that.productId + ']');
  that.$basicReorder = $('.js-basic-reorder').filter('[data-product-id=' + that.productId + ']');
  that.$soldOutStatus = $('.js-inv-status-list').filter('[data-product-id=' + that.productId + ']');
  that.$replContainer = $('.product-replenishment-select');
  //For new MPP template
  if($('.extended-mpp').length > 0) {
    that.$quantity = $('.js-quantity', that.$addButton.parents("li")).filter("[data-product-id=" + that.productId +  "]");
  }

  // click handler
  that.$addButton.on('click', function(e) {
    e.preventDefault();
    var skuBaseId = $(this).attr("data-sku-base-id");
    if (!skuBaseId || skuBaseId.length<1) return null;
    var args = {skuBaseId: skuBaseId};
    // quantity
    var quantity = $(this).attr("data-qty");
    if (!!quantity) {
      args.quantity = quantity;
    }
    // replenishment
    var replAmount = parseInt($(this).attr("data-replenishment"));
    if (!!replAmount) {
      args.replAmount = replAmount;
    }

    site.addToCart(args);
  });

  // SKU change handler
  var selectSku = function(skuBaseId) {
    that.$addButton.attr("data-sku-base-id", skuBaseId);
    that.$notifyMe.attr('data-sku-base-id', skuBaseId);
    // fix for IE 9 issue with statement above
    if ($('body').hasClass('ie-9')) {
      $('.product-full__add-button').attr('data-sku-base-id', skuBaseId);
    }
    that.updateInvStatus();
  };

  that.$addButton.on('sku:select', function(e, skuData) {
    if (skuData.PRODUCT_ID == that.productId) {
      selectSku(skuData.SKU_BASE_ID);
      that.updateInvStatus();
    }
    e.stopPropagation();
  });

  // Inventory Status change handler
  that.updateInvStatus = function() {
    var currentSkuId = "SKU" + that.$addButton.attr("data-sku-base-id");
    var skuDataL2 = $(document).data(currentSkuId);
    var isRefillable = false;

    // Helper function to search through page_data for product and sku data based on a single sku
    var _searchCatalog = function(searchSku) {
      var catalog = {};
      var products = [];
      var filteredSku = false;

      for (var key in page_data) {
        if (!page_data.hasOwnProperty(key)) {
          continue;
        }

        catalog = page_data[key] || {};
        products = catalog.hasOwnProperty('products') ? catalog.products : [];

        for (var i = 0, j = products.length; i < j; i++) {
          filteredSku = false;

          if (!!products[i].skus) {
            filteredSku = _.find(products[i].skus, function(s) {
              return s.SKU_ID == searchSku;
            });
          }

          if (!!filteredSku) {
            return {
              product : products[i],
              sku     : filteredSku
            };
          }
        }
      }

      return {
        product : {},
        sku     : {}
      };
    };

    // Only on SPP pages check refillable status
    if ($(document.body).hasClass('page-product') && typeof page_data !== 'undefined') {
      var data = _searchCatalog(currentSkuId);
      isRefillable = data.sku.REFILLABLE || false;
    }

    if (skuDataL2 && !skuDataL2.isShoppable) {
      that.$addButton.hide();
      that.$quantity.hide();
      that.$notifyMe.hide();
      that.$basicReorder.hide();
      if(skuDataL2.isPreOrder && skuDataL2.INVENTORY_STATUS == 2){
        that.$addButton.show();
        that.$quantity.show();
      }
      // Enable notify me button, if sku is soldout and basic re-order
      if (skuDataL2.INVENTORY_STATUS === 7 && skuDataL2.LIFE_OF_PRODUCT === 2) {
        that.$notifyMe.show();
        that.$basicReorder.show();
      }
    } else {
      that.$addButton.show();
      that.$quantity.show();
      that.$notifyMe.hide();
      that.$basicReorder.hide();
    }

    // show select if sku if it is refillable
    if( !_.isUndefined(skuDataL2) ){
      if (isRefillable && that.$replContainer.length > 0) {
        that.$replContainer.show();
      } else {
        that.$replContainer.hide();
      }
    }else{
      console.log('no sku data');
    }

    // Hide ReplContainer & InventoryContainer if sku is soldout and basic re-order
    if (!_.isUndefined(skuDataL2)) {
      if (skuDataL2.INVENTORY_STATUS === 7 && skuDataL2.LIFE_OF_PRODUCT === 2 && that.$notifyMe.length > 0) {
        that.$replContainer.hide();
        that.$soldOutStatus.hide();
      } else {
        that.$soldOutStatus.show();
      }
    }
    //Show Estimated delivery date in SPP
    if (skuDataL2 && site.EDD && site.EDD.showEstimatedDeliveryDate) {
      site.EDD.showEstimatedDeliveryDate({
        isShoppable: skuDataL2.isShoppable && !(skuDataL2.INVENTORY_STATUS && skuDataL2.INVENTORY_STATUS == 2)
      });
    }
    if (skuDataL2 && site.EDD && site.EDD.whenWillMyOrderArrive) {
      site.EDD.whenWillMyOrderArrive({
        isShoppable: skuDataL2.isShoppable && !(skuDataL2.INVENTORY_STATUS && skuDataL2.INVENTORY_STATUS == 2)
      });
    }
  };

  that.$addButton.on('inventory_status_stored', function(e, skuData) {
    that.updateInvStatus();
    e.stopPropagation();
  });

  // Quantity change handler
  var selectQuantity = function(quantity) {
    that.$addButton.attr("data-qty", quantity);
  };
  that.$addButton.on('qty:select', function(e, quantity) {
    selectQuantity(quantity);
    e.stopPropagation();

  });

  // replenishment change handler
  var selectReplAmount = function(replAmount) {
    that.$addButton.attr("data-replenishment", replAmount);
  };
  that.$addButton.on('repl:select', function(e, replAmount) {
    selectReplAmount(replAmount);
    e.stopPropagation();
   });

  return that;
};

// Replenishment
site.replSelect = function(prodId, replAmount) {
  var prodSlctr = "[data-product-id='" + prodId + "']";
  $(prodSlctr).trigger('repl:select', replAmount);
};

site.skuSelect = function(skuData) {
  if (!skuData) return;
  var prodId = skuData.PRODUCT_ID;
  var prodSlctr = "[data-product-id='" + prodId + "']";
  $(prodSlctr).trigger('sku:select', skuData);
};

site.qtySelect = function(prodId, qty) {
  var prodSlctr = "[data-product-id='" + prodId + "']";
  $(prodSlctr).trigger('qty:select', qty);
};


(function($) {
  Drupal.behaviors.ELB_addToCartButton = {
    attach: function(context, settings) {
      $('.js-add-to-cart').each( function() {
        var btn = site.createAddButton($(this));
      });
    }
  };
  Drupal.behaviors.ELB_addToFavorites = {
    attach: function(context, settings) {
      $('.js-add-to-favorites-btn').each( function() {
		    site.addFavoritesButton($(this));
      });
    }
  };
})(jQuery);
