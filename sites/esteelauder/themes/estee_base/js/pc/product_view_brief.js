
var site = site || {};
site.product = site.product || {};
site.product.view = site.product.view || {};


site.product.view.brief = function (args) {

  var that = {};

  that.$productView = $(args.containerNode);
  if (that.$productView.length < 1) return null;

  that.productData = args.productData;
  if (typeof that.productData != "object") return null;

  that.productId = args.productData.PRODUCT_ID;
  that.catId = that.productData.PARENT_CAT_ID;
  that.tagIds = that.catId +  '~' + that.productId;

  var isShaded = that.productData.shaded;
  var $productImageContainer = $('.product_brief__image-container', that.$productView);
  var $productImage = $('.product_brief__image', that.$productView);
  var $productHeaders = $('.product_brief__headers', that.$productView);
  var $productPanel = $('.product_brief__panel', that.$productView);
  var $productSubPanels = $('.product_brief__sub-panel', that.$productView);
  var $productDescSubPanel = $('.product_brief__description .product_brief__sub-panel', that.$productView);
  var $productButtonSub = $('.product_brief__buttons-container .product_brief__sub-panel', that.$productView);
  var $closePanel = $('.product_brief__sub-panel-close', that.$productView);
  var $productSelects = $('.product_brief__quantity, .product_brief__sku-sizes__select', that.$productView);
  var $quantitySelect = $('.product_brief__quantity', that.$productView);
  var $skintypeSelect = $('.product-brief__skintype-select', that.$productView);
  var $addToBag = $('.product_brief__button--add-to-bag', that.$productView);
  var $inventoryStatusMsg = $('ul.js-inv-status-list li', that.$productView);
  var enableDiscPrice = Drupal.settings.product_info.show_discount_price;
  //$productSelects.selectBox();

  var $btnProductPanel = $('.product_brief__button-panel', that.$productView);
  $btnProductPanel.click( function(e) {
    e.preventDefault();
    $(document).trigger("MPP:productQV", that.tagIds);
    openSubPanel(that.productId);
    //Hide the inventory status message in quickview when morethan one sku's associated with the product
    if(that.productData.skus.length > 1)
    {
      $inventoryStatusMsg.hide();
    }
  });
  var skus = that.productData.skus;
  var preOrderCount = 0;
  var $btnAddToBag = $('li[data-product-id="'+that.productData.PRODUCT_ID+'"] .product_brief__button--shop-now, li[data-productid="'+that.productData.PRODUCT_ID+'"] .product_brief__button--shop-now');
  $(skus).each(function(i, product) {
    if(product.isPreOrder ==1) {
      preOrderCount += 1;
    }
  });
  if(preOrderCount == skus.length) {
    $btnAddToBag.text(site.translations.product.pre_order);
  }
  if(isShaded){
    var shadePicker = new site.ShadePicker(that.productData);
    var $swatchSelect = $('select.product_brief__swatch-select', that.$productView);
    var $shadeList = $('.shade-list', that.$productView);
    var $shadeListSwatches = $('.shade-list .swatch', that.$productView); // <a>
    var $miscFlag = $('.product_brief__misc-flag-sku', that.$productView);
    var $miscFlagREF = $('.product_brief__misc-flag-reference', that.$productView);

    function miscFlagValue(val){
      var value = val;
      if(value>=1 || value>=2 || value>=3 || value>=5 || value>=94){
        if(value == 5 || value == 94){
          value = 4; // 94 and 5 the same
        }
        var miscFlagText = $miscFlagREF.filter("[data-misc-flag=" + value + "]").html();
        $miscFlag.html(miscFlagText);
      }else{
        $miscFlag.html('');
      }
    }

    if($swatchSelect.length > 0){
      // Top Selling
      that.bestSellingSkus = that.productData.BEST_SELL_SKU_BASE_ID;
      function bestSellersSort(){
        var $swatchLis = $shadeListSwatches.parent();
        // hide all swatch LI's
        $swatchLis.hide();
        // set flag for selecting first SKU
        var select = true;
        // iterate over swatch LI's
        $swatchLis.each(function(i, ele) {
          var $swatchLi = $(this);
          var skuBaseId = $swatchLi.attr('data-sku-base-id');
          // if this swatch is in the best-seller list
          if (_.contains(that.bestSellingSkus, skuBaseId)) {
            $swatchLi.show();
            // select the first best-selling SKU
            if (select) {
              var skuDataToSelect = _.find(that.productData.skus, function(s){ return s.SKU_BASE_ID == skuBaseId; });
              site.skuSelect(skuDataToSelect);
              // set shade name
              // TODO attach this to the sku:select event instead
              $('.product_brief__shadename', that.$productView).html(skuDataToSelect.SHADENAME);
              miscFlagValue(skuDataToSelect.MISC_FLAG);
              select = false;
            }
          }
        });
      }
      if(!_.isUndefined(that.bestSellingSkus) && !_.isNull(that.bestSellingSkus)){
        $('.product_brief__all-shades', that.$productView).remove();
        that.bestSellingSkus = that.bestSellingSkus.split(',');
        //console.log(that.bestSellingSkus);
        bestSellersSort();
      }else{
        $('.product_brief__top-shades', that.$productView).remove();
      }

      // colorSelect + intensity
      $swatchSelect.selectBox({mobile: true});
      function updateSwatchSelect(select){
        $(select).selectBox('refresh');
        var $select = $(select).selectBox('control');
        var $selectOption =  $($select).data('selectBox-options');
        var $selectMenuOptions = $('li a', $selectOption);
        // add shade divs to custom select
        $selectMenuOptions.each(function() {
          var swatchClass = $(this).attr('rel');
          swatchClass = 'filter-' + swatchClass.toLowerCase().replace(/ /g,"_");
          swatchClass = swatchClass.toLowerCase();
          $(this).prepend( '<div class="filtered-swatch ' + swatchClass + '"></div>');
        });
      }
      updateSwatchSelect($swatchSelect);

      $swatchSelect.change(function(event) {
        updateSwatchSelect($(this));
        // var that.productData = _.find(page_data['catalog-mpp'].categories[0].products, function(p){ return p.PRODUCT_ID == that.productId; });
        if(!$(this)[0].selectedIndex){
          //console.log( 'top selling');
          if( $('.product_brief__top-shades', $(this)).length ){
            bestSellersSort();
          }else{
            var isInvSorted = $shadeListSwatches.eq(0).parent().data('inventory');
            $shadeListSwatches.parent().show();

            // do not select if it has been inventory sorted (isInvSorted)
            if (!isInvSorted) {
              $shadeListSwatches.eq(0).trigger('click');
            }
            else {
              $(document).trigger('shade_select_first_shoppable');
            }
          }
        }else{
          var swatchFilter = $(this).val();
          // figure out if MISC_FLAG, ATTRIBUTE_COLOR_FAMILY or INTENSITY
          var isMiscFlag = $(this).find(":selected").hasClass('product_brief__misc-flag-option');
          if( isMiscFlag ){
            var miscFlagData = $(this).find(":selected").attr('data-misc-flag');
            var swatchFilterSkus = _.filter(that.productData.skus, function(s){ return s.MISC_FLAG == miscFlagData; });
          }else if( $(this).find(":selected").hasClass('product_brief__color-family') ){
            var swatchFilterSkus = _.filter(that.productData.skus, function(s){ return s.ATTRIBUTE_COLOR_FAMILY == swatchFilter; });
          }else if ( $(this).find(":selected").hasClass('product_brief__intensity') ){
            var swatchFilterSkus = _.filter(that.productData.skus, function(s){ return s.INTENSITY == swatchFilter; });
          }

          $shadeListSwatches.parent().hide();
          $(swatchFilterSkus).each(function( index, sku) {
            var skuID = sku.SKU_BASE_ID;
            var $swatch = $shadeListSwatches.filter("[data-sku-base-id=" + skuID +  "]").parent();
            $swatch.show();
          });
          //select first swatch in list

          var $currentSwatchList = $shadeListSwatches.filter("[data-sku-base-id=" + swatchFilterSkus[0].SKU_BASE_ID + "]").parent().closest('.shade-list');
          var $currentSwatchListVisible = $currentSwatchList.find("li").filter(":visible");
          var $currentSwatchListFirstShade = $($currentSwatchListVisible).first();

          var hasInventory = $currentSwatchListFirstShade.data('inventory');
          var currentInventorySku = $currentSwatchListFirstShade.data('sku-base-id');
          var currentSwatchListFirstShadeData = _.filter(that.productData.skus, function(s){ return s.SKU_BASE_ID == currentInventorySku; });

          if (!hasInventory) {
            $shadeListSwatches.filter("[data-sku-base-id=" + swatchFilterSkus[0].SKU_BASE_ID + "]").trigger('click');
            site.skuSelect(swatchFilterSkus[0]);
          } else {
            $currentSwatchListFirstShade.find('a').trigger('click');
            site.skuSelect(currentSwatchListFirstShadeData[0]);
          }

        }
      });
    }

    $shadeListSwatches.click(function(event) {
      var shadename = $(this).attr('name');
      $('.product_brief__shadename', that.$productView).html(shadename);
      var miscFlagSKU = $(this).attr('data-sku-base-id');
      var miscFlagVal = _.filter(that.productData.skus, function(s){ return s.SKU_BASE_ID == miscFlagSKU; });
      //Down Price Updated for Sized Products
      var skuData = miscFlagVal;
      miscFlagValue(miscFlagVal[0].MISC_FLAG);
      var priceNode = $('.product_brief__sku-price', that.$productView);
      priceNode.find('li').hide();
      priceNode.find('li').filter("[data-skubaseid=" + miscFlagSKU + "]").show();
    });
  } // end shaded

  //non shaded - multiple sizes
  var $sizeSelect = $('.js-size-select', that.$productView);
  if($sizeSelect.length && $skintypeSelect.length){
    function updateSizeSelect(){
      $('option', $sizeSelect).prop('disabled', true);
      var selectedSkus = $skintypeSelect.find('option:selected').attr('data-skus').split(',');
      $(selectedSkus).each(function(index, val) {
        var $option = $('option', $sizeSelect).filter("[data-sku-base-id=" + val +  "]");
        $option.prop('disabled', false);
        if(index == 0){
          $option.prop('selected', true);
        }
      });
      $sizeSelect.trigger('change');
    }
    updateSizeSelect();
  }


  if ($sizeSelect.length) {
    $sizeSelect.selectBox();
    if (enableDiscPrice) {
      $sizeSelect.find('option').each(function(index, val) {
        var optionTextHtml = $(val).attr("data-option-text");
        $("ul.js-size-select-selectBox-dropdown-menu").last().find("li").eq(index).find("a").html(optionTextHtml);
      })
      var optionText = $sizeSelect.find('option:selected').attr('data-option-text');
      $sizeSelect.siblings("a.js-size-select").find("span.selectBox-label").html(optionText);
    }

    //Down Price Updated for Sized Products
    $sizeSelect.find('option').each(function(index, val) {
      var optionElement = $("ul.js-size-select-selectBox-dropdown-menu").last().find("li");
      if (optionElement.hasClass('option-discount-sale')) {
        var optionTextHtml = $(val).attr("data-markdown-price");
        $sizeSelect.attr('data-markdown-price', 1);
        optionElement.eq(index).find("a").html(optionTextHtml);
      }
    })
    if ($sizeSelect.attr('data-markdown-price')) {
      var $selectElement = $("ul.js-size-select-selectBox-dropdown-menu").last();
      var optionText = $sizeSelect.find('option:selected').attr('data-markdown-price');
      $sizeSelect.siblings("a.js-size-select").addClass('down-price-selectbox');
      $selectElement.addClass('down-price-selectbox');
      $sizeSelect.siblings("a.js-size-select").find("span.selectBox-label").html(optionText);
    }
    $sizeSelect.selectBox().on('close', function() {
      if ($sizeSelect.attr('data-markdown-price')) {
        var optionChangeText = $(this).find('option:selected').attr('data-markdown-price');
        $(this).siblings("a.js-size-select").find("span.selectBox-label").html(optionChangeText);
      }
    });
  }

  //Down Price Updated for Sized Products
  $sizeSelect.change(function(event) {
    var selectedSku = $(this).find('option:selected').attr('data-sku-base-id');
    var loyaltyPriceEnable = $(this).hasClass('js-size-price-loyalty');
    if (enableDiscPrice) {
      var optionChangeText = $(this).find('option:selected').attr('data-option-text');
      $(this).siblings("a.js-size-select").find("span.selectBox-label").html(optionChangeText);
    }
    if (loyaltyPriceEnable) {
      $(document).trigger('productQV:rendered:LoyaltyPrices', [$(this)]);
    }
    var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
    site.skuSelect(skuData);
  });

  $quantitySelect.change(function(event) {
    var quantity = $(this).val();
    site.qtySelect(that.productId, quantity);
  });

  //get skus to show from skintype
  // only use skintype as reference, set sku from size select
  $skintypeSelect.change(function(event) {
    if($sizeSelect.length){
      updateSizeSelect();
      $sizeSelect.selectBox('refresh');
      // inventory status update/reorder skin type selects
      var selectInvSorted = $sizeSelect.find('option').data('inventory') || false;
      if (!!selectInvSorted) {
        $(document).trigger('refresh_size_select');
        $sizeSelect.trigger('change');
      }
    }else{
      var selectedSku = $(this).find('option:selected').attr('data-skus');
      //console.log(selectedSku);
      var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
      site.skuSelect(skuData);
    }
  });

  // if size exists
  if ($sizeSelect.length) {
    $(document).on('refresh_size_select', function() {
      // L2 Inventory sort
      $sizeSelect.one('change', function(event) {
        //event.stopPropagation();
        var selectedSku = $(this).find('option:selected').not(':disabled').attr('data-sku-base-id');
        var selectedSkuInventory = $(this).find('option:selected').not(':disabled').attr('data-inventory');
        if ( !selectedSku || (selectedSkuInventory == 1) || (selectedSkuInventory == 3) ) {
          return;
        }
        if (selectedSkuInventory != 1) {
          var firstShoppable = $(this).find("option[data-inventory='1']").not(':disabled');
          var $firstShoppableObj = $('option', $sizeSelect).filter("option[data-inventory='1']").not(':disabled');
          if (!firstShoppable) {
            var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID == selectedSku; });
            $sizeSelect.selectBox('refresh');
            site.skuSelect(skuData);
          }
          else {
            var firstShoppableInv = $(firstShoppable).attr('data-sku-base-id');
            if (!firstShoppableInv) {
              return;
            }
            var $firstShoppableInvObj = $('option', $sizeSelect).filter("[data-sku-base-id=" + firstShoppableInv + "]").not(':disabled');
            var skuDataInv = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID == firstShoppableInv; });
            $($firstShoppableInvObj).prop('selected', true);
            $sizeSelect.selectBox('refresh');
            site.skuSelect(skuDataInv);
          }
        }
        else {
          $sizeSelect.selectBox('refresh');
        }
      });
    });

  }
  // var $invStatusList = $(".js-inv-status-list", that.$productView);
  // var invStatusList = site.productView.InvStatusList($invStatusList);

  $productImage.on('sku:select', function(e, skuData) {
    $productImage.css('background-image','url(' + skuData.MEDIUM_IMAGE[0] + ')');
    e.stopPropagation();
  });

  var openSubPanel = function() {
    if(!$productImageContainer.hasClass('is-open')){
      // check sub-panel against prod thumb height
      var productOffsetHeight = $productHeaders.outerHeight() + $productDescSubPanel.outerHeight() + $productButtonSub.outerHeight() + 206 + 20; //small image frame = 206, extra button pad = 20
      var productCurrentHeight = that.$productView.closest('.mpp__product').outerHeight();

      var showPanel = function() {
        //$productImage.addClass('is-open');
        $productImageContainer.addClass('is-open');
        $productPanel.fadeOut( 400, function() {
          $productSubPanels.fadeIn( 400, function() {
            $closePanel.removeClass('hidden');
            //Trigger the select box change event after the quick view section loaded
            var $selectBox = $('.selectBox', that.$productView);
            $selectBox.trigger('change');
          });
        });
        site.product.view.equalRowHeight($('.mpp__product'));
      };

      if(productOffsetHeight > productCurrentHeight) {
        //expand bottom padding to fit $productButtonSub + additional 20px;
        that.$productView.closest('.mpp__product').animate({ height: productOffsetHeight }, 100, showPanel);
      }else if(productOffsetHeight <= productCurrentHeight){
        //if panel fits, just open
        showPanel();
      }
    }
    $closePanel.unbind('click');
    // TODO: collapse entire row if all are closed
    $closePanel.click( function(e) {
      e.preventDefault();
      $productImageContainer.removeClass('is-open');
      $productSubPanels.hide();
      $productPanel.fadeIn(400);
      $(this).addClass('hidden');
    });
  }; // end openSubPanel
  return that;
};

// reordering SKUS (shades/sizes) by inventory status L2
site.product.view.brief.updateSwatchSizeInvStatus = function(products) {

  var allProducts = products;
  if (!allProducts.length) { return; }
  //update inventory
  $.each(products, function(index, product) {
    var skus = product.skus;
    var $shadePicker = $(".js-shade-picker[data-product-id='" + product.PRODUCT_ID +"']");
    var $sizeSelect = $("select.js-size-select[data-product-id='" + product.PRODUCT_ID +"']");

    // find rendered skus (sku base id)
    var mppSkus = [];

    // shades skus
    if ($shadePicker.length > 0) {
      var $swatches = $('.swatches--single .swatch', $shadePicker);
      $swatches.each(function(index, swatch) {
        var skuBaseID = $(this).data('sku-base-id');
        mppSkus.push('SKU'+skuBaseID);
      });
    }

    // multi size skus
    if ($sizeSelect.length > 0) {
      var $sizes = $('option', $sizeSelect);
      $sizes.each(function(index, swatch) {
        var skuBaseID = $(this).data('sku-base-id');
        mppSkus.push('SKU'+skuBaseID);
      });
    }

    var inventoryOrder = {};
    if ($shadePicker.length > 0) {
      $.each(skus, function(index, sku) {
        // update shade picker
        var skuBaseID = sku.SKU_ID;
        skuBaseID = skuBaseID.replace('SKU','');
        var $swatch = $(".swatch[data-sku-base-id='" + skuBaseID +"']").parent('.swatches--single, .swatches--quint');
        $swatch.attr('data-inventory', sku.INVENTORY_STATUS);
        if (inventoryOrder.hasOwnProperty(sku.INVENTORY_STATUS)) {
          inventoryOrder[sku.INVENTORY_STATUS].push($swatch);
        }
        else {
          inventoryOrder[sku.INVENTORY_STATUS] = [$swatch];
        }
      });
      //reorder shadepicker

      //push inventory not 1 (active) nor 2 (back order) nor 3 (coming soon) to bottom of the list
      for (var key in inventoryOrder) {
        if ( (parseInt(key) !== 1) && (parseInt(key) !== 3) ) {
          $.each(inventoryOrder[key], function(index, product) {
            $shadePicker.append(product);
          });
        }
      }
    }

    if ($sizeSelect.length > 0) {
      $.each(skus, function(index, sku) {
        // update size dropdown
        var skuBaseID = sku.SKU_ID;
        skuBaseID = skuBaseID.replace('SKU','');
        var $size = $("option[data-sku-base-id='" + skuBaseID +"']", $sizeSelect);
        $size.attr('data-inventory', sku.INVENTORY_STATUS);
        if (inventoryOrder.hasOwnProperty(sku.INVENTORY_STATUS)) {
          inventoryOrder[sku.INVENTORY_STATUS].push($size);
        }
        else {
          inventoryOrder[sku.INVENTORY_STATUS] = [$size];
        }
      });
      //reorder size dropdown
      //push inventory greater than one to the bottom of the list
      for (var key in inventoryOrder) {
        if ( (parseInt(key) !== 1) && (parseInt(key) !== 3) ) {
          $.each(inventoryOrder[key], function(index, product) {
            $sizeSelect.append(product);
          });
        }
      }
      // refresh selectbox for sizes
      $(document).trigger('refresh_size_select');
    }

    // grab select order from shadepicker
    if ($shadePicker.length > 0) {
      var $swatchesSorted = $('.swatch', $shadePicker);
      var skuOrder = [];
      $swatchesSorted.each(function(index, swatch) {
        skuOrder.push($(swatch).attr('data-sku-base-id'));
      });
      // trigger first sku
      $(document).on('shade_select_first_shoppable', function(e, data) {
        var $firstSwatch = $(".swatch[data-sku-base-id='" + skuOrder[0] +"']");
        $firstSwatch.trigger('click');
      });
    }

  });
};

// reordering sku grid (exposed shade template) by inventory status L2
site.product.view.brief.skuGridInvStatus = function(products) {
  var $mppExtendedGrids = $('.js-mpp-wrapper .js-mpp-product-grid');
  var $gridSkuOrder = $('.js-product-brief[data-sku-id]', $mppExtendedGrids);
  var allProducts = products;
  var gridSkuOrderList = [];
  var mppSkusBrief = [];
  var mppSkusBriefList = [];
  var skusBriefSorted = [];
  var skus;
  var $productWrapper;
  var skuBaseID;
  var $sku;
  var gridIndex;
  var $product;
  var gridSkuId;
  var templateOrderList;
  var skusSortedByInventoryL2;
  var productStatus;
  if (!allProducts.length || !$mppExtendedGrids.length) {
    return;
  }
  $.each($gridSkuOrder, function(i) {
    gridSkuOrderList.push($(this).data('sku-id'));
  });
  $.each($mppExtendedGrids, function(i) {
    $(this).data({'data-grid-index': i});
  });
  $.each(allProducts, function(index, product) {
    skus = product.skus;
    $productWrapper = $(".js-mpp-product[data-productid='" + product.PRODUCT_ID + "']");
    if ($productWrapper.length > 0) {
      $.each(skus, function(index, sku) {
        skuBaseID = sku.SKU_ID;
        skuBaseID = skuBaseID.replace('SKU', '');
        $sku = $(".product_brief[data-sku-id='" + skuBaseID + "']", $productWrapper);
        gridIndex = $sku.parents('.js-mpp-product-grid').data('data-grid-index');
        $product = $sku.parent();
        $product.data({
          'inventory-status': sku.INVENTORY_STATUS,
          'sku-id': skuBaseID,
          'mpp-grid-index': gridIndex
        });
        if ($product.length) {
          mppSkusBrief.push($product);
        }
      });
    }
  });
  // retain template order
  $.each(gridSkuOrderList, function(i, skuId) {
    gridSkuId = skuId.toString();
    templateOrderList = _.find(mppSkusBrief, function(p) {
      return $(p).data('sku-id') === gridSkuId;
    });
    mppSkusBriefList.push(templateOrderList);
  });
  // group list by grids
  var skusSortedByGrids = _.groupBy(mppSkusBriefList, function(p) {
    return $(p).data('mpp-grid-index');
  });
  var inventoryStatusOrder = {
    '1': -1,
    '3': -1,
    '2': 2,
    '7': 3,
    '4': 4,
    '5': 4,
    '0': 4
  };
  $.each(skusSortedByGrids, function(i, skuGrid) {
    // sort by inventory status L2
    skusSortedByInventoryL2 = _.sortBy(skuGrid, function(p) {
      productStatus = $(p).data('inventory-status');
      return inventoryStatusOrder[productStatus];
    });
    skusBriefSorted.push(skusSortedByInventoryL2);
  });
  // add/reordered products
  $.each(skusBriefSorted, function(i, skuGrid) {
    $mppExtendedGrids.eq(i).prepend(skuGrid);
  });
};

// trigger inventory status reordering w L2
$(document).on('mpp_product_inventory_status_sort_sku', function(e, data) {
  site.product.view.brief.updateSwatchSizeInvStatus(data.products);
});
$(document).on('mpp_sku_grid_inventory_status_sort', function(e, data) {
  site.product.view.brief.skuGridInvStatus(data.products);
});
