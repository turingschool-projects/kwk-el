
var site = site || {};
site.product = site.product || {};
site.product.view = site.product.view || {};

site.product.view.equalRowHeight = function(gridElement){
  if (!gridElement.length) {
    return;
  }

  var isEsteeEditFilter = ($('.custom-mpp-estee-edit-tem-wrapper').hasClass('product_grid_filter__content'));
  //pass in the repeating product classname, for example mpp__product
  //even out row height
  if (isEsteeEditFilter){
    //site.product.view.equalRowHeightFunc(gridElement);
  } else {
    //setTimeout(function(){ // timeout to let fonts render - @font-face FOUT
    $( window ).load(function() {
      site.product.view.equalRowHeightFunc(gridElement);
      site.product.view.adjustMppProductGrid();
    });
    //},120);
  }
};

site.product.view.equalRowHeightFunc = function(gridElement) {
  var $products = $(gridElement);
  var $grids = $products.parent();
  var $thisGrid;
  var $gridProducts;
  var rowCount = 0;
  var rows = [];
  var row = [];
  var maxProductHeight = 0;
  $grids.each(function() {
    $thisGrid = $(this);
    $gridProducts = $thisGrid.find('li.mpp__product');
    rowCount = site.product.view.findRowCount($gridProducts);
    rows = _.groupBy($gridProducts, function(element, index) {
      return Math.floor(index / rowCount); // 3 or 5 in a row
    });
    rows = _.toArray(rows);
    for (var x in rows) {
      row = rows[x];
      maxProductHeight = Math.max.apply(null, $(row).map(function() {
        return $(this).height();
      }).get());
      // When entire rows are hidden (i.e. filtered), their heights might be less than 0
      // In that case, we don't need to set any height because they're hidden anyway
      if (maxProductHeight > 1) {
        $(row).height(maxProductHeight);
      }
    }
  });
};

site.product.view.findRowCount = function(list){
  var $list = list;
  if($list.length < 1) return null;
  var listInRow = 0;
  $($list).each(function() {
    var $thisGrid = $(this);
    var $previousVisibleGrid = $thisGrid.prevAll(':visible:first');
    if ($previousVisibleGrid.length > 0) {
      if ($thisGrid.position().top !== $previousVisibleGrid.position().top) {
        return false;
      }
      listInRow++;
    }
    else {
      listInRow++;
    }
  });
  return listInRow;
};

site.product.view.fixedBox = function(select){
  var self = this;
  var $select = $(select);
  if($select.length){
    $select.selectBox({ mobile: true }).bind('open', function(){
      //set fixed position
      var $selectMenu = $(select+'-selectBox-dropdown-menu');
      var scrollTop = $(window).scrollTop();
      var menuTop = $selectMenu.css('top').split('px')[0];
      var fixedTop = parseInt(menuTop - scrollTop) + 'px';
      $selectMenu.css({
        'position':'fixed',
        'top': fixedTop,
        //'opacity': 1
      });
      window.onscroll = function (event) {
      //console.log('scrolling');
      }
    });
  }
};

site.product.view.qsFixedBox = function(select) {
  var self = this;
  var $select = $(select);
  var enableDiscPrice = Drupal.settings.product_info.show_discount_price;
  if ($select.length) {
    $select.selectBox({ mobile: true }).bind('open', function(){
      var $selectMenu = $(select+'-selectBox-dropdown-menu');
      var scrollTop = $(window).scrollTop();
      var menuTop = $selectMenu.css('top').split('px')[0];
      var fixedTop = parseInt(menuTop - scrollTop) + 'px';
      $selectMenu.css({
        'position':'fixed',
        'top': fixedTop,
        //'opacity': 1
      });
    });
    var selectControl = $select.selectBox('instance');
    if ($select.hasClass("quickshop__price-size-select") && enableDiscPrice) {
      $select.find('option').each(function(index, val) {
        var optionTextHtml = $(val).attr("data-option-text");
        $("ul.quickshop__price-size-select-selectBox-dropdown-menu").last().find("li").eq(index).find("a").html(optionTextHtml);
      })
      var optionText = $select.find('option:selected').attr('data-option-text');
      $select.siblings("a.quickshop__price-size-select.selectBox-dropdown").find("span.selectBox-label").html(optionText);
    }
    $('#cboxLoadedContent').scroll(function() {
      selectControl.hideMenus();
    });
  }
};

site.product.view.qsFixedBoxEsteeEdit = function(select){
  var self = this;
  var $select = $(select);
  if($select.length){
    $select.selectBox({ mobile: true }).bind('open', function(){
      var $selectMenu = $(select+'-selectBox-dropdown-menu');
      var scrollTop = $(window).scrollTop();
      var menuTop = $selectMenu.css('top').split('px')[0];
      //var fixedTop = parseInt(menuTop - scrollTop) + 'px';
      $selectMenu.css({
        //'position':'fixed',
        'top': menuTop,
        //'opacity': 1
      });
    });
    var selectControl = $select.selectBox('instance');
    $('#cboxLoadedContent').scroll(function() {
      selectControl.hideMenus();
    });
  }
};

site.product.view.getRatingPercentage = function(average) {
  // exit if we have no values
  if(_.isUndefined(average) && _.isNull(average)){
    return;
  }
  var scale = 5;
  var calc = average/scale;
  console.log('calc: ' + calc);
  var percentage = Math.round(parseFloat(calc) * 100);
  return percentage;
};

site.product.view.miscFlagAlign = function(gridElement){
  if($('.product_brief__misc-flag-spacer').length){
    $('.product_brief__misc-flag-spacer').removeAttr('style');
  }
  var $products = $(gridElement);
  var rowCount = site.product.view.findRowCount($products);
  var rows = _.groupBy($products, function(element, index){
    return Math.floor(index/rowCount); //3 in a row
  });
  rows = _.toArray(rows);
  $(rows).each(function(index, row) {
    var hasFlag = 0;
    var flagHeight = '19px';
    $(row).each(function(index, product) {
      if($(product).find('.product_brief__misc-flag').length){
        hasFlag++;
        flagHeight = $(product).find('.product_brief__misc-flag').outerHeight(true);
      }
    });
    $(row).each(function(index, product) {
      if(hasFlag && $(product).find('.product_brief__misc-flag').length == 0){
        var $spacer = $('<div class="product_brief__misc-flag-spacer">');
        $spacer.height(flagHeight)
        $(product).find('.product_brief__header').before($spacer);
      }
    });
  });
};

site.product.view.centerShadePicker = function(context){
  var $shadePicker = $('.js-shade-picker',context);
  $shadePicker.removeAttr('style');
  $shadePicker.css('padding-left', 0);
  var shadePickerWidth = $shadePicker.width();
  var $swatches = $('.shade-picker__swatches',context);
  $swatches.removeAttr('style'); //reset previous
  var swatchWidth = $swatches.eq(0).outerWidth(true);

  // how many should fit
  var swatchInRow = Math.floor(shadePickerWidth/swatchWidth); //last one will be pushed to next row, hence floor
  shadePickerWidth = swatchInRow*swatchWidth;
  $shadePicker.width(shadePickerWidth);
  var rowCount = $swatches.length/swatchInRow; // i.e: 1.3333
  var swatchesWidth = $swatches.length * swatchWidth;
  if(swatchesWidth < shadePickerWidth){
    var shadePickerPadding = (shadePickerWidth - swatchesWidth)/2 + 'px';
    $shadePicker.css('padding-left',shadePickerPadding);
  }

  //deal with last row
  var hasRemainder = (rowCount % 1 != 0) ? 1 : 0;
  if(rowCount > 1 && hasRemainder){
    // find first swatch of last row
    var previousRows = Math.floor(rowCount);
    var lastRowStarts = swatchInRow*previousRows;
    var $lastRowFirstSwatch = $swatches.eq(lastRowStarts);
    var remainingSwatches = $swatches.length - lastRowStarts;
    var lastRowPadding = Math.ceil((shadePickerWidth - (swatchWidth*remainingSwatches))/2) + 'px';
    $lastRowFirstSwatch.css('margin-left',lastRowPadding);
  }
};

site.product.view.adjustMppProductGrid = function() {
  var $productsWrapper = $('.mpp__product-grid');

  $productsWrapper.each(function() {
    var $wrapper = $(this);
    var $mppProductNode = $('li.mpp__product', $wrapper);
    var $visibleProducts = $mppProductNode.not('.hidden');

    //
    //  1. Remove all classes that determine side margins
    //
    $mppProductNode.removeClass('nth-child-3np2 left middle');

    //
    //    2.  Add "middle" and "left" classes to layout new product list correctly
    //
    // $.each($visibleProducts, function(prodIndex, prodValue){
    $visibleProducts.each(function(prodIndex, prodValue) {
      var $me = $(this);

      //
      //  prodIndex % 3 will be 0 , 1, 2, so 1 will be the middle product
      //
      if (prodIndex % 3 === 1) {
        $me.addClass('middle');
      } else if (prodIndex % 3 === 0) {
        $me.addClass('left');
      }
    });
  });

  // This does something very similar to site.product.view.equalRowHeight(),
  // however, that method is called at different points in the process, so
  // we'll just leave both in here for now
  site.product.view.adjustMppProductHeights();
}

site.product.view.adjustMppProductHeights = function() {
  var $productsWrapper = $('.mpp__product-grid').not('.hidden');
  var $thisGrid;
  var $visibleProducts;
  var $rowProducts;
  var numVisibleProducts = 0;
  var startIndex = 0;
  var endIndex = 0;
  var maxRowHeight = 0;
  var numProductsInRow = 0;
  $productsWrapper.each(function() {
    $thisGrid = $(this);
    $visibleProducts = $('li.mpp__product', $thisGrid).not('.hidden');
    numVisibleProducts = $visibleProducts.length;
    numProductsInRow = site.product.view.findRowCount($visibleProducts);
    for (startIndex = endIndex = 0; startIndex < numVisibleProducts; startIndex = endIndex) {
      endIndex = startIndex + numProductsInRow;
      $rowProducts = $visibleProducts.slice(startIndex, endIndex);
      maxRowHeight = Math.max.apply(null, $rowProducts.map(function() {
        return $(this).outerHeight();
      }).get());
      $rowProducts.css('height', maxRowHeight + 'px');
    }
  });
};

/**
 * automate the carousel
 */
Drupal.behaviors.mpp_slick = {
  attach: function(context, settings) {
    if ($('.js-mpp-wrapper').length < 1) return null;

    var $headerTouts = $('.tout-wrapper, .js-hero-block-wrapper:not(.no-carousel)');
    var $headerToutCount = $headerTouts.length;

    if ($headerToutCount > 1) {
      $headerTouts.wrapAll('<div class="slick-carousel slick-prodpage" />');
      var $ToutGroup = $('.slick-carousel');
      var carousal_autoplay = Drupal.settings.disable_carousel_autoplay ? false : true;
      $ToutGroup.slick({
        dots: false,
        arrows: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: carousal_autoplay,
        autoplaySpeed: 8000
      });
    }

    // init jquery.fitext
    // fluid text sizes
    $('.js-tout-headline h1').not('.headline--small').not('.headline--small2').not('.headline--small3').fitText(1, {
      maxFontSize: '150px'
    });
  }
};
