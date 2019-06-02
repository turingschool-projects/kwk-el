
var site = site || {};
site.panels = site.panels || {};

(function($) {
  Drupal.behaviors.ELB_addToEngraving = {
    attach: function(context, settings) {
      site.addEngravingButton();
      site.deleteEngravingButton();
    }
  };
})(jQuery);

site.deleteEngravingButton = function() {
  $('body').on('click', '.js-delete-to-engraving', function(e){
    e.preventDefault();
    var form = $(this).parents('form.viewcart-engraving__engraving--form');
    // retrieve form data
    var params = form.engravingJSON();
    //error messages
    var error_node = form.find('ul.error_messages');
    $(this).closest('.js-engraving-view').children('.js-engraving-loading').removeClass('hidden');
    generic.jsonrpc.fetch({
      method : 'form.rpc',
      params: [params],
      onBoth: function(r) {
        var resultObj = r.getCartResults();
        var messages = r.getMessages();
        //Filter messages to remove SUCCESS messages
        if (messages) {
          messages = $.grep(messages, function(e) {
            return $.inArray('SUCCESS', e.tags) === -1 && $.inArray('alter_monogram', e.tags) > 0;
          });
        }
        //Filter messages to remove SUCCESS messages
        //If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful
        if (messages && messages.length) {
          generic.showErrors(messages, error_node, form);
        } else {
          var resultData = r.getData();
          site.panels.reloadPanels({noAnchor: true, noAnchorAndMsg: true});
          generic.overlay.hide();
        }
      }
    });
  });
};

site.addEngravingButton = function() {
  site.engraveButtons();
  var selectSku = function(skuBaseId) {
    $('.js-add-to-engraving').attr("data-sku-base-id", skuBaseId);
    $('.js-add-to-engraving').addClass('hidden');
  };
  $('body').on('sku:select', '.js-add-to-engraving', function(e, skuData){
    if (skuData.ENGRAVABLE !== null) {
      selectSku(skuData.SKU_BASE_ID);
      $('.js-add-to-engraving').removeClass('hidden');
      e.stopPropagation();
    } else {
      selectSku(skuData.SKU_BASE_ID);
      e.stopPropagation();
    }
  });
};

site.engraveButtons = function(){
  $('body').on('click', '.js-add-to-engraving', function(e){
    e.preventDefault();
    var $ele = $(this);
    var dataSkubaseId = $ele.attr('data-sku-base-id');
    var dataCartId = $ele.attr('data-cart-id');
    var queryCardId = dataCartId ? "&CART_ID="+dataCartId : '';
    var query = "?SKU_BASE_ID="+dataSkubaseId + queryCardId;
    var engravingType = $ele.attr('data-engraving-type');
    var engravingFont = 'popup'+$ele.attr('data-monogram-font');
    var engravingClass = (parseInt(engravingType) === 1) ? ' brand-aerin ' : ' ';
    $(this).closest('.js-engraving-view').children('.js-engraving-loading').removeClass('hidden');
    generic.template.get({
      path:'/templates/engraving-qvform.tmpl'+query,
      forceReload: true,
      callback: function(html) {
        generic.overlay.launch({
          content: html,
          cssClass: 'engraving-preview-popup js-engraving-preview-popup'+engravingClass+engravingFont,
          cssStyle: {
            width: '725px',
            height: '518px'
          },
          center: true,
          lockPosition: false,
          includeBackground: true,
          backgroundNodeClickHide: true,
          onComplete : function() {
            site.engravingInit();
            //Retain values of font in overlay
            if ($("body").hasClass('brand-aerin')) {
              $('a.change-font').removeClass('engrave-style-chosen');
              $('.monogram-choice-lower').eq(0).trigger('click');
            }
            if ($("body#viewcart").length > 0) {
              var engravingFontChoice = $('.js-font-choice-button'),
                engravingPreviewPopup = $('.engraving-preview-popup'),
                selectButtonClass = engravingPreviewPopup.attr("class").split(" ").pop();
              engravingFontChoice.find("." +selectButtonClass).trigger("click");
              $('.engraving-message').focus();
            } else {//Other than viewcart page
              if ($("body").hasClass('brand-aerin')) {
                $('.engraving-message').addClass('engrave-choice-roman');
              } else {
                $('.engraving-message').addClass('engrave-choice-optima');
              }
            }
          }
        });
      },
      object: []
    });
  });

  // When engraving popup form is closed, then hide the loading gif
  $('#viewcart').on('click', '.js-engraving-preview-popup #cboxClose', function(e){
    $('.js-engraving-loading').addClass('hidden');
  });
}

site.engravingInit = function() {
  var engravingformWrap = $('.js-edit-form'),
    engravedPreview = $('.js-form-preview'),
    engravingPreviewButton = $('.js-engraving-preview-button'),
    engravingBackButton = $('.js-back-preview'),
    engravinfFormContainer = $('form.js-engraving-form'),
    engravingAddtoBag = $('.js-engraving-save');

  // Android Input box fix
  var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
  if (isAndroid) {
    engravinfFormContainer.addClass('small-container');
  }
  engravingPreviewButton.bind('click', function(e){
    e.preventDefault();
    var form = $(this).closest('form.js-engraving-form');
    /* retrieve form data*/
    var params = form.engravingJSON();
    /*error messages*/
    var error_node = form.find('ul.error_messages');
    if (form.find(".engraving-message").val().length === 0) {
      generic.jsonrpc.fetch({
        method : 'form.rpc',
        params: [params],
        onBoth: function(r) {
          var resultObj = r.getCartResults();
          var messages = r.getMessages();
          /*Filter messages to remove SUCCESS messages*/
          if (messages) {
            messages = $.grep(messages, function(e) {
              return ($.inArray('SUCCESS', e.tags) === -1 && $.inArray('alter_monogram', e.tags) > 0);
            });
          }
          /*Filter messages to remove SUCCESS messages*/
          /*If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful*/
          if (messages && messages.length) {
              generic.showErrors(messages, error_node, form);
          }
          /*If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful*/
        }
      });
    } else {
      engravingPreviewButton.hide();
      engravingformWrap.hide();
      engravedPreview.addClass('active');
      engravingAddtoBag.show().css('display','block');
    }
  });
  //Show Engraved Form and hide Preview
  engravingBackButton.bind('click', function(e){
    e.preventDefault();
    engravedPreview.removeClass('active');
    engravingAddtoBag.hide();
    engravingformWrap.show();
    engravingPreviewButton.show();
  });
  //Bind keyup, keydown paste and autocomplete for input text fields
 $('.js-engraving-form input.engraving-message').on('input focus', function(e) {
    var $msgTextNode = $(this);
    var msgTextValue = $msgTextNode.val();
    //Update the preview copy
    var theId = $msgTextNode.attr('id').replace('txt-','preview-');
    //Update Char count
    var currentLength = msgTextValue.length;
    var maxLength = $msgTextNode.attr('maxlength') || 10;
    //Check and force the length of the field whilst typing
    if (currentLength > maxLength) {
      $msgTextNode.val(msgTextValue.substr(0, maxLength));
      return false;
    }
    //Now update the counter
    var $messageLenNode = $msgTextNode.closest('.js-engraving-form-line').find(".chars-left");
    if ($messageLenNode.length > 0) {
      $messageLenNode.html(currentLength + ' / ' + maxLength);
    }
    site.handleOverlayButton($msgTextNode, msgTextValue, theId);
  });

  //Multiple Choice Font Switching but allow different forms different selected
  $('.js-engraving-form a.change-font').click(function(e) {
    e.preventDefault();
    $this = $(this);
    var getClassName = $this.searchClassValue('engrave-choice-');
    var $engravingForm = $this.closest('form.js-engraving-form');
    var engravingMsg = $engravingForm.find('.engraving-message');
    var engravingMsgValue = engravingMsg.val();
    //If we have copy set the font style
    $engravingForm.find('input.engraving-message').each(function() {
      $(this).removeClassPrefix('engrave-choice-').addClass(getClassName);
    });
    $engravingForm.find('.new-canvas input').removeClassPrefix('engrave-choice-').addClass(getClassName);
    $engravingForm.find('.new-canvas .preview-copy').removeClassPrefix('engrave-choice-').addClass(getClassName);
    //Now set button selected styles
    $('a.change-font').removeClass('engrave-style-chosen');
    $this.addClass('engrave-style-chosen');
    //Now set the form value for the font
    var value = $this.searchClassValue('value-').replace('value-','');
    $engravingForm.find('input[name="MONOGRAM_FONT"]').val(value);

    site.handleOverlayButton($this, engravingMsgValue);
  });

  //Add to Cart
  $('.js-engraving-form a.engraving-save').click(function(e) {
    e.preventDefault();
    var form = $(this).closest('form.js-engraving-form');
    // retrieve form data
    var params = form.engravingJSON();
    //error messages
    var error_node = form.find('ul.error_messages');
    generic.jsonrpc.fetch({
      method : 'form.rpc',
      params: [params],
      onBoth: function(r) {
        var resultGetData = r.getData();
        if (resultGetData !== null && typeof resultGetData.ac_results !== "undefined") {
          // Pass the engraving collection info to last added item object
          // So that, this info will be pulled by cart bag overlay
          resultGetData.ac_results[0].result.CARTITEM['coll_info'] = resultGetData.coll_info;
          var currentItem = r.getCartResults().getItem();
          resultGetData.trans_data.order.items.map(function(a) {
            if (a.COLLECTION_ID == currentItem.COLLECTION_ID) {
              result = a;
            }
          });
          if (result.formattedAppliedPrice != null) {
            resultGetData.ac_results[0].result.CARTITEM.formattedAppliedPrice = result.formattedAppliedPrice;
          }
        }
        var resultObj = r.getCartResults();
        var messages = r.getMessages();
        //Filter messages to remove SUCCESS messages
        if (messages) {
          messages = $.grep(messages, function(e) {
            return ($.inArray('SUCCESS',e.tags) === -1 && $.inArray('alter_monogram',e.tags) > 0);
          });
        }
        //Filter messages to remove SUCCESS messages
        //If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful
        if (messages && messages.length) {
            generic.showErrors(messages, error_node, form);
        } else {
          var resultData = r.getData();
          $(document).trigger("addToCart.success", [resultObj]);
          generic.overlay.hide();
          if ($("#viewcart").length > 0 || $('#index-checkout').length > 0) {
            site.panels.reloadPanels({
              noAnchor: true,
              noAnchorAndMsg: true,
            });
          }
        }
        //If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful
      }
    });
  });

  $.fn.engravingJSON  = function() {
    var form = this;
    var formSerial = form.serializeArray();
    // transform string into array of form elements
    var paramStr = '',
    params = {};
    // iterate through collection to transform form name/value into key/value properties of a literal object string.
    $.each(formSerial, function(i) {
      var key = this.name, value = this.value;
      if (params[key]) { //If the key exists
        if (!$.isArray(params[key])) { //and its not current already an array
          params[key] = new Array(params[key], value); //Then create a new array with Stirng as key 0 and this value as key 1
        } else {
          params[key].push(value); //Otherwise if its already an array lets add the new value to the array say 3rd or 4th input
        }
      } else {
        params[key] = value; //Otherwise its a simply string store
      }
    });
    //Join MONOGRAM_TEXT array if we have multiple lines
    if ($.isArray(params['MONOGRAM_TEXT'])) {
      params['MONOGRAM_TEXT'] = params['MONOGRAM_TEXT'].filter(function(val) { return val.trim() ? val : false; }).join('[BR]');
    }
    $.each(params, function(key, value){
      paramStr += '"'+ key + '":"' + value + '",';
    });
    // parse the string and create the literal object
    return eval("(" + "{"+paramStr.substring(0,(paramStr.length-1))+"}" + ")");
  };

  $.fn.searchClassValue = function(prefix) {
    var theClass = $(this).attr('class').match(new RegExp(prefix+"[0-9a-zA-Z_]+(s+)?", "g"));
    if ($.isArray(theClass)) {
      return theClass[0];
    }
    return false;
  };

  $.fn.removeClassPrefix = function(prefix) {
    this.each(function(i, el) {
      var classes = el.className.split(" ").filter(function(c) {
        return c.lastIndexOf(prefix, 0) !== 0;
      });
      el.className = $.trim(classes.join(" "));
    });
    return this;
  };
}

site.handleOverlayButton = function(currentObj, msgTextValue, theId) {
  $this = currentObj;
  var $engravingForm = $this.closest('form.js-engraving-form'),
    engravingMsg = $engravingForm.find('.engraving-message'),
    engravingStyleChosen = $engravingForm.find('a.engrave-style-chosen'),
    engravingMsgValue = engravingMsg.val();

  var transformedEngravingCopy = msgTextValue;
    /*Transform monogram copy case*/
  if (/[A-Z]/.test(transformedEngravingCopy) === true) {
    /*Monogram copy has uppercase char*/
    var copyArr = msgTextValue.split('');
    transformedEngravingCopy = copyArr.map(function(currentValue, index, arr) {
    return (index === 1 ) ?
      '<span class="preview-copy-capitalise">' + currentValue + '</span>' : currentValue;
    });
  }
  var $newCanvasNode = $this.closest('form.js-engraving-form').find('.new-canvas');
  $newCanvasNode.find('#'+theId).val(msgTextValue);
  var previewCopy = $newCanvasNode.find('.preview-copy');
  previewCopy.html(transformedEngravingCopy);
  
  if (engravingStyleChosen.hasClass('js-monogram-choice-lower')) {
    $engravingForm.find('.engrave-placement .preview-copy-capitalise').removeClass('preview-copy-capitalise');
    engravingMsg.val(engravingMsgValue.toLowerCase());
  } else if (engravingStyleChosen.hasClass('js-monogram-choice-upper')) {
    var engravingCopy = engravingMsgValue,
    copyArr = engravingMsgValue.split('');
    engravingCopy = copyArr.map(function(currentchar, index, arr) {
      return (index === 1 ) ?
        '<span class="preview-copy-capitalise">' + currentchar + '</span>' : currentchar;
    });
    var $engravePlacement = $engravingForm.find('.new-canvas');
    $engravePlacement.find('.preview-copy').html(engravingCopy);
    if (copyArr.length > 0) {
      if (copyArr[0] !== undefined && copyArr[1] !== undefined && copyArr[2] === undefined) {
        engravingMsg.val(copyArr[0].toLowerCase() + copyArr[1].toUpperCase());
      } else if (copyArr[0] !== undefined && copyArr[1] !== undefined && copyArr[2] !== undefined) {
        engravingMsg.val(copyArr[0].toLowerCase() + copyArr[1].toUpperCase() + copyArr[2].toLowerCase());
      }
    }
  }
  var $newCanvasNode = $this.closest('form.js-engraving-form').find('.new-canvas');
  var placementNode = $newCanvasNode.find('.engrave-placement');
  var canvasNode = $newCanvasNode.find('span.canvas-orig');
  canvasNode.removeClass('large-font');
  if (placementNode.width() < canvasNode.width()) {
    canvasNode.addClass('large-font');
  }
}

$.fn.engravingJSON  = function() {
  var form = this;
    var formSerial = form.serializeArray();
    // transform string into array of form elements
    var paramStr = '',
    params = {};
    // iterate through collection to transform form name/value into key/value properties of a literal object string.
    $.each(formSerial, function(i) {
      var key = this.name, value = this.value;
      if (params[key]) { //If the key exists
        if (!$.isArray(params[key])) { //and its not current already an array
          params[key] = new Array(params[key], value); //Then create a new array with Stirng as key 0 and this value as key 1
        } else {
          params[key].push(value); //Otherwise if its already an array lets add the new value to the array say 3rd or 4th input
        }
      } else {
        params[key] = value; //Otherwise its a simply string store
      }
    });
    //Join MONOGRAM_TEXT array if we have multiple lines
    if ($.isArray(params['MONOGRAM_TEXT'])) {
      params['MONOGRAM_TEXT'] = params['MONOGRAM_TEXT'].filter(function(val) { return val.trim() ? val : false; }).join('[BR]');
    }
    $.each(params, function(key, value){
      paramStr += '"'+ key + '":"' + value + '",';
    });
    // parse the string and create the literal object
    return eval("(" + "{"+paramStr.substring(0,(paramStr.length-1))+"}" + ")");
};

site.addToEngraving = function(args) {
  var params = {
    "_SUBMIT": "alter_collection",
    "action": "add"
  };
  if ($.cookie('csrftoken')) {
    params._TOKEN = $.cookie('csrftoken');
  }
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
