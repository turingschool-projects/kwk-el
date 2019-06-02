
var site = site || {};

site.ShadePicker = function (productData) {
    //console.log('init productData: ' + productData.PRODUCT_ID);
    this.init(productData);
};

site.ShadePicker.prototype = {
  productData : null,
  skus: [],
  skuShades : [],
  swatches : '',
  shadeSelects : '',
  originalUrl : window.location.href.split('#/shade/')[0],
  initialShadeRoute : window.location.href.split('#/shade/')[1],
  wireSwatches : function(){
    var self = this;
    self.swatches.bind( "click", function(e) {
      e.preventDefault();
      var selectedSkuBaseId = $(this).attr("data-sku-base-id");
      self.updateSwatches(selectedSkuBaseId);
      site.skuSelect(self.skus[selectedSkuBaseId]);
      self.selectShade(selectedSkuBaseId);
    });
    self.swatches.on( "sku:select", function(e, skuData) {
      var selectedSkuBaseId = skuData.SKU_BASE_ID;
      self.updateSwatches(selectedSkuBaseId);
      e.stopPropagation();
    });
    //init first swatch
    self.swatches.eq(0).addClass("selected");
  },
  wireShadeSelects : function() {
    var self = this;
    self.customSelects(true);
    self.shadeSelects.bind('change', function(e) {
      var selectedSkuBaseId = $(this).val();
      self.updateSelects(selectedSkuBaseId);
      site.skuSelect(self.skus[selectedSkuBaseId]);
      self.selectShade(selectedSkuBaseId);
    });
    self.shadeSelects.on( "sku:select", function(e, skuData) {
      var selectedSkuBaseId = skuData.SKU_BASE_ID;
      self.updateSelects(selectedSkuBaseId);
      e.stopPropagation();
    });
  },
  customSelects : function(init) {
    var self = this;
    self.shadeSelects.each(function(index, val) {
      if(init){
        $(this).selectBox({ mobile: true });
      }else{
        $(this).selectBox('refresh');
        //self.shadeSelects.selectBox('destroy');
        //self.shadeSelects.selectBox({ mobile: true });
      }
      var $shadeSelect = $(this).selectBox('control');
      var $shadeSelectOption = $($shadeSelect).data('selectBox-options');  // extra $() for iPad
      if(init){
        $(this).selectBoxDefault('selectDefault');
        $('.product-full__quantity').selectBoxDefault('selectDefault');
        $('.spp-product__mini-bag-quantity').selectBoxDefault('selectDefault');
      }

      if(!_.isUndefined($shadeSelectOption) && !_.isNull($shadeSelectOption)){
        var $shadeMenuOptions = $shadeSelectOption.find('li a');
        // add shade divs to custom select
        $shadeMenuOptions.each(function() {
          var shadeSku = $(this).attr('rel');
          //var shadeProductData = _.find(self.skus, function(p){ return p.SKU_BASE_ID == shadeSku; });
          var shadeProductData = _.find(self.productData.skus, function(sku){ return sku.SKU_BASE_ID == shadeSku; });
          var shadeHex = shadeProductData.HEX_VALUE_STRING;

          // explode
          var shadeHex = shadeHex.split(',');

          //sort swathes
          var swatchType, hexValue1, hexValue2, hexValue3, hexValue4, hexValue5;
          if(shadeHex.length == 1) {
            swatchType = 'swatches--single';
            hexValue1 = shadeHex[0];
          }else if(shadeHex.length == 2){
            swatchType = 'swatches--duo';
            hexValue1 = shadeHex[0];
            hexValue2 = shadeHex[1];
          }else if(shadeHex.length == 3){
            swatchType = 'swatches--trio';
            hexValue1 = shadeHex[0];
            hexValue2 = shadeHex[1];
            hexValue3 = shadeHex[2];
          }else if(shadeHex.length == 4){
            swatchType = 'swatches--quad';
            hexValue1 = shadeHex[0];
            hexValue2 = shadeHex[1];
            hexValue3 = shadeHex[2];
            hexValue4 = shadeHex[3];
          }else if(shadeHex.length == 5){
            swatchType = 'swatches--quint';
            hexValue1 = shadeHex[0];
            hexValue2 = shadeHex[1];
            hexValue3 = shadeHex[2];
            hexValue4 = shadeHex[3];
            hexValue5 = shadeHex[4];
          }

          var $swatchContainer = $('<div/>', {
            'class': 'swatch__container ' + swatchType
          });
          for(var i=0; i<shadeHex.length; i++){
            var $swatchDiv = $('<div/>', {
              'class': 'swatch--'+(i+1),
              'style': 'background-color:'+shadeHex[i]
            });
            $swatchContainer.append($swatchDiv);
          }

          // add to li
          $(this).prepend($swatchContainer).clone(true);
          // add to label
          if($(this).parent().hasClass('selectBox-selected')){
            var $shadeSelectLabel = $shadeSelect.parent().find('.selectBox-dropdown');
            if($('.swatch__container',$shadeSelectLabel).length){
              var $clone = $swatchContainer.clone(true);
              $('.swatch__container',$shadeSelectLabel).replaceWith($clone);
            }else{
              var $clone = $swatchContainer.clone(true);
              $shadeSelectLabel.prepend($clone);
            }
          }
           
           //ie8 pie attach behavior
           if ( generic.env.isIE8 ) {
             if (window.PIE) {
               $('.swatches--single div').each(function(i, el) {
                 PIE.attach(this);
               });
             }
           }
        });
      }
    });
  },
  updateSwatches : function(skuId){
    var self = this;
    self.swatches.removeClass("selected");
    self.swatches.filter("[data-sku-base-id=" + skuId +  "]").addClass("selected");
  },
  updateSelects : function(skuId){
    var self = this;
    self.shadeSelects.val(skuId);
    self.customSelects(false);
  },
  fixedEncodeURIComponent : function (str){ //CX-3730 Deep Link Implementation
    try {
      return str.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g, '-').replace(/^(-)+|(-)+$/g,'');
    }
    catch(err) {
      // console.log('shadename is undefined');
    }
  },
  hasQueryString : function () { //CX-3730 Deep Link Implementation
    var self = this;
    if (_.isEmpty(self.initialShadeRoute.split('?')[1])) {
      return false;
    } else {
      return true;
    }
  },
  shadeInit : function () { //CX-3730 Deep Link Implementation
    var self = this;
    if (!_.isUndefined(self.initialShadeRoute)) {
      var shadeRoutefromURL = self.initialShadeRoute;
      if (self.hasQueryString()) {
        shadeRoutefromURL = self.initialShadeRoute.split('?')[0];
      }
      var shadeNameNoSpaces = self.fixedEncodeURIComponent(decodeURIComponent(shadeRoutefromURL));
      if (_.contains(self.skuShades, shadeNameNoSpaces)) {
        var foundShadeSkuId = self.skuShades.indexOf(shadeNameNoSpaces);
        $("a.swatch[data-sku-base-id=" + foundShadeSkuId + "]").trigger('click');
      } else {
        self.defaultshadeSelect();
      }
    } else {
      self.defaultshadeSelect();
    }
  },
  selectShade : function (selectedSkuBaseId) { //CX-3730 Deep Link Implementation
    var self = this;
    if (!_.isEmpty(self.skuShades) && Drupal.settings.globals_variables.enable_deep_link) {
      var selectedShade = self.skuShades[selectedSkuBaseId];
      if ( (page_data['custom-spp'] || page_data['catalog-spp']) && $(document).find('.quickshop').length < 1) {
        if (!_.isUndefined(self.initialShadeRoute) && self.hasQueryString()) {
          selectedShade = selectedShade + '?' + self.initialShadeRoute.split('?')[1];
        }
        history.replaceState({}, selectedShade, '#/shade/' + selectedShade);
      }
    }
  },
  defaultshadeSelect : function () {
    var defaultSku = $('a.swatch--selected.selected').data('sku-base-id');
    $("a.swatch[data-sku-base-id=" + defaultSku + "]").trigger('click');
  },
  init: function (productData) {
    var self = this;
    self.productData = productData;
    var pid = self.productData.PRODUCT_ID;
    for (var i=0; i<self.productData.skus.length; i++) {
      var s = self.productData.skus[i];
      self.skus[s.SKU_BASE_ID] = s;
      //CX-3730 Deep Link Implementation
      if (!_.isUndefined(s.SHADENAME) && !_.isNull(s.SHADENAME) && Drupal.settings.globals_variables.enable_deep_link) {
        var shadeNameNoSpaces = self.fixedEncodeURIComponent(s.SHADENAME);
        self.skuShades[s.SKU_BASE_ID] = shadeNameNoSpaces;
      }
      //self.skus.push(s);
    }

    //check for swatches
    self.swatches = $("a.swatch[data-product-id=" + pid + "]");
    if(self.swatches.length > 0){
      self.wireSwatches(self.swatches);
    }
    //check for selects
    self.shadeSelects = $("select.js-sku-menu[data-product-id=" + pid + "]");
    if(self.shadeSelects.length > 0){
      self.wireShadeSelects(self.shadeSelects);
    }
  }
};


site.SmooshSlider = function(args) {
  var that = {
    $list : $(args.containerNode)
  };
  var productData = args.productData;
  //smoosh list
  setTimeout(function(){
    that.$list.slick({
      lazyLoad: 'progressive',
      centerPadding: '50%',
      dots: false,
      arrows: true,
      infinite: false,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      onAfterChange: function(slider){
        var $currentSlide = $(slider.$slides).eq(slider.currentSlide);
        var skuBaseId = $currentSlide.attr('data-sku-base-id');
        var skuData = _.find(productData.skus, function(p){ return p.SKU_BASE_ID == skuBaseId; });
        site.skuSelect(skuData);
        //CX-3730 Deep Link Implementation
        site.ShadePicker.prototype.selectShade(skuBaseId);
      }
    });
    $(document).trigger('smoosh_slick_init_ready');
  },200); //give the first image some time to load

  //hook into shade picker
  that.$list.on('sku:select', function(e, skuData) {
    var skuId = skuData.SKU_BASE_ID;
    var $smooshes= $('.smoosh-list-item', that.$list);
    var smooshIndex = $smooshes.filter("[data-sku-base-id=" + skuId + "]").index();
    var currentSlide = that.$list.slickCurrentSlide();
    if(smooshIndex != currentSlide) {
      that.$list.slickGoTo(smooshIndex);
    }
    e.stopPropagation();
  });

  return that;

};

