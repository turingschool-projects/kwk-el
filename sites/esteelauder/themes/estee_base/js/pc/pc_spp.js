
var site = site || {};
site.spp = site.spp || {};

(function($) {
  Drupal.behaviors.ELB_spp = {
    attach: function(context, settings) {
      site.spp.anchornav();

      /* Back to top functioanlity for all SPP products*/
      var $backtoTop = $('.section-product').find('.back-to-top');
      $backtoTop.click(function() {
        $('html, body').animate({scrollTop: 0}, Drupal.ELB.ui.back_top_duration);
      });

      if (!page_data || !page_data['catalog-spp'] || !$.isArray(page_data['catalog-spp']['products'])) return null;
      if (page_data['catalog-spp']['products'].length < 1) return null;
      var productData = page_data['catalog-spp']['products'][0];
      site.spp.minibag({productData: productData});
      site.product.view.full({productData: productData});
      site.product.view.skus();
      site.spp.discoverMore();

      // Personalization SPP initialization
      if ( Drupal.ELB.hasPersonalization() ) {
        if (site.profile.pc && site.profile.pc.SPP) { 
          site.profile.pc.SPP(page_data['catalog-spp']);
        }
      };
    }
  };

  //CX-3730 Deep Link Implementation
  $(window).on('load', function(){
    if (Drupal.settings.globals_variables.enable_deep_link) {
      if (!page_data || !page_data['catalog-spp'] || !$.isArray(page_data['catalog-spp']['products'])) return null;
      var productData = page_data['catalog-spp']['products'][0];
      if (productData.shaded) {
        var sppPicker = new site.ShadePicker(productData);
        sppPicker.shadeInit();
      }
    }
  });
})(jQuery);


site.spp.minibag = function(args){
  var $minibag = $(".spp-product__mini-bag");
  if ($minibag.length < 1) return null;

  var that = {
    productId: $minibag.attr("data-product-id"),
    productData : args.productData
  };

  var fixedBox = function(select){
    var $select = $(select);
    if ($select.length) {
      $select.selectBox({ mobile: true }).bind('open', function() {
        //set fixed position
        var $selectMenu = $(select+'-selectBox-dropdown-menu');
        $selectMenu.addClass('spp-product__mini-bag-show');
        var scrollTop = $(window).scrollTop();
        var menuTop = $selectMenu.css('top').split('px')[0];
        var fixedTop = parseInt(menuTop - scrollTop) + 'px';
        $selectMenu.css({
          'position':'fixed',
          'top': fixedTop,
          //'opacity': 1
        });
      });
    }
  };

  //make mini bag absolute
  fixedBox('.spp-product__mini-bag-quantity');
  if (that.productData.shaded) {
    fixedBox('.spp-product__mini-bag-shade-select');
  }
  var $multipleSizeSelect = $('.spp-product__mini-price-size-select');
  if ($multipleSizeSelect.length > 1) {
    fixedBox('.spp-product__mini-price-size-select');
  }

  //bind to waypoint
  var $spp_mini_bag = $('.spp-product__mini-bag');
  $('.spp-product__details').waypoint(function(direction) {
    if (direction == 'down') {
      $('.spp-product__mini-bag').toggleClass('spp-product__mini-bag-show');
      $('.spp-product__mini-bag-quantity-selectBox-dropdown-menu').toggleClass('spp-product__mini-bag-show');
      $('.spp-product__mini-bag-shade-select-selectBox-dropdown-menu').toggleClass('spp-product__mini-bag-show');
      $('.spp-product__mini-price-size-select-selectBox-dropdown-menu').toggleClass('spp-product__mini-bag-show');
    }
    else {
      $('.spp-product__mini-bag').removeClass('spp-product__mini-bag-show');
      $('.spp-product__mini-bag-quantity-selectBox-dropdown-menu').removeClass('spp-product__mini-bag-show');
      $('.spp-product__mini-bag-shade-select-selectBox-dropdown-menu').removeClass('spp-product__mini-bag-show');
      $('.spp-product__mini-price-size-select-selectBox-dropdown-menu').removeClass('spp-product__mini-bag-show');
    }
  }, { offset: 'bottom-in-view' });

  $('.spp-product__mini-bag-selecter').click(function(event) {
    event.preventDefault();
    $(this).hide();
    // get bottom offset of
    var backToTopPosition = $('.back-to-top').css('bottom');
    backToTopPosition = backToTopPosition.replace('px','');
    backToTopPosition = (parseInt(backToTopPosition,10) + 49) + 'px';
    $('.back-to-top').css('bottom',backToTopPosition);
    $('.spp-product__mini-bag-button-container').removeClass('hidden');
  });

  $multipleSizeSelect.change(function(event) {
    var selectedSku = $(this).find('option:selected').attr('data-sku-base-id');
    var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
    site.skuSelect(skuData);
  });

  $('.spp-product__mini-bag-quantity').change(function(event) {
    var quantity = $(this).val();
    site.qtySelect(that.productId, quantity);
    $('select.product-full__quantity').val(quantity);
    $('.product-full__quantity').selectBox('refresh');
  });
  
  $minibag.on("sku:select", function(e, skuData) {
    $('.spp-product__mini-bag-image', $minibag).attr('src',skuData.XXS_IMAGE);
    e.stopPropagation();
  });

  // modiface foundation finder
  $(document).on('hide_mini_bag', $minibag, function() {
    $minibag.toggleClass('spp-product__mini-bag-show');
  });
  $(document).on('reset_mini_bag', $minibag, function() {
    $minibag.removeClass('spp-product__mini-bag-show');
    $('.back-to-top').removeClass('back-to-top-show');
    $('.spp-product__details').waypoint(function(direction) {
      if (direction == 'down') {
        $minibag.addClass('spp-product__mini-bag-show');
        $('.spp-product__mini-bag-quantity-selectBox-dropdown-menu').addClass('spp-product__mini-bag-show');
        $('.spp-product__mini-bag-shade-select-selectBox-dropdown-menu').addClass('spp-product__mini-bag-show');
        $('.spp-product__mini-price-size-select-selectBox-dropdown-menu').addClass('spp-product__mini-bag-show');
      }
      else {
        $minibag.removeClass('spp-product__mini-bag-show');
        $('.spp-product__mini-bag-quantity-selectBox-dropdown-menu').removeClass('spp-product__mini-bag-show');
        $('.spp-product__mini-bag-shade-select-selectBox-dropdown-menu').removeClass('spp-product__mini-bag-show');
        $('.spp-product__mini-price-size-select-selectBox-dropdown-menu').removeClass('spp-product__mini-bag-show');
      }
    }, { offset: 'bottom-in-view' });
  });

  return that;
};

site.spp.anchornav = function() {
  var self = this;

  var $sppAnchorNav = $('.spp-product__anchor');
  if ($sppAnchorNav.length < 1) return null;
  var $sppAnchorTab = $('.spp-product__anchor-tab');
  var $sppAnchorNavLinks = $('.spp-product__anchor a.spp-product__anchor--scroll');

  var sppAnchorNavOffset = $('.spp-product__anchor').height() + $('.spp-product__anchor').offset().top;
  $('.spp-product__details').waypoint(function(direction) {
    if (direction == 'down') {
      $sppAnchorNav.addClass('is_expanded', { duration:400, children:true });
      $sppAnchorNav.addClass('is_closed', { duration:400, children:true });
    }
    else if (direction == 'up') {
      $sppAnchorNav.removeClass('is_closed', { duration:400, children:true });
      $sppAnchorNav.removeClass('is_expanded', { duration:400, children:true });
    }
  }, { offset: sppAnchorNavOffset });

  $sppAnchorNavLinks.click(function(event) {
    event.preventDefault();
    var sppAnchorNavLink = $(this).attr('href');
    sppAnchorNavLink = sppAnchorNavLink.replace('#','.');
    $sppAnchorNavLink = $(sppAnchorNavLink);
    var anchorOffset = $sppAnchorNavLink.offset().top - $('.page-header').outerHeight();
    if (!$sppAnchorNav.hasClass('is_expanded')) {
      $sppAnchorNav.addClass('is_expanded', {
        duration:400,
        children:true,
        complete: function(){
          $('html,body').animate({scrollTop: anchorOffset },400);
        }
      });
    }
    else{
      $('html,body').animate({scrollTop: anchorOffset },400);
    }
  });

  $('.product-full__detail-link').click(function(event) {
    event.preventDefault();
    $sppAnchorNavLinks.eq(0).trigger('click');
  });

  $sppAnchorTab.mouseenter(function() {
    if ($sppAnchorNav.hasClass('is_closed')) {
      $sppAnchorNav.removeClass('is_closed',400);
    }
  });
  $sppAnchorNav.mouseleave(function() {
    if ($(this).hasClass('is_expanded')) {
      $(this).addClass('is_closed',400);
    }
  });
  $sppAnchorTab.click(function() {
    if ($sppAnchorNav.hasClass('is_closed')) {
      $sppAnchorNav.removeClass('is_closed',400);
    }
    else {
      $sppAnchorNav.addClass('is_closed',400);
    }
  });
};

site.spp.discoverMore = function() {
  var $discoverMoreProducts = $('.discover_more__product');
  if ($discoverMoreProducts.length > 1) {
    site.product.view.equalRowHeight($discoverMoreProducts);
  }
};