
var site = site || {};
site.shadeFilter = {};

site.shadeFilter.init = function() {
  new site.CustomSelects();
};

site.shadeFilter.filter = function() {
  var $swatches = $('.js-swatch', '.js-shade-picker');
  var $shadeFilter = $('.js-custom-select');
  var intensity = '';
  var miscFlag = '';
  var colorFamily = '';
  var $swatchesFiltered = $();
  var $selectedFilter = $();
  $shadeFilter.change(function() {
    $selectedFilter = $(this).find(':selected');
    if ($selectedFilter.data('allItems')) {
      $swatches.parent().show();
      $swatches.first().click();
    } else if ($selectedFilter.data('intensityItem')) {
      intensity = $selectedFilter.attr('data-intensity');
      $swatches.parent().hide();
      $swatchesFiltered = $swatches.filter('[data-intensity="' + intensity + '"]');
      $swatchesFiltered.parent().show();
      $swatchesFiltered.first().click();
    } else if ($selectedFilter.data('miscFlagItem')) {
      miscFlag = $selectedFilter.attr('data-misc-flag');
      $swatches.parent().hide();
      $swatchesFiltered = $swatches.filter('[data-misc-flag="' + miscFlag + '"]');
      $swatchesFiltered.parent().show();
      $swatchesFiltered.first().click();
    } else if ($selectedFilter.data('colorFamily')) {
      colorFamily = $selectedFilter.data('colorFamily');
      $swatches.parent().hide();
      $swatchesFiltered = $swatches.filter('[data-color-family="' + colorFamily + '"]');
      $swatchesFiltered.parent().show();
      $swatchesFiltered.first().click();
    }
  });
};

site.shadeFilter.loadProductFilterData = function(productData) {
  var p = productData;
  var $prodContainer = $(".js-pr-product[data-product-id='" + p.PRODUCT_ID + "']");
  var showShadeFlag = $prodContainer.data('showShadeFilter') ? true : false;
  if ($prodContainer.length === 0) {
    return p;
  }
  p['enable_mobile_shade_filter'] = showShadeFlag;
  if (showShadeFlag) {
    var skus = p.skus;
    var filteredIntensity = [];
    var filteredMiscFlags = [];
    var filteredColorFamily = [];
    var miscFlag = 0;
    var hexCount = 0;
    var shadeHex = '';
    $(skus).each(function(index, sku) {
    //intensity
      if (!_.isNull(sku['INTENSITY']) && !_.isUndefined(sku['INTENSITY'])) {
        filteredIntensity.push(sku['INTENSITY']);
      }

      //color family
      if (!_.isNull(sku['ATTRIBUTE_COLOR_FAMILY']) && !_.isUndefined(sku['ATTRIBUTE_COLOR_FAMILY'])) {
        filteredColorFamily.push(sku['ATTRIBUTE_COLOR_FAMILY']);
      }

      //misc flags
      if (!_.isNull(sku['MISC_FLAG']) && !_.isUndefined(sku['MISC_FLAG'])) {
        filteredMiscFlags.push(sku['MISC_FLAG']);
        miscFlag = sku['MISC_FLAG'];
        switch (miscFlag) {
          case 1:
            sku['misc_flag_sku_1'] = true;
            break;
          case 2:
            sku['misc_flag_sku_2'] = true;
            break;
          case 3:
            sku['misc_flag_sku_3'] = true;
            break;
          case 5:
          case 94:
            sku['misc_flag_sku_4'] = true;
            break;
          case 15:
            sku['misc_flag_sku_5'] = true;
            break;
          case 126:
            sku['misc_flag_sku_13'] = true;
            break;
        }
      }
      //hex
      shadeHex = sku.HEX_VALUE_STRING;
      // explode
      shadeHex = shadeHex.split(',');
      if (shadeHex.length === 1) {
        sku['SWATCH_TYPE'] = 'single';
      } else if (shadeHex.length === 2) {
        sku['SWATCH_TYPE'] = 'duo';
      } else if (shadeHex.length === 3) {
        sku['SWATCH_TYPE'] = 'trio';
      } else if (shadeHex.length === 5) {
        sku['SWATCH_TYPE'] = 'quint';
      }
      for (var i = 0; i < shadeHex.length; i++) {
        hexCount = i + 1;
        sku['HEX_VALUE_' + hexCount] = shadeHex[i];
      }
    }); // skus
    // intensity
    if (skus.length > 1) {
      filteredIntensity = _.uniq(filteredIntensity);
      if (filteredIntensity.length > 1) {
        p['filtered-intensity'] = filteredIntensity;
        p['filtered_intensity_filter'] = true;
      }

      filteredColorFamily = _.uniq(filteredColorFamily);
      if (filteredColorFamily.length > 1) {
        p['color-family'] = filteredColorFamily;
        p['color-family-show'] = true;
        p['filtered_intensity_filter'] = true;
      }

      filteredMiscFlags = _.uniq(filteredMiscFlags);
      if (filteredMiscFlags.length > 1) {
        $.each(filteredMiscFlags, function(i, v) {
          switch (v) {
            case 1:
              p['misc_flag_filter_1'] = 1;
              break;
            case 2:
              p['misc_flag_filter_2'] = 2;
              break;
            case 3:
              p['misc_flag_filter_3'] = 3;
              break;
            case 5:
              p['misc_flag_filter_4'] = 5;
              break;
            case 94:
              p['misc_flag_filter_4'] = 94;
              break;
            case 15:
              p['misc_flag_filter_5'] = 15;
              break;
            case 30:
              p['misc_flag_filter_6'] = 30;
              break;
            case 17:
              p['misc_flag_filter_7'] = 17;
              break;
            case 116:
              p['misc_flag_filter_8'] = 116;
              break;
            case 121:
              p['misc_flag_filter_9'] = 121;
              break;
            case 122:
              p['misc_flag_filter_10'] = 122;
              break;
            case 124:
              p['misc_flag_filter_11'] = 124;
              break;
            case 125:
              p['misc_flag_filter_12'] = 125;
              break;
            case 126:
              p['misc_flag_filter_13'] = 126;
              break;
            case 128:
              p['misc_flag_filter_14'] = 128;
              break;
          }
        });
        p['filtered_intensity_filter'] = true;
      }
    }
  }
  return p;
};

site.CustomSelects = function() {
  this.init();
};

site.CustomSelects.prototype = {
  selectClass: 'js-custom-select',
  optionClass: 'custom-select-option',
  $selects: $(),

  buildSelects: function() {
    var self = this;
    var customDivMock = '<div data-custom-select-index="" class="custom-select-clone js-custom-select-clone"><div class="custom-select-current select-markdown"><div class="filtered-swatch"></div><div class="selectBox-label"></div><span class="selectBox-arrow"></span></div> <div class="custom-select-options hidden"></div></div>';
    var $customDiv = $();
    var $selectedOption = $();
    var $customOptionsParent = $();
    var customOptionMock = '<li data-custom-option-value="" class="' + self.optionClass + '"></li>';
    var $customOption = $();
    var $customSelected = $();
    var $customSelectOptionsMock = $('<ul class="custom-select-box"></ul>');
    var $customSelectOptions = $();
    var swatchClass = '';
    self.$selects.each(function(i, el) {
      $(el).addClass('custom-select-index' + i);
      $customDiv = $(customDivMock).clone(true);
      $customDiv.attr('data-custom-select-index', i);
      $selectedOption = $(el).find(':selected');
      $customSelected = $customDiv.find('.custom-select-current .selectBox-label');
      $customOptionsParent = $customDiv.find('.custom-select-options');
      $customSelected.html($selectedOption.text());
      $customSelectOptions = $customSelectOptionsMock.clone(true);
      $(el).find('option').each(function(i, op) {
        $customOption = $(customOptionMock).clone(true);
        $customOption.attr('data-custom-option-value', i);
        if ($(op).is(':selected')) {
          $customOption.addClass('active');
        }
        $customOption.html(this.text);
        if ($(op).data('prependCssContainer')) {
          swatchClass = $(op).data('prependCssContainer');
          swatchClass = 'filter-' + swatchClass.toLowerCase().replace(/ /g, '_');
          swatchClass = swatchClass.toLowerCase();
          $customOption.prepend('<div class="filtered-swatch ' + swatchClass + '"></div>');
        }
        $customSelectOptions.append($customOption);
      });
      $customOptionsParent.append($customSelectOptions);
      $(el).addClass('hidden');
      $customDiv.insertAfter($(el));
      $(el).bind('change', function() {
        self.refreshSelect($(this));
      });
    });
  },
  refreshSelect: function($el) {
    var self = this;
    var $customDiv = $el.next('.js-custom-select-clone');
    var $selectedOption = $el.find(':selected');
    var $customSelected = $customDiv.find('.custom-select-current');
    var $customSelectLabel = $customSelected.find('.selectBox-label');
    var $filteredSwatch = $('.' + self.optionClass + '.active').find('.filtered-swatch').clone(true);
    var $swatchFilterMock = $('<div class="filtered-swatch"></div>');
    $customSelectLabel.html($selectedOption.text());
    $customSelected.find('.filtered-swatch').remove();
    // if the user selects All shades it has no swatchFilter, its needed to keep the select align
    $filteredSwatch.length ? $customSelected.prepend($filteredSwatch[0]) : $customSelected.prepend($swatchFilterMock[0]);
    $customDiv.find('.custom-select-options').toggleClass('hidden');
    $customSelected.toggleClass('clicked');
  },
  addEvents: function() {
    var self = this;
    var $currentSelect = $();
    var selectIndex = 0;
    var optionIndex = 0;
    $('.' + self.optionClass).on('click', function() {
      $('.' + self.optionClass).removeClass('active');
      $(this).addClass('active');
      selectIndex = $(this).closest('.js-custom-select-clone').attr('data-custom-select-index');
      $currentSelect = $('.custom-select-index' + selectIndex);
      optionIndex = $(this).attr('data-custom-option-value');
      $currentSelect[0].selectedIndex = parseInt(optionIndex);
      $currentSelect.find('option').removeClass('is_active');
      $currentSelect.find('option').eq(optionIndex).addClass('is_active');
      $currentSelect.trigger('change');
    });
    $('.custom-select-current').bind('click', function() {
      self.toggleSelect($(this));
    }).bind('clickoutside', function() {
      if ($(this).hasClass('clicked')) {
        self.toggleSelect($(this));
      }
    });
  },
  toggleSelect: function($el) {
    var self = this;
    var $currentOptions = $el.next('.custom-select-options');
    $el.toggleClass('clicked');
    self.positionSelectOptions($el, $currentOptions);
    $currentOptions.toggleClass('hidden');
  },
  positionSelectOptions: function($selectedOption, $options) {
    var scrollTop = $(window).scrollTop(),
        elementOffset = $selectedOption.offset().top,
        topSpace = elementOffset - scrollTop;
    var space = screen.height - (topSpace + $selectedOption.outerHeight(true));
    var $clonedOptions = $options.clone(true);
    // we need to display the cloned options outside the viewport, so we can get the
    // elements dinamic height
    $clonedOptions.removeClass('hidden').css({'top': '-9999px', 'display': 'block'});
    $options.parent().append($clonedOptions);
    var optionsHeight = $clonedOptions.find('.custom-select-box').outerHeight(true) + $selectedOption.outerHeight(false) - 1;
    // we remove the clone after getting it's height
    $clonedOptions.remove();
    $options.find('.custom-select-box').removeClass('custom-select-top');
    $selectedOption.removeClass('custom-select-top');
    $options.css('top', '0');
    if (parseInt(space) < parseInt(optionsHeight)) {
      $options.css({'top': '-' + optionsHeight + 'px'});
      $selectedOption.addClass('custom-select-top');
      $options.find('.custom-select-box').addClass('custom-select-top');
    }
  },
  init: function() {
    var self = this;
    self.$selects = $('.' + self.selectClass);
    if (self.$selects.length) {
      $.when(self.buildSelects()).then(self.addEvents());
    }
  },
};
