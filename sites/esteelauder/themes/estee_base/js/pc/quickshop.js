
var site = site || {};
var Mustache = Mustache || {};
var $BV = $BV || {};

site.quickshop = function(quickshopData) {
  var enableDiscPrice = Drupal.settings.product_info.show_discount_price;
  var that = {
    productData: quickshopData
  };
  that.productData['first_sku'] = that.productData['skus'][0];
  that.productData['XL_IMAGE_0'] = that.productData['skus'][0]['XL_IMAGE'][0];
  that.productId = that.productData.PRODUCT_ID;
  that.catId = that.productData.PARENT_CAT_ID;
  that.tagIds = that.catId + '~' + that.productId;

  //image array
  var $imageArray = that.productData['skus'][0]['XL_IMAGE'];
  var $smoosh = $();
  $imageArray = $imageArray.slice(0);
  if (that.productData.shaded === 1) {
    $smoosh = that.productData['skus'][0]['XL_SMOOSH'];
    if ($imageArray.length === 1) {
      $imageArray.push($smoosh);
    } else if ($imageArray.length > 1) {
      // add smoosh as second image
      $imageArray.splice(1, 0, $smoosh);
    }
  }
  that.productData['IMAGE_ARRAY'] = $imageArray;

  //multiple sizes
  var multipleSizes = _.pluck(that.productData.skus, 'PRODUCT_SIZE');
  multipleSizes = _.uniq(multipleSizes);
  multipleSizes = _.compact(multipleSizes).length > 1 ? true : false;
  if (that.productData.sized && multipleSizes) {
    that.productData['multiple_sizes'] = true;
  } else if ((that.productData.sized && !multipleSizes) || that.productData.shaded) {
    that.productData['multiple_sizes'] = false;
  }

  //misc flag - product level
  var misc_flag = that.productData['MISC_FLAG'];
  if (misc_flag === 1) {
    that.productData['misc_flag_1'] = true;
  } else if (misc_flag === 2) {
    that.productData['misc_flag_2'] = true;
  } else if (misc_flag === 3) {
    that.productData['misc_flag_3'] = true;
  } else if (misc_flag === 94 || misc_flag === 5) {
    that.productData['misc_flag_4'] = true;
  } else if (misc_flag === 15) { /* PHF20150319 i222733 */
    that.productData['misc_flag_5'] = true;
  } else if (misc_flag === 30) {
    that.productData['misc_flag_6'] = true;
  } else if (misc_flag === 17) {
    that.productData['misc_flag_7'] = true;
  } else if (misc_flag === 116) {
    that.productData['misc_flag_8'] = true;
  } else if (misc_flag === 121) {
    that.productData['misc_flag_9'] = true;
  } else if (misc_flag === 122) {
    that.productData['misc_flag_10'] = true;
  } else if (misc_flag === 124) {
    that.productData['misc_flag_11'] = true;
  } else if (misc_flag === 125) {
    that.productData['misc_flag_12'] = true;
  } else if (misc_flag === 126) {
    that.productData['misc_flag_13'] = true;
  } else if (misc_flag === 128) {
    that.productData['misc_flag_14'] = true;
  } else if (misc_flag === 130) {
    that.productData['misc_flag_15'] = true;
  } else if (misc_flag === 24) {
    that.productData['misc_flag_16'] = true;
  }

  var skus = that.productData.skus;
  $(skus).each(function(index, sku) {
    var shadeHex = sku.HEX_VALUE_STRING;
    // explode
    shadeHex = shadeHex.split(',');
    if (shadeHex.length === 1) {
      sku['SWATCH_TYPE'] = 'single';
      sku['HEX_VALUE_1'] = shadeHex[0];
    } else if (shadeHex.length === 2) {
      sku['SWATCH_TYPE'] = 'duo';
      sku['HEX_VALUE_1'] = shadeHex[0];
      sku['HEX_VALUE_2'] = shadeHex[1];
    } else if (shadeHex.length === 3) {
      sku['SWATCH_TYPE'] = 'trio';
      sku['HEX_VALUE_1'] = shadeHex[0];
      sku['HEX_VALUE_2'] = shadeHex[1];
      sku['HEX_VALUE_3'] = shadeHex[2];
    } else if (shadeHex.length === 5) {
      sku['SWATCH_TYPE'] = 'quint';
      sku['HEX_VALUE_1'] = shadeHex[0];
      sku['HEX_VALUE_2'] = shadeHex[1];
      sku['HEX_VALUE_3'] = shadeHex[2];
      sku['HEX_VALUE_4'] = shadeHex[3];
      sku['HEX_VALUE_5'] = shadeHex[4];
    }
    // misc flag
    var sku_misc_flag = sku.MISC_FLAG;
    if (sku_misc_flag === 1) {
      sku['misc_flag_sku_1'] = true;
    } else if (sku_misc_flag === 2) {
      sku['misc_flag_sku_2'] = true;
    } else if (sku_misc_flag === 3) {
      sku['misc_flag_sku_3'] = true;
    } else if (sku_misc_flag === 94 || sku_misc_flag === 5) {
      sku['misc_flag_sku_4'] = true;
    } else if (sku_misc_flag === 15) {
      sku['misc_flag_sku_5'] = true;
    }
  });

  var average = that.productData['AVERAGE_RATING'];
  var scale = 5;
  var calc = average / scale;
  var percentage = Math.round(parseFloat(calc) * 100);
  that.productData['stars_percent'] = percentage;

  var isEsteeEdit = $('body').hasClass('brand-estee_edit');
  var content = isEsteeEdit ? $('script.inline-template[path="quickshop_estee_edit"]').html() : $('script.inline-template[path="quickshop"]').html();
  //var content = $('script.inline-template[path="quickshop"]').html();
  var qs_item = Mustache.render(content, that.productData);

  var quickshopComplete = function() {
    var $quickshop = $('.quickshop');
    var $header = $('.js-quickshop__header', $quickshop);
    if ($header.length && $header.height() > 150) {
      $header.addClass('quickshop__header-small');
    }
    if (that.productData.shaded) {
      new site.ShadePicker(that.productData);
    }
    var addBtn = site.createAddButton($('.js-add-to-cart', $quickshop));
    addBtn.updateInvStatus();
    site.addFavoritesButton($('.js-add-to-favorites', $quickshop));

    $('.shade-list .swatch', $quickshop).eq(0).trigger('click');

    // adjust some css for the extra row of swatches when > 30
    if (!isEsteeEdit) {
      if ($('.shade-list .swatch', $quickshop).length > 30) {
        $('.quickshop__tab-container').css('height', '167px');
        $('.quickshop__price-size.shaded').css('padding-top', '20px');
      }
    }

    if (isEsteeEdit) {
      //center shades
      site.product.view.centerShadePicker($('.quickshop--estee-edit'));
      $(window).on('resize', _.debounce(function() {
        site.product.view.centerShadePicker($('.quickshop--estee-edit'));
      }, 100));
    }

    // for non shaded products in The Estee Edit MPP
    // hide ellipsis and add class to view full url container
    if (isEsteeEdit && !that.productData.shaded) {
      var EsteeEditNonShadedTextDiv = $('.ellipsis', $quickshop);
      var EsteeEditNonShadedViewFullLink = $('.quickshop__view-full__container', $quickshop);

      if (EsteeEditNonShadedTextDiv.length) {
        $(EsteeEditNonShadedTextDiv).addClass('hidden');
      }
      if (EsteeEditNonShadedViewFullLink.length) {
        $(EsteeEditNonShadedViewFullLink).addClass('non-shaded');
      }
    }

    var $quantitySelect = $('.quickshop__quantity');
    var $sizeSelect = $('.quickshop__price-size-select');
    //$quantitySelect.selectBox();
    //$sizeSelect.selectBox();

    if (isEsteeEdit) {
      // customize adjust qsFixedBox (custom select) function for The Estee Edit MPP
      site.product.view.qsFixedBoxEsteeEdit('.quickshop__price-size-select');
      site.product.view.qsFixedBoxEsteeEdit('.quickshop__shade-select');
      site.product.view.qsFixedBoxEsteeEdit('.quickshop__quantity');
    } else {
      site.product.view.qsFixedBox('.quickshop__price-size-select');
      site.product.view.qsFixedBox('.quickshop__shade-select');
      site.product.view.qsFixedBox('.quickshop__quantity');
    }

    //add after XL_SMOOSH is added to tout-mpp-product
    var $productImages = $('.quickshop__image-container');
    var $productImage = $('img', $productImages);
    var esteeEditVideo = 0;
    var $videoImageContainer = $();
    var optionTextHtml = '';
    // add video
    if (isEsteeEdit) {
      try {
        esteeEditVideo = that.productData.VIDEO_FILE[0];
      } catch (e) {
        console.warn('Video unavailable');
      }

      if (esteeEditVideo) {
        var videoPath = '/media/export/cms/products/558x768/';
        var videoPathImage = 'el_video_' + that.productData.PRODUCT_ID + '_558x768_0.jpg';
        videoPath = videoPath + videoPathImage;

        var $videoLink = $('<a/>', {
          class: 'video-launcher',
          href: '//www.youtube.com/embed/' + esteeEditVideo + '?autoplay=1',
          html: '<img src="' + videoPath + '" />'
        });

        $videoImageContainer = $('<div/>', {
          class: 'quickshop__image quickshop__video',
          html: $videoLink
        }).attr('data-thumb', videoPath).attr('data-video', esteeEditVideo);

        $productImages.append($videoImageContainer);
        $('.video-launcher').colorbox({iframe: true, width: '100%', height: '100%', className: 'colorbox__estee-edit'});
      }
    }

    var $productImageCount = $productImage.length;

    $productImage.each(function() {
      var smooshCheck = $(this).attr('src').indexOf('smoosh');
      if (smooshCheck > 1) {
        $(this).parent().addClass('smoosh');
      }
    });

    if ($productImageCount > 1) {
      var slickToggleTimer1;
      var slickToggleTimer2;
      var slickToggle = function slickToggle() {
        slickToggleTimer1 = setTimeout(function() {
          $('.quickshop__image-container').slickNext();
          slickToggleTimer2 = setTimeout(function() {
            $('.quickshop__image-container').slickPrev();
          }, 3000);
        }, 3000);
      };
      $('.quickshop__image-container').slick({
        dots: true,
        customPaging: function(slider, i) {
          //return '<button type="button">' + (i + 1) + '</button>';
          if (isEsteeEdit) {
            var thumb = $(slider.$slides[i]).data('thumb');
            return '<div class="quickshop__image__thumb" style="background-image: url(' + thumb + ')"></div>';
          } else {
            // defualt
            return '<button type="button">' + (i + 1) + '</button>';
          }
        },
        arrows: false,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        onInit: function(args) {
          var slideLength = args.$slides.length;
          if (slideLength >= 2) {
            slickToggle();
          }
        },
        onBeforeChange: function() {},
        onAfterChange: function() {}
      });
      // for background
      $(document).on('slick-activated', function() {
        var $active = $('.quickshop__image.slick-active');
        if ($active.index() === 0) {
          $('.quickshop--estee-edit').removeClass('non-bg');
        } else {
          $('.quickshop--estee-edit').addClass('non-bg');
        }
      });

      $('.quickshop__image-container').on('sku:select', function(e, skuData) {
        window.clearTimeout(slickToggleTimer1);
        window.clearTimeout(slickToggleTimer2);
        //update main images
        var newImageArray = [];
        newImageArray = skuData.XL_IMAGE;
        var newSmoosh = skuData.XL_SMOOSH;
        var startAtSmoosh = 0;

        if (newSmoosh !== undefined && newSmoosh.length) {
          var currentSlide = $('.quickshop__image-container').slickCurrentSlide();
          if ($('.quickshop__image').eq(currentSlide).hasClass('smoosh')) {
            startAtSmoosh = 1;
          }
          newImageArray.splice(1, 0, newSmoosh);
        }

        //getting odd duplicate, make unique
        newImageArray = _.uniq(newImageArray);
        //remove empty elements from array
        newImageArray = newImageArray.filter(function(v) {
          return v !== '';
        });

        //current slide count
        var slideCount = $('.quickshop__image-container .slick-dots li').length;
        //create new list
        for (var i = slideCount - 1; i >= 0; i--) {
          $('.quickshop__image-container').slickRemove(i);
        }

        $(newImageArray).each(function(index, val) {
          //add smoosh class
          var smooshClass = val.indexOf('smoosh') > 1 ? 'smoosh' : '';
          var newSlide = '';
          //add slide
          if (isEsteeEdit) {
            newSlide = '<div class="quickshop__image ' + smooshClass + '" data-thumb="' + val + '"><img src="' + val + '" /></div>';
          } else {
            newSlide = '<div class="quickshop__image ' + smooshClass + '"><img src="' + val + '" /></div>';
          }
          $('.quickshop__image-container').slickAdd(newSlide);
        });

        // add video
        if (isEsteeEdit && esteeEditVideo) {
          $('.quickshop__image-container').slickAdd($videoImageContainer);
          $('.video-launcher').colorbox({iframe: true, width: '100%', height: '100%', className: 'colorbox__estee-edit'});
        }

        // go to the second slide 'smoosh mode'
        if (startAtSmoosh) {
          $('.quickshop__image-container').slickGoTo(1);
        }

        //Down Price Updated for Shaded Products
        var price2 = _.isUndefined(skuData.PRICE2) ? '' : skuData.PRICE2;
        var formattedPrice2 = _.isUndefined(skuData.formattedPrice2) ? '' : skuData.formattedPrice2;
        var formattedPrice = _.isUndefined(skuData.formattedPrice) ? '' : skuData.formattedPrice;
        var productSize = _.isUndefined(skuData.PRODUCT_SIZE) ? '' : skuData.PRODUCT_SIZE;
        var priceNode = $('.quickshop__price-text');
        var priceLoyaltyNode = $('.js-price-loyalty', priceNode).clone();
        if (price2) {
          productSize = productSize !== null ? productSize + '  ' : '';
          if (priceLoyaltyNode && priceLoyaltyNode.length) {
            optionTextHtml = '<span class="product__price--non-sale">' + formattedPrice2 + '</span> ';
            priceNode.html(optionTextHtml);
            optionTextHtml = '<span class="product__price-loyalty on-sale product__price--sale js-price-loyalty">' + formattedPrice + '</span>';
            priceLoyaltyNode.html(formattedPrice).css('display', 'inline-block');
            priceLoyaltyNode.addClass('on-sale product__price--sale');
            priceNode.append(priceLoyaltyNode);
            priceNode.append(' ' + productSize);
          } else {
            optionTextHtml = productSize + '<span class="product__price--non-sale">' + formattedPrice2 + '</span><span class="product__price--sale">' + formattedPrice + '</span>';
            priceNode.html(optionTextHtml);
          }
        } else {
          if (productSize !== '' && productSize !== null) {
            if (priceLoyaltyNode && priceLoyaltyNode.length) {
              priceLoyaltyNode.text(skuData.formattedPrice);
              priceLoyaltyNode.removeClass('on-sale product__price--sale');
              priceNode.html(priceLoyaltyNode);
              priceNode.append('  ' + productSize);
            } else {
              priceNode.html(productSize + ' ' + skuData.formattedPrice);
            }
          } else {
            if (priceLoyaltyNode && priceLoyaltyNode.length) {
              priceLoyaltyNode.text(skuData.formattedPrice);
              priceLoyaltyNode.removeClass('on-sale product__price--sale');
              priceNode.html(priceLoyaltyNode);
            } else {
              priceNode.html(skuData.formattedPrice);
            }
          }
        }
        $(document).trigger('productQV:rendered:LoyaltyPrices', priceNode);
      });
    }
    //Down Price Updated for Sized Products
    if ($sizeSelect.length > 0) {
      $sizeSelect.find('option').each(function(index, val) {
        var optionElement = $('ul.quickshop__price-size-select-selectBox-dropdown-menu').last().find('li');
        if (optionElement.hasClass('option-discount-sale')) {
          optionTextHtml = $(val).attr('data-markdown-price');
          var isMarkdownPrices = true;
          $sizeSelect.attr('data-markdown-price', 1);
          optionElement.eq(index).find('a').html(optionTextHtml);
        }
      });
      if ($sizeSelect.attr('data-markdown-price')) {
        var optionText = $sizeSelect.find('option:selected').attr('data-markdown-price');
        $sizeSelect.siblings('a.quickshop__price-size-select').find('span.selectBox-label').html(optionText);
      }
      $sizeSelect.selectBox().on('close', function() {
        if ($sizeSelect.attr('data-markdown-price')) {
          var optionChangeText = $(this).find('option:selected').attr('data-markdown-price');
          $(this).siblings('a.quickshop__price-size-select').find('span.selectBox-label').html(optionChangeText);
        }
      });
    }

    $sizeSelect.change(function() {
      var selectedSku = $(this).find('option:selected').attr('data-sku-base-id');
      if (enableDiscPrice) {
        var optionChangeText = $sizeSelect.find('option:selected').attr('data-option-text');
        $(this).siblings('a.quickshop__price-size-select.selectBox-dropdown').find('span.selectBox-label').html(optionChangeText);
      }

      var skuData = _.find(that.productData.skus, function(sku) {
        return sku.SKU_BASE_ID === selectedSku;
      });
      site.skuSelect(skuData);
    });

    $quantitySelect.change(function() {
      var quantity = $(this).val();
      site.qtySelect(that.productId, quantity);
    });

    var $invStatusList = $('.js-inv-status-list', $quickshop);
    var invStatusList = site.productView.InvStatusList($invStatusList);
    invStatusList.updateInvStatus();

    // Disable Inventory list based on Re-order
    if ($quickshop.find('.js-basic-reorder:visible').length > 0) {
      $quickshop.addClass('qs-basic-reorder');
      $invStatusList.hide();
    } else {
      $quickshop.removeClass('qs-basic-reorder');
      $invStatusList.show();
    }

    //tabs
    var $qsTabControl = $('.quickshop__tab-control');
    var $qsTabs = $('.quickshop__tab');
    $qsTabs.eq(0).show();
    if ($qsTabControl.length === 1) {
      //hide menu
      $('.quickshop__tabs-control').hide();
    }
    $qsTabControl.addClass('quickshop__tab-control--' + $qsTabControl.length);

    $qsTabControl.click(function() {
      $qsTabControl.removeClass('text--bold');
      $(this).addClass('text--bold');
      var tab = $(this).attr('data-tab');
      $qsTabs.hide();
      $qsTabs.filter('[data-tab=' + tab + ']').show();
      site.ellipsis(that.productData.url);
    });

    $('.quickshop__add-button', $quickshop).click(function() {
      $.colorbox.close();
    });

    $('.quickshop__review-write').click(function(event) {
      event.preventDefault();
      if (typeof $BV !== 'undefined') {
        $BV.ui('rr', 'submit_review', {productId: that.productData.PROD_BASE_ID});
      }
    });

    $(document).trigger('MPP:productQV', [that.tagIds]);

    var $qs_container = $('.quickshop[data-product-id="' + that.productId + '"]');
    if ($qs_container.length) {
      $(document).trigger('MPP:productQV:rendered', [$qs_container]);

      // Trigger the loyalty price formatting
      var $priceLoyaltyNode = $qs_container;
      if (multipleSizes) {
        $priceLoyaltyNode = $qs_container.find('.js-size-price-loyalty');
      }
      $(document).trigger('productQV:rendered:LoyaltyPrices:popupQS', [$priceLoyaltyNode]);
    }
    site.ellipsis(that.productData.url);
  };

  if (isEsteeEdit && $('.mpp__product-grid').length) {
    var $qsContainer = $('.product_brief__quickshop__content');
    $qsContainer.append(qs_item);
    $qsContainer.append('<div class="product_brief__quickshop__close"></div>');
    quickshopComplete();
    $('.product_brief__quickshop__close').click(function() {
      site.quickshop.close();
    });
  } else {
    var colorboxClass = isEsteeEdit ? 'colorbox__quickshop colorbox__quickshop--estee-edit' : 'colorbox__quickshop';
    $.colorbox({
      html: qs_item,
      className: colorboxClass,
      fixed: 'true',
      maxWidth: '90%',
      maxHeight: '90%',
      onComplete: function() {
        quickshopComplete();
      },
      onClosed: function() {
        var quickshopClose = quickshopClose || false;
        if (!!quickshopClose && _.isFunction(quickshopClose)) {
          quickshopClose();
        }
      }
    });
  }

  return that;
};

site.quickshop.close = function() {
  var productId = $('.quickshop--estee-edit').attr('data-product-id');
  var $qsContainer = $('#product_brief__quickshop__container');
  var $mppGrid = $qsContainer.closest('.mpp__product-grid');
  $('#product_brief__quickshop__container').remove();
  $('.product_brief__quickshop__clear').children().unwrap();
  //lost reference to .selectBox() so just manually remove dropdowns
  $('.quickshop__quantity-selectBox-dropdown-menu').remove();
  $('.quickshop__price-size-select-selectBox-dropdown-menu').remove();
  $('.quickshop__shade-select-selectBox-dropdown-menu').remove();
  // limit to current grid
  var $product = $('.mpp__product[data-product-id="' + productId + '"]', $mppGrid);
  if ($product.length) {
    $('body').animate({
      scrollTop: $product.offset().top - 120}, 600, 'easeOutExpo', function() {
    });
  }
};

site.ellipsis = function(url) {
  var textDiv = $('.ellipsis');
  var sppURL = !_.isUndefined(url) ? url : 0;

  textDiv.each(function() {
    var current = $(this);
    // return if we've done this already
    if ($(current).find('.ellipsis_characters').length) {
      return 0;
    }
    var html = current.html();
    // <p> tags get closed right after the first word after they appear, so need to make them <br><br> instead, and remove closing tags
    html = html.replace(/<p>/g, ' <br><br>');
    html = html.replace(/<\/p>/g, '');
    var words = html.split(' ');

    current.html(words[0]);

    //desired height is container height minus content top margin
    var height = parseInt($('.quickshop__tab-container').height() - parseInt(current.css('margin-top')));
    var html_minus_one = '';
    var html_minus_two = '';

    for (var i = 1; i < words.length; i++) {
      // add words to div on at a time
      current.html(current.html() + ' ' + words[i]);

      // when we exceed the height we want, use the curent text minus one word, and add the ellipse
      if ($(current).height() > height && sppURL) {
        current.html(html_minus_one + '<a href="' + sppURL + '" class="ellipsis_characters">&#8230</a>');

        // if adding the ellipse exceeds our length, set it to minus 2 words
        if ($(current).height() > height && sppURL) {
          current.html(html_minus_two + '<a href="' + sppURL + '" class="ellipsis_characters">&#8230</a>');
        }
        break;
      }

      html_minus_two = i === 1 ? '' : html_minus_one;
      html_minus_one = current.html();
    }
  });
};
