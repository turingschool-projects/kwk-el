
var site = site || {};
site.template = site.template || {};

(function($) {

Drupal.behaviors.applied_offers_overlay_v1 = {
  /**
   * This method find apply now offer links on the page and make sure a redirect is set.
   * If its not set, it will turn the link into an RPC to apply the offer
   */
  findOfferLinks: function() {
    var self = this;
    // any offer links that are not redirecting force the logic to use an RPC to apply the offer
    // the link looks something like the one below, the href may have a link in it that resembles a LBO link instead of '#'
    // <a class="js-apply-now-offer" data-no_redirect="1" data-offer_code="test_global_apply_now" data-applied_offer_confirm="1" href="#">LINK TEXT</a>
    $('.js-apply-now-offer').click(function(event) {
      // hijack the link so we can apply the offer and redirect if necessary
      event.preventDefault();

      var redirectLink = $(this).prop('href');
      var offerCode = $(this).data('offer_code');
      var shouldNotRedirect = $(this).data('no_redirect');

      // apply the offer via RPC
      if (shouldNotRedirect && offerCode) {
        self.applyOffer({link: $(this)});
      }
      // apply the offer via the backend and redirect
      else if (offerCode) {
        // the link should look like this so the offer handler can process it
        // /o_/OFFER_CODE/go//bestsellers?applied_offer_confirm=1&o=OFFER_CODE
        window.location.replace(redirectLink);
      }
    });
  },

  /**
   * This method is used to apply an offer via an RPC.
   * @param {string} args.offerCode **REQUIRED** The offer code to be applied.
   * @param {string} args.showOverlay **OPTIONAL** A 1/0 value which tells us whether or not to show the messaging overlay
   */
  applyOffer: function(args) {
    var self = this;
    var $link = args.link;
    var offerCode = $link.data('offer_code');
    var showOverlay = $link.data('applied_offer_confirm');

    generic.jsonrpc.fetch({
      method: 'offers.apply',
      params: [{'offer_code': offerCode, 'do_not_defer_messages': 1}],
      onBoth: function(jsonRpcResponse) {
        var response = jsonRpcResponse.getValue();
        var messages = jsonRpcResponse.getMessages() || [];

        var message;
        var errors = [];

        if (!response || !response.inCart) {
          var messages = jsonRpcResponse.getMessages() || [];
          if (messages.length) {
            errors = messages;
          }
        } else {
          message = response.confirm_message;

          // change text in link since the offer is now applied
          if($link.data('offer_applied_text') !== '') {
            $link.html($link.data('offer_applied_text'));
          }
        }

        // show an overlay with messaging for the user
        if (showOverlay) {
          var rendered = self.setMessaging({
            offerCode: offerCode,
            message: message,
            errors: errors
          });
          self.launchOverlay(rendered);
        }
      }
    });
  },

  /**
   * This method is used to look for a string in the current URL.
   * Its value will help us make business decisions.
   * @param {array} args.searchStrings **REQUIRED** An array of strings to search for in the current URL
   */
  searchUrl: function(args) {
    var self = this;
    var searchStrings = args.searchStrings;
    var pageUrl = decodeURIComponent(window.location.search.substring(1));
    var urlVariables = pageUrl.split('&');

    var data = {};
    $.each(urlVariables, function(index, value) {
      var parameterName = urlVariables[index].split('=');

      // look for the parameter in the search string array
      if ($.inArray(parameterName[0], searchStrings) !== -1) {
        data[parameterName[0]] = parameterName[1];
      }
    });

    return data;
  },

  /**
   * This method is will set the messaging for the offer message overlay.
   * @param {string} args.message **REQUIRED** The offer message to be displayed in the overlay
   * @param {string} args.offerCode **REQUIRED** The offer code that was applied
   * @param {array} args.errors **OPTIONAL** An array of error messages to be shown
   */
  setMessaging: function(args) {
    var self = this;
    var offerCode = args.offerCode;
    var message = args.message;
    var errors = args.errors || [];
    var rendered = '';

    // 'try' and the get template using 'site.template.get'
    // otherwise use the inline template
    try {
      $.each(errors, function(index, error) {
        // show something to help troubleshooting
        if (error.text == '' || error.text == '&nbsp;') {
          error.text = error.key;
        }
      });

      rendered = site.template.get({
        name: 'applied_offers_overlay',
        data: { message: message, offer_code: offerCode, errors: errors }
      });
    }
    catch (e) {
      rendered = self.setMessagingInline(args);
    }

    return rendered;
  },

  /**
   * This method is will set the messaging for the offer message overlay for brands that
   * do not have 'site.template.get'.
   * @param {string} args.message **REQUIRED** The offer message to be displayed in the overlay
   * @param {string} args.offerCode **REQUIRED** The offer code that was applied
   * @param {array} args.errors **OPTIONAL** An array of error messages to be shown
   */
  setMessagingInline: function(args) {
    var self = this;
    var offerCode = args.offerCode;
    var message = args.message;
    var errors = args.errors || [];

    var overlayContainer = $('.applied-offer-overlay');
    var data = { message: message, offer_code: offerCode, errors: errors };
    var rendered;

    // sites that use cant use 'site.template.get' like CL
    // we will look for the template on the page and populate it with the messaging
    if (overlayContainer.length) {
      overlayContainer.attr('data-applied_offer', offerCode);

      var appliedMessage = overlayContainer.find('.applied-offer__message');
      $(appliedMessage).empty();

      // something went truly wrong so show a default message
      var defaultMessage = overlayContainer.find('.applied-offer__default-message');
      if ((!message || message == '') && !errors.length) {
        defaultMessage.removeClass('hidden');
      }
      else {
        defaultMessage.addClass('hidden');
        $(appliedMessage).html(message);
      }

      // handle errors
      var ulNode = overlayContainer.find('ul.error_messages');
      ulNode.empty();
      $.each(errors, function(index, error) {
        // show something to help troubleshooting
        if (error.text == '' || error.text == '&nbsp;') {
          error.text = error.key;
        }

        var errListItemNode = [];
        errListItemNode = $('<li/>');
        errListItemNode.html(error.text);
        ulNode.append(errListItemNode);
      });

      rendered = overlayContainer.html();
    }

    return rendered;
  },

  /**
   * This method is will show the offer message overlay.
   * @param {string} rendered **REQUIRED** The offer message to be displayed in the overlay
   */
  launchOverlay: function(rendered) {
    var self = this;

    // show the overlay
    generic.overlay.launch({
      content: rendered,
      cssStyle : {
        height: '115px',
        width: '768px'
      }
    });
  },

  /**
   * This method is will trigger the overlay if its determined we arrive here via a redirect from an applied offer.
   * This is determined by the url param 'applied_offer_confirm'.
   */
  triggerOverlayOnRedirect: function() {
    var self = this;
    var data = this.searchUrl({searchStrings : ['applied_offer_confirm', 'o']});
    var showOverlay = data.applied_offer_confirm || 0;
    var offerCode = data.o || '';

    if (showOverlay == 1 && offerCode != '') {
      var query = {
        filter: {
          in_cart: 1,
          offer_code: offerCode
        }
      };

      generic.jsonrpc.fetch({
        method: 'offer.offersMatching',
        params: [query],
        onBoth: function(jsonRpcResponse) {
          var response = jsonRpcResponse.getValue();
          var errorObjectsArray = jsonRpcResponse.getMessages() || [];

          // if the offer is not in cart the response will be an empty array
          var message;
          if (errorObjectsArray.length == 0) {
            message = response.length ? response[0].confirm_message : null;
          }

          // show an overlay with messaging for the user
          var rendered = self.setMessaging({offerCode: offerCode, message: message, errors: errorObjectsArray});
          self.launchOverlay(rendered);
        }
      });
    }
  },

  attach: function(context, settings) {
    if (this.attached) {
      return;
    }
    this.attached = true;

    this.findOfferLinks();
    this.triggerOverlayOnRedirect();
  },

  attached: false
};

})(jQuery);
