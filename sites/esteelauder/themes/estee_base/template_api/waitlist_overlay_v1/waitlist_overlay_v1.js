
var site = site || {};
var generic = generic || {};

(function($) {
  site.waitlistOverlay = {
    launch: function(overlayTemplate, skuBaseId, context) {
      $.colorbox.remove();
      generic.overlay.launch({
        content: overlayTemplate,
        className: 'overlay__nodify-me',
        cssStyle: {
          height: '450px',
          width: '450px',
        },
        onComplete: function() {
          var $overlayContainer = $('.js-waitlist-overlay', context);
          var $submitBtn = $overlayContainer.find('.js-waitlist-form-submit');
          var $formNode = $overlayContainer.find('.js-waitlist-form');
          var $errorNode = $overlayContainer.find('.js-error-messages');
          var formArgs = {};
          var formObj;
          var errorObjectsArray;
          var $skuElement = $formNode.find('.sku-base-id');
          $skuElement.val(skuBaseId);
          $submitBtn.on('click', function(evt) {
            evt.preventDefault();
            formObj = $formNode.serializeArray();
            $.each(formObj, function(index, param) {
              formArgs[param.name] = param.value;
            });
            site.waitlistOverlay.submit({
              params: formArgs,
              callback: function() {
                $overlayContainer.find('.js-waitlist-overlay-success').removeClass('hidden');
                $formNode.addClass('hidden');
              },
              errorCallBack: function(jsonRpcResponse) {
                errorObjectsArray = jsonRpcResponse.getMessages();
                generic.showErrors(errorObjectsArray, $errorNode);
              }
            });
          });
        }
      });
    },
    submit: function(args) {
      if ($.cookie('csrftoken')) {
        args.params['_TOKEN'] = $.cookie('csrftoken');
      }
      if (!args || !args.callback) {
        return null;
      }
      generic.jsonrpc.fetch({
        method: 'form.get',
        params: [args.params],
        onSuccess: function(jsonRpcResponse) {
          args.callback(jsonRpcResponse);
          if (!$('body').hasClass('device-mobile') && $.isFunction($.colorbox)) {
            $.colorbox.resize();
          }
        },
        onFailure: function(jsonRpcResponse) {
          args.errorCallBack(jsonRpcResponse);
        }
      });
    }
  };
  Drupal.behaviors.waitlistOverlayV1 = {
    attach: function(context) {
      var overlayTemplate = $('script.inline-template[path="waitlist_overlay"]').html();
      $(document).on('click', '.js-notify-me', function(evt) {
        evt.preventDefault();
        var skuBaseId = $(this).attr('data-sku-base-id');
        site.waitlistOverlay.launch(overlayTemplate, skuBaseId, context);
      });
    }
  };
})(jQuery);
