
var site = site || {};
site.productView = site.productView || {};


$(document).on('prodcat.status', function(e, data) {

  $.each(data.products, function(index, product) {
    if (product) {
      var skus = product.skus;
      $.each(skus, function(index, sku) {
        // save the data somewhere
        $(document).data(sku.SKU_ID, sku);
      });
      //Changing Preorder Button for Single Preorder sku and if all skus are Preorder in MPP
      if (Drupal.settings.globals_variables.enable_preorder) {
        if (($('body').hasClass('brand-aerin') || $('body').hasClass('brand-renutriv') || $('body').hasClass('renutriv-pink-images')) || $('body').hasClass('section-esearch')) {
          var productIdPre = product.PRODUCT_ID;
          var preCount = 0;
          //since product attribute differs for each templates in Aerin & Renutriv
          var preMppButton = $('.js-shopnow-button[data-product-id="' + productIdPre + '"],.js-shopnow-button[data-productid="' + productIdPre + '"],li[data-productid="' + productIdPre + '"] .js-shopnow-button,li[data-product-id="' + productIdPre + '"] .js-shopnow-button, .js-shopnow-button[data-product="' + productIdPre + '"],.js-discover-more-quickshop[data-productid="' + productIdPre + '"], .js-quickshop-show[data-product-id="' + productIdPre + '"]');
          $.each(skus, function(index, sku) {
            if(sku.isPreOrder) {
              preCount += 1;
            }
          });
          if(preCount == skus.length) {
            preMppButton.text(site.translations.product.pre_order);
          }
        }
      }
    }
  });

  $(this).trigger("mpp_product_inventory_status_sort", [data]);
  $(this).trigger('spp_inventory_status_sort', [data]);

  $(".js-inv-status-list").trigger("inventory_status_stored");
  $(".js-add-to-cart").trigger("inventory_status_stored");
  $(".js-quickshop-button").trigger("inventory_status_stored");

  //code will trigger the select box change event on spp page
  if ($('div.spp .selectBox').length) {
    $('.selectBox').trigger('change');
  }
  $(document).trigger('mpp-custom--tout:event');
});

$(document).on('mpp_product_inventory_status_sort', function(e, data) {
  if (typeof site.productSort.sort != 'function') return null;

  var prodsNoShop = [];
  var prodsShop = _.filter(data.products, function(prod) {
    if (prod) {
      // check sku inventory status
      // shoppable as inv stat 1 (active) and 3 (coming soon)
      var skuShoppable = _.filter(prod.skus, function (i) {
        if ((i.INVENTORY_STATUS === 1) || (i.INVENTORY_STATUS === 3)) {
          return i;
        }
      });
      if (skuShoppable.length) {
        return prod;
      }
      else {
        prodsNoShop.push(prod);
      }
    }
  });

  var $mppGrid = $('.mpp__product-grid', this);
  var mppGridSort = $($mppGrid).data('inventory-sort') || false;
  var mppGridSortSku = $($mppGrid).data('inventory-sort-sku') || false;
  var mppGridSortProduct = $($mppGrid).data('inventory-sort-product') || false;
  if (!mppGridSort) {
    return;
  }

  // exp shade template
  if (mppGridSort === 'custom_exposed_shade_mpp') {
    $(this).trigger('mpp_sku_grid_inventory_status_sort', [data]);
    return;
  }

  // cms template option to turn off sku only sorting
  if (!!mppGridSortSku) {
    $(this).trigger("mpp_product_inventory_status_sort_sku", [data]);
  }

  // sort non-shoppables by inv status of product's skus
  prodsNoShop = _.sortBy(prodsNoShop, function(p) {
    var invStatuses = _.uniq(_.pluck(p.skus, 'INVENTORY_STATUS'));
    if (invStatuses == 2) {
      return 2;
    }
    else if (invStatuses == 7) {
      return 3;
    }
    else {
      return 4;
    };

  });

  // and refresh mpp
  var prods = prodsShop.concat(prodsNoShop);
  // template option for product sorting only
  if (!!mppGridSortProduct) {
    site.productSort.sort(prods);
  }
});


site.productView.InvStatusList = function($listNode) {
  var that = {
    $listNode : $listNode
  };
  that.productId = that.$listNode.attr("data-product-id");

  that.$listNode.on("inventory_status_stored", function(e) {
    that.updateInvStatus();
    e.stopPropagation();
  });

  that.updateInvStatus = function() {
    var skuId = that.$listNode.attr("data-sku-id");
    var skuData = $(document).data(skuId);
    if (!skuData || !skuData.INVENTORY_STATUS) return null;
    $("li", that.$listNode).hide();
    $(".js-inv-status-" + skuData.INVENTORY_STATUS, that.$listNode).show();
    var $statusToShow = $(".js-inv-status-" + skuData.INVENTORY_STATUS, that.$listNode);

    // handle retail exclusive skus
    var retail_exclusive_node = that.$listNode.find('.retail-exclusive');
    var is_retail_exclusive = retail_exclusive_node.length;

    if(is_retail_exclusive) {
      $statusToShow = retail_exclusive_node;
    }

    if (is_retail_exclusive || $statusToShow.length > 0) {
      $statusToShow.show();
      that.$listNode.trigger("inventory_status_updated");
    }
    // Pre-order page check
    if(Drupal.settings.globals_variables.enable_preorder) {
      var catalogMpp = page_data['catalog-mpp'];
      var customMpp = page_data['custom-mpp'];
      var catalogSpp = page_data['catalog-spp'];
      var customPreorder = $('body').hasClass('section-preorder-custom');
      var exposedPreorder = $('body').hasClass('section-preorder-exposed');
      var aerinPreorder = $('body').hasClass('brand-aerin');
      var renutrivPreorder = $('body').hasClass('brand-renutriv');
      var renutrivPink = $('body').hasClass('renutriv-pink-images');
      var preorderSearch = $('body').hasClass('section-esearch');
      if (catalogMpp && customMpp) {
        site.isPreOrderExposed(skuData);
      } else if (customMpp && customPreorder) {
        site.isPreOrder(skuData, true);
      } else if (catalogSpp) {
        site.isPreOrder(skuData, false);
      } else if (catalogMpp && exposedPreorder) {
        site.isPreOrderExposed(skuData);
      } else if ((customMpp || catalogMpp) && aerinPreorder) {
        if(site.client.isMobile) {
          site.isPreOrder(skuData, true);
        } else if ($('.quickshop').length) { //Calling preorder function only during quickshop since Aerin MPP doesnt have Preorder templates
          site.isPreOrder(skuData, false);
        }
      } else if ((customMpp || catalogMpp) && (renutrivPreorder || renutrivPink)) {
        site.isPreOrder(skuData, true);
      } else if (catalogMpp) {
        site.isPreOrder(skuData, true);
      }
      // Pre-order check for search pages
      if(preorderSearch) {
        site.isPreOrderSearch(skuData)
      }
    }
  };

  that.updateInvStatus();

  that.$listNode.on('sku:select', function(e, skuData) {
    that.$listNode.attr("data-sku-id", skuData.SKU_ID);
    that.updateInvStatus();
    e.stopPropagation();
  });

  return that;
};

site.productView.collectProductIds = function($context) {
  var prodIds = [];
  $('[data-product-id]', $context).each( function() {
      $this = $(this);
      var prodId = $this.attr('data-product-id');
      var insert = true;
      for (var i=prodIds.length-1; i>-1; i--) {
          if (prodIds[i] == prodId) {
              insert = false;
              break;
          }
      }
      if (insert) {
          prodIds.push(prodId);
      }
      insert = true;
  });
  return prodIds;
};

site.productView.loadL2Data = function(productIds) {
  if (!_.isArray(productIds) || productIds.length<1) return null;

  generic.jsonrpc.fetch({
    "method":   "prodcat.querykey",
    "params":   [{
        products: productIds,
        query_key: 'catalog-mpp-volatile'
    }],
    "onSuccess" : function (response) {
        var v = response.getValue();
        $(document).trigger('prodcat.status', v);
    }
   });
};
site.isPreOrder = function(skuData, page_check) { // page_check == true for MPP pages, false for SPP pages
  var $addToBagBtn;
  if(page_check) {
    var $prodId = skuData.PRODUCT_ID;
    var $skuBaseId = skuData.SKU_BASE_ID;
    $addToBagBtn = site.client.isMobile ? $('button[data-product-id="' + $prodId + '"].js-add-to-cart') : $('li[data-productid="' + $prodId + '"] .js-add-to-cart, li[data-product-id="' + $prodId + '"] .js-add-to-cart');
    var $activePreOrderStatus = $('li[data-productid="'+$prodId+'"] .pre-order_active_msg, li[data-product-id="'+$prodId+'"] .pre-order_active_msg');
    var $tosPreOrderStatus = $('li[data-productid="'+$prodId+'"] .pre-order_tos_msg, li[data-product-id="'+$prodId+'"] .pre-order_tos_msg');
    var $soldOutPreOrderStatus = $('li[data-productid="'+$prodId+'"] .pre-order_sold_msg, li[data-product-id="'+$prodId+'"] .pre-order_sold_msg');
    var $inventortStatusList = $('li[data-productid="'+$prodId+'"] .js-inv-status-list, li[data-product-id="'+$prodId+'"] .js-inv-status-list');
    var $prodContainer = $('li[data-productid="'+$prodId+'"], li[data-product-id="'+$prodId+'"]');
  }
  else {
    var $quickShopContainer = $('.quickshop').length;
    $addToBagBtn = $quickShopContainer ? $('.quickshop .js-add-to-cart') : $('.js-add-to-cart');
    var $activePreOrderStatus = $quickShopContainer ? $('.quickshop .pre-order_active_msg') : $('.pre-order_active_msg');
    var $tosPreOrderStatus = $quickShopContainer ? $('.quickshop .pre-order_tos_msg') : $('.pre-order_tos_msg');
    var $soldOutPreOrderStatus = $quickShopContainer ? $('.quickshop .pre-order_sold_msg') : $('.pre-order_sold_msg');
    var $inventortStatusList = $quickShopContainer ? $('.quickshop .js-inv-status-list') : $('.js-inv-status-list');
    var $prodContainer = $quickShopContainer ? $('.quickshop__description') : $('.product-full__description');
  }
  var skuInfo = $(document).data(skuData.SKU_ID);
  var $preorderSppContainer = $(".js-pr-product[data-product-id='" + skuData.PRODUCT_ID + "']").closest('.page-product');
  if(skuInfo.isPreOrder) {
    $addToBagBtn.addClass('pre-order-button').text(site.translations.product.pre_order);
    $prodContainer.addClass('pre-order-container');
    $preorderSppContainer.addClass('preorder-spp-container');
    if(skuInfo.INVENTORY_STATUS  == 7 ) {
      $inventortStatusList.hide();
      $soldOutPreOrderStatus.html(site.translations.product.pre_order_sold_old_msg);
      $soldOutPreOrderStatus.removeClass('hidden');
      $tosPreOrderStatus.addClass('hidden');
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('pre-order-button-disabled');
    }
    else if(skuInfo.INVENTORY_STATUS  == 2 ) {
      $inventortStatusList.hide();
      site.setPreorderMessage($tosPreOrderStatus, site.translations.product.pre_order_tos_msg, skuInfo, false);
      $soldOutPreOrderStatus.addClass('hidden');
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('pre-order-button-disabled');
    }
    else if(skuInfo.INVENTORY_STATUS  == 1 ) {
      site.setPreorderMessage($activePreOrderStatus, site.translations.product.pre_order_available_msg, skuInfo, true);
      $tosPreOrderStatus.addClass('hidden');
      $soldOutPreOrderStatus.addClass('hidden');
      $addToBagBtn.removeClass('pre-order-button-disabled');
    }
  }
  else {
    if ($('.js-spp-with-form-overlay').length === 0) {
      $addToBagBtn.text(site.translations.product.add_to_bag);
    }
    $activePreOrderStatus.addClass('hidden');
    $tosPreOrderStatus.addClass('hidden');
    $soldOutPreOrderStatus.addClass('hidden');
    $inventortStatusList.show();
    $addToBagBtn.removeClass('pre-order-button pre-order-button-disabled');
    $prodContainer.removeClass('pre-order-container');
    $preorderSppContainer.removeClass('preorder-spp-container');
  }
};

site.isPreOrderExposed = function(skuData) {
  var skuId = skuData.SKU_ID;
  skuId = skuId.replace(/\D/g,'');
  var $addToBagBtn = site.client.isMobile ? $('li[data-sku-id="'+skuId+'"] .js-quickshop-show') : $('li[data-productid="'+skuData.PRODUCT_ID+'"] div[data-sku-id="'+skuId+'"] .js-add-to-cart');
  var $activePreOrderStatus = site.client.isMobile ? $('li[data-sku-id="'+skuId+'"] .pre-order_active_msg') : $('li[data-productid="'+skuData.PRODUCT_ID+'"] div[data-sku-id="'+skuId+'"] .pre-order_active_msg');
  var $tosPreOrderStatus = site.client.isMobile ? $('li[data-sku-id="'+skuId+'"] .pre-order_tos_msg') : $('li[data-productid="'+skuData.PRODUCT_ID+'"] div[data-sku-id="'+skuId+'"] .pre-order_tos_msg');
  var $soldOutPreOrderStatus = site.client.isMobile ? $('li[data-sku-id="'+skuId+'"] .pre-order_sold_msg') : $('li[data-productid="'+skuData.PRODUCT_ID+'"] div[data-sku-id="'+skuId+'"] .pre-order_sold_msg');
  var $prodContainer = site.client.isMobile ? $addToBagBtn.parents('li.js-product-brief[data-sku-id="'+skuId+'"]') : $addToBagBtn.parents('li.mpp__product');
  var $selectSku = site.client.isMobile ? $prodContainer.find('.js-quickshop-show').attr('data-sku-base-id') : $prodContainer.find('.js-add-to-cart').attr('data-sku-base-id');
  if((skuId == $selectSku) && skuData.isPreOrder) {
    $prodContainer.addClass('pre-order-container pre-order-exposed-container');
    $addToBagBtn.addClass('pre-order-button').text(site.translations.product.pre_order);
    if((skuData.INVENTORY_STATUS == 1)) {
      site.setPreorderMessage($activePreOrderStatus, site.translations.product.pre_order_available_msg, skuData, true);
      if(!site.client.isMobile) {
        $addToBagBtn.removeClass('hidden');
      }
    } else if((skuData.INVENTORY_STATUS == 2)){
      site.setPreorderMessage($tosPreOrderStatus, site.translations.product.pre_order_tos_msg, skuData, false);
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('hidden');
    } else if((skuData.INVENTORY_STATUS == 7)){
      $activePreOrderStatus.addClass('hidden');
      $soldOutPreOrderStatus.text(site.translations.product.pre_order_sold_old_msg);
      $soldOutPreOrderStatus.removeClass('hidden');
    }
  }
};

site.isPreOrderSearch = function(skuData) {
  var prodDetail = skuData.PRODUCT_ID;
  var $addToBagBtn = site.client.isMobile ? $('.js-add-to-cart[data-product-id='+prodDetail+']') : $('#product-'+ prodDetail +' .js-add-to-cart');
  var $activePreOrderStatus = site.client.isMobile ? $('div.result[data-product-id='+prodDetail+'] .pre-order_active_msg, .js-quickshop-container .pre-order_active_msg') : $('#product-'+ prodDetail +' .pre-order_active_msg');
  var $tosPreOrderStatus = site.client.isMobile ? $('div.result[data-product-id='+prodDetail+'] .pre-order_tos_msg, .js-quickshop-container .pre-order_tos_msg') : $('#product-'+ prodDetail +' .pre-order_tos_msg');
  var $soldOutPreOrderStatus = site.client.isMobile ? $('div.result[data-product-id='+prodDetail+'] .pre-order_sold_msg, .js-quickshop-container .pre-order_sold_msg') : $('#product-'+ prodDetail +' .pre-order_sold_msg');
  var $inventortStatusList = site.client.isMobile ? $('div.result[data-product-id='+prodDetail+'] .js-inv-status-list, .js-quickshop-container .js-inv-status-list') : $('#product-'+ prodDetail +' .js-inv-status-list');
  var $prodContainer = site.client.isMobile ? $('div.result[data-product-id='+prodDetail+'], .js-quickshop-container') : $('#product-'+ prodDetail +'');
  if(skuData.isPreOrder) {
    $addToBagBtn.addClass('pre-order-button').text(site.translations.product.pre_order);
    $prodContainer.find('.search-product__misc-flag').show();
    $prodContainer.addClass('pre-order-container');
    $prodContainer.addClass('active');
    if(skuData.INVENTORY_STATUS  == 7 ) {
      $soldOutPreOrderStatus.text(site.translations.product.pre_order_sold_old_msg);
      $soldOutPreOrderStatus.removeClass('hidden');
      $tosPreOrderStatus.addClass('hidden');
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('pre-order-button-disabled');
      $inventortStatusList.hide();
    }
    else if(skuData.INVENTORY_STATUS  == 2 ) {
      site.setPreorderMessage($tosPreOrderStatus, site.translations.product.pre_order_tos_msg, skuData, false);
      $soldOutPreOrderStatus.addClass('hidden');
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('pre-order-button-disabled');
      $inventortStatusList.hide();
    }
    else if(skuData.INVENTORY_STATUS  == 1 ) {
      site.setPreorderMessage($activePreOrderStatus, site.translations.product.pre_order_available_msg, skuData, true);
      $tosPreOrderStatus.addClass('hidden');
      $soldOutPreOrderStatus.addClass('hidden');
      $addToBagBtn.removeClass('pre-order-button-disabled');
    }
  } else {
    $addToBagBtn.text(site.translations.product.add_to_bag);
    $addToBagBtn.removeClass('pre-order-button');
    $activePreOrderStatus.addClass('hidden');
    $tosPreOrderStatus.addClass('hidden');
    $soldOutPreOrderStatus.addClass('hidden');
    $inventortStatusList.show();
    $prodContainer.removeClass('pre-order-container active');
  }
}
site.quickShopExposed = function(skuData) {
  var skuDetail = skuData.SKU_ID ? skuData.SKU_ID : "SKU" + skuData.skuId;
  var skuInfo = $(document).data(skuDetail);
  var $addToBagBtn = site.client.isMobile ? $('.product-brief__quickshop-container .js-add-to-cart') : $('.quickshop.extended-mpp-qs .js-add-to-cart');
  var $activePreOrderStatus = site.client.isMobile ? $('.product-brief__quickshop-container .pre-order_active_msg') : $('.quickshop.extended-mpp-qs .pre-order_active_msg');
  var $tosPreOrderStatus = site.client.isMobile ? $('.product-brief__quickshop-container .pre-order_tos_msg') : $('.quickshop.extended-mpp-qs .pre-order_tos_msg');
  var $soldOutPreOrderStatus = site.client.isMobile ? $('.product-brief__quickshop-container .pre-order_sold_msg') : $('.quickshop.extended-mpp-qs .pre-order_sold_msg');
  var $inventortStatusList = site.client.isMobile ? $('.product-brief__quickshop-container .js-inv-status-list') : $('.quickshop.extended-mpp-qs .js-inv-status-list');
  if(skuInfo.isPreOrder) {
  $addToBagBtn.addClass('pre-order-button pre-order-exposed-button').text(site.translations.product.pre_order);
    if(skuInfo.INVENTORY_STATUS  == 7 ) {
      $soldOutPreOrderStatus.text(site.translations.product.pre_order_sold_old_msg);
      $soldOutPreOrderStatus.removeClass('hidden');
      $tosPreOrderStatus.addClass('hidden');
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('pre-order-button-disabled');
      $inventortStatusList.hide();
    }
    else if(skuInfo.INVENTORY_STATUS  == 2 ) {
      site.setPreorderMessage($tosPreOrderStatus, site.translations.product.pre_order_tos_msg, skuInfo, false);
      $soldOutPreOrderStatus.addClass('hidden');
      $activePreOrderStatus.addClass('hidden');
      $addToBagBtn.addClass('pre-order-button-disabled');
      $inventortStatusList.hide();
    }
    else if(skuInfo.INVENTORY_STATUS  == 1 ) {
      site.setPreorderMessage($activePreOrderStatus, site.translations.product.pre_order_available_msg, skuInfo, true);
      $tosPreOrderStatus.addClass('hidden');
      $soldOutPreOrderStatus.addClass('hidden');
      $addToBagBtn.removeClass('pre-order-button-disabled');
    }
  }
  else {
    $addToBagBtn.text(site.translations.product.add_to_bag);
    $addToBagBtn.removeClass('pre-order-button');
    $activePreOrderStatus.addClass('hidden');
    $tosPreOrderStatus.addClass('hidden');
    $soldOutPreOrderStatus.addClass('hidden');
    $inventortStatusList.show();
  }
};

site.setPreorderMessage = function($ele, trKey, dateStr, calculateShipDays) {
  if (dateStr) {
    var releaseSkuDateStr = '' + dateStr.RELEASE_DATE;
    var releaseSkuDate = new Date();
    releaseSkuDate.setFullYear(parseInt('20' + releaseSkuDateStr.substr(0, 2), 10), parseInt(releaseSkuDateStr.substr(2, 2), 10) - 1, parseInt(releaseSkuDateStr.substr(4, 2), 10));
    var preorderDateFormat = typeof Drupal.settings.globals_variables.preorder_date_format !== 'undefined' ? Drupal.settings.globals_variables.preorder_date_format : '';
    if (calculateShipDays) {
      var shipDays = parseInt(site.translations.product.preorder_ships_by_days);
      var days = releaseSkuDate.getDate();
      if (!isNaN(shipDays)) {
        releaseSkuDate.setDate(days += shipDays);
      }
    }
    var formattedDate = '';
    var releaseYear = releaseSkuDate.getFullYear();
    var releaseMonth = ('0' + (releaseSkuDate.getMonth() + 1)).slice(-2);
    var releaseDay = ('0' + releaseSkuDate.getDate()).slice(-2);
    switch (preorderDateFormat) {
      case 'dd/mm/yyyy':
        formattedDate = releaseDay + '/' + releaseMonth + '/' + releaseYear;
        break;
      case 'dd/mm':
        formattedDate = releaseDay + '/' + releaseMonth;
        break;
      default :
        formattedDate = releaseMonth + '/' + releaseDay;
        break;
    }
    var releaseDateReplace = formattedDate;
    if (trKey) {
      trKey = trKey.replace(/::release_date::|::rs_dt::/, releaseDateReplace);
    }
    $ele.html(trKey);
    $ele.removeClass('hidden');
  }
};

(function($) {
  Drupal.behaviors.ELB_invStatusList = {
    attach: function(context, settings) {
      $('.js-inv-status-list').each( function() {
        var invStatusList = site.productView.InvStatusList($(this));
      });

      $(".js-quickshop-button").each(function(){
        $(this).on('inventory_status_stored', function(e) {
          var currentSkuId = "SKU" + $(this).attr("data-sku-base-id");
          var skuDataL2 = $(document).data(currentSkuId);
          if (skuDataL2 && !skuDataL2.isShoppable) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      });

    }
  };
})(jQuery);
