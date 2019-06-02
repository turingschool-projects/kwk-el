
var site = site || {};
site.product = site.product || {};
site.product.view = site.product.view || {};

site.product.view.full = function (args) {
  $('.product-full__quantity').selectBoxDefault('selectDefault');
  $('.product-replenishment-select__select').selectBoxDefault('selectDefault');
  $('.spp-product__mini-bag-quantity').selectBoxDefault('selectDefault');
  $('.product-full__price-size-select').selectBoxDefault('selectDefault');

  var that = {
    productData : args.productData,
    productId : args.productData.PRODUCT_ID,
    productCode : args.productData.skus[0].PRODUCT_CODE
  };
  var productName = that.productData.PROD_RGN_NAME;
  var productSubname = that.productData.PROD_RGN_SUBHEADING;
  var product_images = that.productData.XL_IMAGE;
  var $olapicWidgetNode = $('#olapic_specific_widget');
  var $olapicWidgetWrapperNode = $('.js-olapic-widget');

  if (!args.productData) return null;

  $productImages = $('.product-full__images');
  $productImage = $('img',$productImages);
  $productImageCount = $productImage.length;

  var isEsteeEdit = ($('.product-full').hasClass('product-full--estee-edit'));
  var isSPPage = ($('.product-full').length>0);
  var isSPPVideo = 0;

  if ($olapicWidgetWrapperNode.length && $olapicWidgetNode.length) {
    if ($olapicWidgetNode.hasClass('olapic_items_0')) {
      $olapicWidgetNode.closest('.js-olapic-widget').hide();
    } else {
      var observer = new MutationObserver(function(mutationsList) {
        var detectItemClass = $olapicWidgetNode.attr('class').indexOf('olapic_items_');
        for (var mutation in mutationsList) {
          if (detectItemClass !== -1) {
            if ($olapicWidgetNode.hasClass('olapic_items_0')) {
              $olapicWidgetNode.closest('.js-olapic-widget').hide();
            }
            this.disconnect();
          }
        }
      });
      observer.observe($olapicWidgetNode[0], { attributes: true });
    }
  }

  // add video
  if(isEsteeEdit || isSPPage){
    var esteeEditVideo = 0;

    try {
      esteeEditVideo = args.productData.VIDEO_FILE[0];
      isSPPVideo = args.productData.VIDEO_FILE[0];
    }catch(e) {}

    if(esteeEditVideo){
      var videoPath = '/media/export/cms/products/558x768/';
      var videoPathImage = 'el_video_' + args.productData.PRODUCT_ID + '_558x768_0.jpg';
      videoPath = videoPath + videoPathImage;

      var $videoLink = $('<a/>', {
        class: 'video-launcher',
        href: '//www.youtube.com/embed/'+esteeEditVideo+'?autoplay=1&rel=0',
        html: '<img src="'+ videoPath +'" alt="'+productName+'" />'
      });

      var $videoImageContainer = $('<div/>', {
        class: 'product-full__image product-full__video js-prod-level-video',
        html: $videoLink
      }).attr('data-thumb', videoPath).attr('data-video', esteeEditVideo);

      $productImages.append($videoImageContainer);
      var colorBoxClassName = isEsteeEdit ?  'colorbox__estee-edit' : 'colorbox__youtube';
      $('.video-launcher').colorbox({iframe:true, width: '100%', height: '100%', className: colorBoxClassName});
    }
  }

  var startSlider = function() {
    if($('.product-full__images').hasClass('slick-slider')){
      $('.product-full__images').unslick();
    }
    $('.product-full__images').slick({
      dots: true,
      customPaging: function(slider, i) {
        if (isEsteeEdit) {
          var EEthumb = $(slider.$slides[i]).data('thumb');
          return '<div class="js-product-image-thumb product-full__image__thumb" style="background-image: url('+EEthumb+')"></div>';
        } else {
          var thumb = $(slider.$slides[i]).find('img').attr('src');
          return '<div class="js-product-image-thumb product-full__image__thumb" style="background-image: url('+thumb+')"></div>';
        }
      },
      arrows: false,
      infinite: false,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      onBeforeChange: function(args) {},
      onAfterChange: function(args) {
        if (Drupal.settings.analytics.analytics_integrated) {
          $(document).trigger('SLICKCHANGE', args.$slides.get(args.currentSlide));
        }
      }
    });
    // for background
    $(document).on('slick-activated', function(event) {
      var $active = $('.product-full__image.slick-active');
      if ($active.index() === 0) {
        $('.product-full').removeClass('non-bg');
      }else{
        $('.product-full').addClass('non-bg');
      }
    });

    // get SKU Base ID from url and change shade based on that
    var skuBaseIDfromURL = window.location.hash.substr(1);
    if ( skuBaseIDfromURL.length > 1 ) {
      var skuDataFromURL = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID == skuBaseIDfromURL; });
      if (typeof skuDataFromURL != "undefined") {
        $productImages.trigger('sku:select', skuDataFromURL);
        sppPicker.updateSwatches(skuBaseIDfromURL);
        sppPicker.updateSelects(skuBaseIDfromURL);
      }
    }

  };

  $productImage.each(function(index, val) {
    var src = $(this).attr('data-src') || $(this).attr('src');
    var smooshCheck = src.indexOf('smoosh');
    if(smooshCheck > 1) {
      $(this).parent().addClass('smoosh');
    }
  });

  startSlider();

  $productImages.on('sku:select', function(e, skuData) {
    //update main images
    var newImageArray = [];
    newImageArray = skuData.XL_IMAGE;
    var newSmoosh = skuData.XL_SMOOSH;
    var startAtSmoosh = 0;

    if(that.productData.shaded && newSmoosh.length) {
      var currentSlide = $('.product-full__images').slickCurrentSlide();
      if($('.product-full__image').eq(currentSlide).hasClass('smoosh')){
        startAtSmoosh = 1;
      }
      newImageArray.splice(1, 0, newSmoosh);
    }

    // To push product level images into images array
    if(!_.isUndefined(product_images)) {
      if(!_.isNull(product_images) && product_images.length > 0) {
        newImageArray = newImageArray.concat(product_images);
      }
    }

    //getting odd duplicate, make unique
    newImageArray = _.uniq(newImageArray);
    //remove empty elements from array
    newImageArray = newImageArray.filter(function(v){return v!==''});

    //current slide count
    var slideCount = $('.product-full__images .slick-slide').length;
    //create new list
    for(var i = (slideCount-1); i >= 0; i--){
      $('.product-full__images').slickRemove(i);
    }

    var prodIndex = 1;
    $(newImageArray).each(function(index, val) {
      var smooshClass = '';
      //Add a class only for ALT Images
      if (index > 0) { //Exclude class Name for product default image
        if (val.indexOf('el_smoosh') > 1) { //add smoosh class
          smooshClass = 'smoosh';
        }
        else if (val.indexOf('el_sku') > 1) { // add SKU level Alt image class
          index = (that.productData.shaded) ? (index - 1) : index; // Exclude Smoosh image
          smooshClass = 'js-sku-level-image-' + index;
        }
        else if (val.indexOf('el_prod') > 1) {  // add Product level Alt image class
          smooshClass = 'js-prod-level-image-' + prodIndex;
          prodIndex++;
        }
      }
      //add slide
      var newSlide;
      if(isEsteeEdit || isSPPVideo){
        newSlide = '<div class="product-full__image ' + smooshClass + '" data-thumb="'+ val +'"><img src="'+ val + '" alt="'+productName+'" /></div>';
      }else{
        newSlide = '<div class="product-full__image ' + smooshClass + '"><img src="'+ val + '" alt="'+productName+'" /></div>';
      }
      $('.product-full__images').slickAdd(newSlide);
    });

    if((isEsteeEdit || isSPPVideo) && esteeEditVideo){
      $('.product-full__images').slickAdd($videoImageContainer);
      var colorBoxClassName = isEsteeEdit ?  'colorbox__estee-edit' : 'colorbox__youtube';
      $('.video-launcher').colorbox({iframe:true, width: '100%', height: '100%', className: colorBoxClassName});
    }

    if(startAtSmoosh){
      // go to the second slide 'smoosh mode'
      $('.product-full__images').slickGoTo(1);
    }

    //Down Price Updated for Shaded Products
    var price2 = (_.isUndefined(skuData.PRICE2)) ? '' : skuData.PRICE2;
    var formattedPrice2 = (_.isUndefined(skuData.formattedPrice2)) ? '' : skuData.formattedPrice2;
    var formattedPrice = (_.isUndefined(skuData.formattedPrice)) ? '' : skuData.formattedPrice;
    var productSize = (_.isUndefined(skuData.PRODUCT_SIZE)) ? '' : skuData.PRODUCT_SIZE;
    var priceNode = $('.product-full__price-text');
    if (price2) {
      productSize = (productSize!== null ? (productSize + '  ') : '');
      var optionTextHtml =  productSize +'<span class="product__price--non-sale">'+ formattedPrice2 +'</span><span class="on-sale  product__price--sale">'+ formattedPrice +'</span>';
      priceNode.html(optionTextHtml);
    } else {
      if (productSize !== null && productSize !== '') {
        priceNode.html(productSize +'  '+ skuData.formattedPrice);
      } else {
        priceNode.html(skuData.formattedPrice);
      }
    }

  });

  var skuData = that.productData.skus;
  // Single SKU product use Case. Ex: Sized has Single Sku, Non Sized and Non Shaded product type
  if(!that.productData.shaded && skuData.length == 1) {
    $productImages.trigger('sku:select', that.productData.skus[0]);
  }

  // shade filter
  if(that.productData.shaded){
    if(!Drupal.settings.globals_variables.enable_deep_link) {
      var sppPicker = new site.ShadePicker(that.productData);
    }
    var $shadeFilterItem = $('.product-full__shade-filter-item');
    var $swatches = $('.swatch','.shade-list');

    $shadeFilterItem.click(function(event) {
      $shadeFilterItem.removeClass('is_selected');
      $(this).addClass('is_selected');
      if($(this).hasClass('all-item')){
        $swatches.parent().show();
        $swatches.first().click();
      }else if($(this).hasClass('intensity-item')){
        var intensity = $(this).attr('data-intensity');
        $swatches.parent().hide();
        var $swatchesFiltered = $swatches.filter("[data-intensity=" + intensity +  "]");
        $swatchesFiltered.parent().show();
        $swatchesFiltered.first().click();
      }else if($(this).hasClass('misc-flag-item')){
        var miscFlag = $(this).attr('data-misc-flag');
        $swatches.parent().hide();
        var $swatchesFiltered = $swatches.filter("[data-misc-flag=" + miscFlag +  "]");
        $swatchesFiltered.parent().show();
        $swatchesFiltered.first().click();
      }
    });

    if(isEsteeEdit) {
      //center shades
      site.product.view.centerShadePicker($('.product-full--estee-edit'));
      $(window).on('resize', _.debounce(function() {
        site.product.view.centerShadePicker($('.product-full--estee-edit'));
      }, 100));
    }
  }

  site.addFavoritesButton($(".js-add-to-favorites"));

  var $quantitySelect = $('.product-full__quantity');
  var $sizeSelect = $('.product-full__price-size-select');
  var $skintypeSelect = $('.product-full__skintype-select');
  var $replenishmentSelect = $('.js-replenishment-select');
  var $addBtn = $('.js-add-to-cart');

  // set the default skintype value in the dropdown to match the one set in .net
  // note that the size select keys off of the skincare dropdown, so this must be set first
  if($skintypeSelect.length){
    // the default sku
    var defaultSku = args.productData.skus[0].SKU_BASE_ID;

    // get the value for the select with the data-skus attribute matching the default sku
    var defaultSkinTypeValue = $("[data-skus='" + defaultSku + "']").attr('value');

    // if there is also a sizeSelect, there may be a list of skus on the data-skus value, so need to match differently
    if ($sizeSelect.length) {
        $skintypeSelect.find('[data-skus]').each( function (index, selectOption){
            if ($(selectOption).attr('data-skus')){
              var skus = $(selectOption).attr('data-skus').split(',');

              $(skus).each(function(index, skuValue){
                if (skuValue == defaultSku){
                  defaultSkinTypeValue = $(selectOption).attr('value');
                }
              });
            }
        });
    }

    // set that as the value of the select
    $(".product-full__skintype-select").val(defaultSkinTypeValue);

    // update the select box
    $skintypeSelect.selectBox('refresh');
  }

  //size select init:
  //get skus to show from skintype
  //if size exists
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

  if($sizeSelect.length){
    $sizeSelect.selectBox();
    site.product.view.full.updateMarkDownPriceSizeDropDown($sizeSelect);
  }

  var $sizeSelectMiniBag = $('.js-mini-price-size-select');

  if ($sizeSelectMiniBag.length >0) {
    site.product.view.full.updateMarkDownPriceSizeDropDown($sizeSelectMiniBag);
  }

  $sizeSelect.on('change', function() {
    $(this).find('option').each(function(index){
      if($sizeSelect.val() == $(this).val()) {
        if($(this).prop('disabled'))
          $(this).prop('selected', false);
         else
          $(this).prop('selected', true);
      }
    });
    var selectedSku = $(this).find('option:selected').attr('data-sku-base-id');
    var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
    site.skuSelect(skuData);
  });

  $quantitySelect.change(function(event) {
    var quantity = $(this).val();
    site.qtySelect(that.productId, quantity);
    $('select.spp-product__mini-bag-quantity').val(quantity);
    $('.spp-product__mini-bag-quantity').selectBox('refresh');
  });

  // replenishment
  // When the replenishment select changes we update the add-to-bag
  // button's data-replenishment value
  $replenishmentSelect.on('change', function() {
    $addBtn.attr('data-replenishment', this.value);
  });

  // Set add-to-bag default replenishment value to 0.
  $addBtn.attr('data-replenishment', 0);

  // only use skintype as reference, set sku from size select
  $skintypeSelect.change(function(event) {
    if ($sizeSelect.length) {
      updateSizeSelect();
      $sizeSelect.selectBox('refresh');
      // inventory status update/reorder skin type selects
      var selectInvSorted = $sizeSelect.find('option').data('inventory') || false;
      if (!!selectInvSorted) {
        $(document).trigger('selectFirstShoppable');
      }
    } else {
      var selectedSku = $(this).find('option:selected').attr('data-skus');
      //console.log(selectedSku);
      var skuData = _.find(that.productData.skus, function(sku){ return sku.SKU_BASE_ID== selectedSku; });
      site.skuSelect(skuData);
    }
  });

  // initial state
  $(document).one('ajaxComplete', $sizeSelect, function() {
    $(this).trigger('selectFirstShoppable');
  });
  // select first shoppable // inventory sorting
  $(document).on('selectFirstShoppable', $sizeSelect, function(event) {
    var selectInvSorted = $sizeSelect.find('option').data('inventory') || false;
    if (!selectInvSorted || !$sizeSelect.length) {
      return;
    }
    var selectedSku = parseInt($sizeSelect.find('option:selected').not(':disabled').attr('data-sku-base-id'));
    var selectedSkuInventory = parseInt($sizeSelect.find('option:selected').not(':disabled').data().inventory);
    if (!selectedSku || (selectedSkuInventory === 1) || (selectedSkuInventory === 3)) {
      return;
    }
    if (selectedSkuInventory !== 1) {
      var firstShoppable = $sizeSelect.find('option[data-inventory]').not(':disabled');
      var $firstShoppableObj = $('option', $sizeSelect).filter('option[data-inventory]').not(':disabled');
      if (!firstShoppable) {
        var skuData = _.find(that.productData.skus, function(sku) {
          return sku.SKU_BASE_ID === selectedSku;
        });
        $sizeSelect.selectBox('refresh');
        site.skuSelect(skuData);
      } else {
        var firstShoppableInv = parseInt($(firstShoppable).attr('data-sku-base-id'));
        if (!firstShoppableInv) {
          return;
        }
        var $firstShoppableInvObj = $('option', $sizeSelect).filter('[data-sku-base-id=' + firstShoppableInv + ']').not(':disabled');
        var skuDataInv = _.find(that.productData.skus, function(sku) {
          return sku.SKU_BASE_ID === firstShoppableInv;
        });
        $($firstShoppableInvObj).prop('selected', true);
        $sizeSelect.selectBox('refresh');
        _.defer(function() {
          site.skuSelect(skuDataInv);
        });
      }
    } else {
      $sizeSelect.selectBox('refresh');
    }
  });

  $('.product-full__share').click(function(){
    var url = document.documentURI;
    var title = document.title;
    var img = $('#main img').first().attr("src");

    var twitter_url = 'http://twitter.com/intent/tweet?url=' + encodeURI(url) + '&amp;text=' + encodeURI(title) + '&amp;via=EsteeLauder';
    var facebook_url = 'http://www.facebook.com/sharer.php?u=' + encodeURI(url) + '&amp;t=' + encodeURI(title);

    var pinterest_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURI(url) + '&amp;media=' + encodeURI(window.location.protocol) + '//' + encodeURI(window.location.host) + img + '&amp;description=' + encodeURI(title);

    var socialHTML ='<div class="social-share"><h4 class="title">Share</h4> <ul> <li><a class="social-share__link facebook" href="' + facebook_url + '" target="_blank">Facebook</a></li> <li><a class="social-share__link twitter" href="' + twitter_url + '" target="_blank">Twitter</a></li> <li><a class="social-share__link pinterest" href="' + pinterest_url + '" target="_blank">Pinterest</a></li> </ul> </div> ';
    $.colorbox({
      html: socialHTML,
      className: "colorbox--social-share",
      width: "320px",
      height: "200px"
    });
    return false;
  });

  // Add share icons
  //updateSocialLinks();
  var getShortUrl = function (urlIn, callback) {
      // clean up urlIn
      urlIn = urlIn.replace(/#.*/,"");

      // add swatch info
      var skuBaseId = $('.swatch--selected.selected').attr('data-sku-base-id');
      if ( skuBaseId ) {
          urlIn += "#"+ skuBaseId;
      }

      //var accessToken = '76cd85b016e8bd7a08db6ed187302c4ad8da70f2';
      var accessToken = 'f59213cc485198f3cba5dbc55e75bd6891f77ece';
      var apiUrl = 'https://api-ssl.bitly.com/v3/shorten?access_token=' + accessToken + '&longUrl=' + encodeURIComponent(urlIn);

      $.getJSON(
      apiUrl,
      {},
      function(response)
      {
          if(callback) {
              callback(response.data.url);
          }
      }
      );

  };

  var openSocialMedia = function(newUrl) {
      var deviceAgent = navigator.userAgent;
      var ios = deviceAgent.toLowerCase().match(/(iphone|ipod|ipad)/);
      var win;
      if (ios) {
          window.location=newUrl;
      } else {
          win = window.open(newUrl, '_blank');
          if (win) {
              win.focus();
          }
      }
  }

  var applySocialMediaOffer = function(offerCode) {
    var signedIn = site.userInfoCookie.getValue('signed_in')
    var isLoyaltyMember = site.userInfoCookie.getValue('is_loyalty_member');

    // if the user is signed in and a loyalty member apply the social media offer
    if(signedIn && isLoyaltyMember) {
      var paramObj = {'offer_code' : offerCode, 'do_not_defer_messages' : 1};

      generic.jsonrpc.fetch({
        method: 'offers.apply',
        params: [paramObj]
      });
    }
  }

  if ($('.product-full__personal').find('.social-share-icons').length > 0) {

    var url = document.documentURI;
    var title = document.title;
    var shareCopyLine1 = "Whatâ€™s all the buzz about?";
    var shareCopyLine2 = "Check out " + productName + " from @EsteeLauder!";
    var shareCopyLine3 = '';
    var isLoyaltyMember = parseInt(site.userInfoCookie.getValue('is_loyalty_member'));
    if(isLoyaltyMember) {
      shareCopyLine3 = "%0A"+ encodeURI("(Iâ€™m an E-Lister and may receive loyalty points for sharing.)");
    }

    var img = $('#main img').first().attr("src");
    var subjectLine = "Check out " + productName + " from EstÃ©e Lauder";
    var email = 'mailto:?to=%20&body=I thought you might like this product from EstÃ©e Lauder!' + encodeURI(url) + '&subject=' + encodeURI(subjectLine);
    var twitter_url = 'http://twitter.com/intent/tweet?url=' + encodeURI(url) + '&amp;text=' + encodeURI(shareCopyLine2) + shareCopyLine3;
    var facebook_url = 'http://www.facebook.com/sharer.php?u=' + encodeURI(url) + '&quote=' + encodeURI(shareCopyLine1) + '%0A' + encodeURI(shareCopyLine2) + shareCopyLine3;
    var pinterest_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURI(url) + '&amp;media=' + encodeURI(window.location.protocol) + '//' + encodeURI(window.location.host) + img + '&amp;description=' + encodeURI(shareCopyLine1) + '%0A' + encodeURI(shareCopyLine2) + shareCopyLine3;
    $('.product-full__personal .social-share-icons .email').attr('href', email);
    $('.product-full__personal .social-share-icons .facebook').attr('href', facebook_url).attr('offer_code', 'lyl_social_fb');
    $('.product-full__personal .social-share-icons .twitter').attr('href', twitter_url).attr('offer_code', 'lyl_social_twitter');
    $('.product-full__personal .social-share-icons .pinterest').attr('href', pinterest_url).attr('offer_code', 'lyl_social_pinterest');

    // the email icon isn't present, so I didn't actually get to test this part:
    $('.product-full__personal .social-share-icons .email').on("click tap", function(e){
      e.preventDefault();
      getShortUrl( document.location.href, function(result) {
        var url = result;
        var subjectLine = "Check out " + productName + " from EstÃ©e Lauder";
        var body = 'I thought you might like this product from EstÃ©e Lauder!';
        var email = 'mailto:?to=%20&body=' + encodeURI(body) + encodeURI(url) + '&subject=' + encodeURI(subjectLine);
        openSocialMedia(email);
      });
    });

    // pinterest
    $('.product-full__personal .social-share-icons .pinterest').on("click tap", function(e){
      e.preventDefault();
      getShortUrl( document.location.href, function(result) {
        var url = result;
        var img = $('#main img').first().attr("src");
        var pinterest_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURI(url) + '&amp;media=' + encodeURI(window.location.protocol) + '//' + encodeURI(window.location.host) + img + '&amp;description=' + encodeURI(shareCopyLine1) + '%0A' + encodeURI(shareCopyLine2) + shareCopyLine3;
        openSocialMedia(pinterest_url);
      });
      applySocialMediaOffer($(this).attr('offer_code'));
    });

    // facebook
    $('.product-full__personal .social-share-icons .facebook').on("click tap", function(e){
      e.preventDefault();
      getShortUrl( document.location.href, function(result) {
        var url = result;
        var facebook_url = 'http://www.facebook.com/sharer.php?u=' + encodeURI(url) + '&quote=' + encodeURI(shareCopyLine1) + '%0A' + encodeURI(shareCopyLine2) + shareCopyLine3;
        openSocialMedia(facebook_url);
      });
      applySocialMediaOffer($(this).attr('offer_code'));
    });

    // twitter
    $('.product-full__personal .social-share-icons .twitter').on("click tap", function(e){
      e.preventDefault();
      getShortUrl( document.location.href, function(result) {
        var url = result;
        var twitter_url = 'http://twitter.com/intent/tweet?url=' + encodeURI(url) + '&amp;text=' + encodeURI(shareCopyLine2) + shareCopyLine3;
        openSocialMedia(twitter_url);
      });
      applySocialMediaOffer($(this).attr('offer_code'));
    });

  }

  return that;
};
// reordering SKUS (shades/sizes) by inventory status L2
site.product.view.full.updateSwatchSizeInvStatus = function(products) {
  var allProducts = products;
  if (!allProducts.length) {
    return;
  }
  $.each(products, function(index, product) {
    var skus = product.skus;
    var $shadePicker = $(".js-shade-picker[data-product-id='" + product.PRODUCT_ID + "']");
    var $sizeSelect = $(".product-full__price-size-select[data-product-id='" + product.PRODUCT_ID + "'], .js-mini-price-size-select[data-product-id='" + product.PRODUCT_ID + "']");
    var $shadeSelect = $(".js-sku-menu[data-product-id='" + product.PRODUCT_ID + "']");
    var sppSkus = [];
    if ($shadePicker.length > 0) {
      var $swatches = $('[class*="swatches--"] .swatch', $shadePicker);
      $swatches.each(function(index, swatch) {
        var skuBaseID = $(this).data('sku-base-id');
        sppSkus.push('SKU' + skuBaseID);
      });
    }
    if ($sizeSelect.length > 0) {
      var $sizes = $('option', $sizeSelect);
      $sizes.each(function(index, swatch) {
        var skuBaseID = $(this).data('sku-base-id');
        sppSkus.push('SKU' + skuBaseID);
      });
    }

    var inventoryOrder = {};
    if ($shadePicker.length > 0) {
      $.each(skus, function(index, sku) {
        // update shade picker
        var skuBaseID = sku.SKU_ID;
        skuBaseID = skuBaseID.replace('SKU', '');
        var $swatch = $(".swatch[data-sku-base-id='" + skuBaseID + "']").parent('[class*="swatches--"]');
        $swatch.attr('data-inventory', sku.INVENTORY_STATUS);
        if (inventoryOrder.hasOwnProperty(sku.INVENTORY_STATUS)) {
          inventoryOrder[sku.INVENTORY_STATUS].push($swatch);
        } else {
          inventoryOrder[sku.INVENTORY_STATUS] = [$swatch];
        }
      });
      // push inventory status 2,4,5,6 and 7 to bottom of the list
      for (var key in inventoryOrder) {
        if ((parseInt(key) !== 1) && (parseInt(key) !== 3)) {
          $.each(inventoryOrder[key], function(index, product) {
            $shadePicker.append(product);
          });
        }
      }
    }
    // shade select
    if ($shadeSelect.length > 0) {
      $.each($shadeSelect, function() {
        var $thisShadeSelect = $(this);
        var inventoryOrderShades = {};
        $.each(skus, function(index, sku) {
          var skuBaseID = sku.SKU_ID;
          skuBaseID = skuBaseID.replace('SKU', '');
          var $shadeOpt = $('option[data-sku-base-id="' + skuBaseID + '"]', $thisShadeSelect);
          $shadeOpt.attr('data-inventory', sku.INVENTORY_STATUS);
          if (inventoryOrderShades.hasOwnProperty(sku.INVENTORY_STATUS)) {
            inventoryOrderShades[sku.INVENTORY_STATUS].push($shadeOpt);
          } else {
            inventoryOrderShades[sku.INVENTORY_STATUS] = [$shadeOpt];
          }
        });
        for (var key in inventoryOrderShades) {
          if ((parseInt(key) !== 1) && (parseInt(key) !== 3)) {
            $.each(inventoryOrderShades[key], function(index, product) {
              $thisShadeSelect.append(product);
            });
          }
        }
      });
    }

    //size select
    if ($sizeSelect.length > 0) {
      $.each($sizeSelect, function() {
        var $thisSizeSelect = $(this);
        var inventoryOrderSizes = {};
        $.each(skus, function(index, sku) {
          // update size dropdown
          var skuBaseID = sku.SKU_ID;
          skuBaseID = skuBaseID.replace('SKU', '');
          var $size = $("option[data-sku-base-id='" + skuBaseID + "']", $thisSizeSelect);
          $size.attr('data-inventory', sku.INVENTORY_STATUS);
          if (inventoryOrderSizes.hasOwnProperty(sku.INVENTORY_STATUS)) {
            inventoryOrderSizes[sku.INVENTORY_STATUS].push($size);
          } else {
            inventoryOrderSizes[sku.INVENTORY_STATUS] = [$size];
          }
        });
        //reorder size dropdown
        //push inventory greater than one to the bottom of the list
        for (var key in inventoryOrderSizes) {
          if ((parseInt(key) !== 1) && (parseInt(key) !== 3)) {
            $.each(inventoryOrderSizes[key], function(index, product) {
              $thisSizeSelect.append(product);
            });
          }
        }
        $thisSizeSelect.selectBox('refresh');
        $(document).trigger('selectFirstShoppable');
      });
      $sizeSelect.on('sku:select', function(e, skuData) {
        var $sku = $('option', $sizeSelect).filter('[data-sku-base-id=' + skuData.SKU_BASE_ID + ']').not(':disabled');
        $($sku).prop('selected', true);
        $sizeSelect.selectBox('refresh');
        $sizeSelect.each(function(index, element) {
          site.product.view.full.updateMarkDownPriceSizeDropDown($(element));
        });
      });
    }
  });
};

// Code for updating mark down prices on custom select box
site.product.view.full.updateMarkDownPriceSizeDropDown = function($sizeSelect) {
  var customSizedClass = $sizeSelect.attr('class').split(' ')[0];
  var $customSizedElement = $('.' + customSizedClass + '-selectBox-dropdown-menu');
  var $customSelectBoxControl = $sizeSelect.selectBox('control');
  $sizeSelect.find('option').each(function(index, val) {
    var optionElement = $customSizedElement.last().find('li');
    if (optionElement.hasClass('option-discount-sale')) {
      var optionTextHtml = $(val).attr('data-markdown-price');
      optionElement.eq(index).find('a').html(optionTextHtml);
      $sizeSelect.attr('data-is-markdown-price', 1);
    }
  });
  if ($sizeSelect.attr('data-is-markdown-price')) {
    var optionText = $sizeSelect.find('option:selected').attr('data-markdown-price');
    $customSelectBoxControl.find('span.selectBox-label').html(optionText);
  }
  $sizeSelect.selectBox().on('close', function() {
    if ($(this).attr('data-is-markdown-price')) {
      var optionChangeText = $(this).find('option:selected').attr('data-markdown-price');
      $customSelectBoxControl.find('span.selectBox-label').html(optionChangeText);
    }
  });
};

// trigger inventory status reordering w L2
$(document).on('spp_inventory_status_sort', function(e, data) {
  var $sppGrid = $('.product-full', this);
  var sppSortSku = $($sppGrid).data('inventory-sort') || false;
  if (!sppSortSku) {
    return;
  }
  site.product.view.full.updateSwatchSizeInvStatus(data.products);
});
