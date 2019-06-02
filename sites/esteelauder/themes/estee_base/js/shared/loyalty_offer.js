
(function($) {

window.site = site || {};
site.offers = site.offers || {};
site.offers.loyaltyOffer = site.offers.loyaltyOffer || {};

// --------
// Primary behavior responsible for initializing the loyalty offer logic

Drupal.behaviors.ELB_loyalty_offer = {
  // debug config
  debug: false,         // when debugging, the overlay opens on all page loads

  // storage cookie name
  //offerCookie: 'welcome15',
  offerCookie: 'elist15',
  offerCookieExpire: 'elist15_expire',

  // # of seconds before the overlay appears
  defaultTimeout: 3000,

  // template path config
  templates: {
    form:              'loyalty_offer_signup',
    form1:             'loyalty_offer_valid_unused',
    form2:             'loyalty_offer_valid_used',
    form3:             'loyalty_offer_invalid_unused',
    form4:             'loyalty_offer_invalid_used',
    error:             'loyalty_offer_error',
  },

  excludeURLpopup: '/elistemail',
  excludeURLtray: '/ipsy',

  // overlay config
  overlay: {
    pc: {
      className: 'loyalty-offer-overlay',
      transition: 'none',
      width: '600px'
    },
    mobile: {
      className: 'loyalty-offer-overlay',
      width: "100%",
      height: "100%", //height: "1000px",
      innerHeight: "100%",
      scrolling: true,
      opacity: "0.9",
      transition: 'none'
    }
  },

  isStr: function(str) {
    return (typeof str === 'string');
  },

  isFunc: function(func) {
    return (typeof func === 'function');
  },

  isObj: function(mixed_var) {
    if (Object.prototype.toString.call(mixed_var) === '[object Array]') {
      return false;
    }
    return mixed_var !== null && typeof mixed_var === 'object';
  },

  /**
   * Helper function to get the raw contents of an JS inline template, and optionally interpolate
   * the html using Mustache
   */
  getTemplateContent: function(key, data) {
    var undef;

    // Sanitize the incoming data
    path = (key !== undef) ? key : 'foobar_template';
    data = data || false;

    // Get the html content of the template
    var html = $("script.inline-template[path='" + key + "']").html();

    if (html.length === 0) {
      return $();
    }

    // If there's no data object passed in, then just return a basic jquery element
    if (data == false || !$.isFunction(Mustache.render)) {
      return $(html);
    }

    // We have html and data, which means we should use Mustache to render the output
    return $(Mustache.render(html, data));
  },

  // Open a colorbox window
  openWindow: function(content, callBacks) {
    var self = this;
    content = self.isObj(content) ? content : $();

    // Dumb trick to get the entire contents of the html out of the jquery object
    content = content.wrap('<div />').parent().html();

    if (!$.isFunction($.colorbox)) {
      return false;
    }

    var args = {
      html: content,
      scrolling: false
    },
        darg = $('body').hasClass('device-mobile') ? self.overlay.mobile : self.overlay.pc;
    $.extend(args, darg);

    if (self.isObj(callBacks)) {
      for (var k in callBacks) {
        var func = callBacks[k];
        if (self.isFunc(func)) {
          args[k] = func;
        }
      }
    }

    args.closeButton = (('loyalty_offer_overlay_show_close' in Drupal.settings.globals_variables) ? (Drupal.settings.globals_variables.loyalty_offer_overlay_show_close == 1) : 1);
    args.opacity = (('loyalty_offer_overlay_opacity' in Drupal.settings.globals_variables) ? parseFloat(Drupal.settings.globals_variables.loyalty_offer_overlay_opacity) : "0.9");

    $.colorbox(args);
  },

  debugLoyaltyForm: function() {
      var self  = this;
      // remove
      var qs = (function(a) {
          if (a == "") return {};
          var b = {};
          for (var i = 0; i < a.length; ++i) {
              var p=a[i].split('=', 2);
              if (p.length == 1) {
                  b[p[0]] = "";
              } else {
                  b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
              }
          }
          return b;
      })(window.location.search.substr(1).split('&'));

      var loyaltyForm = qs['lp'];
      if ( !_.isUndefined(loyaltyForm) && loyaltyForm == 0 ) {
        loyaltyForm = self.templates.form;
      } else if ( !_.isUndefined(loyaltyForm) && loyaltyForm == 1 ) {
        loyaltyForm = self.templates.form1;
      } else if ( !_.isUndefined(loyaltyForm) && loyaltyForm == 2 ) {
        loyaltyForm = self.templates.form2;
      } else if ( !_.isUndefined(loyaltyForm) && loyaltyForm == 3 ) {
        loyaltyForm = self.templates.form3;
      } else if ( !_.isUndefined(loyaltyForm) && loyaltyForm == 4 ) {
        loyaltyForm = self.templates.form4;
      } else {
        loyaltyForm = false;
      }

      return loyaltyForm;
  },

  // Show the signup form
  showSignupForm: function() {
    var self = this;
    setTimeout(function() { self.showSignupFormNow(); }, self.defaultTimeout);
  },

  // Show the signup form immediately
  showSignupFormNow: function() {
    var self = this;
    // We check again to detect if we are enrolling for loyalty from order confirmation page
    var persistentCookie = Drupal.ELB.getJSONCookie('persistent_user_cookie');
    var hasLoyalty = persistentCookie.is_loyalty_member - 0;
    if (hasLoyalty) {
      // if loyalty do not show offer
      return false;
    }
    var debugForm = self.debugLoyaltyForm();
    var content;
    if (debugForm){
      //var content = self.getTemplateContent(self.templates.form);
      content = self.getTemplateContent(debugForm);
    } else if (self.debug) {
      content = self.getTemplateContent(self.templates.form);
    } else {
      content = self.getTemplateContent(self.templates.form);
    }
    // There is an input that creates a div that we can grab and specify an alternate layout class for i224733
    var useAltMarkUp = $(content).find('#USE_ALT_LAYOUT').length;
    if (useAltMarkUp){
      cboxArgs = $('body').hasClass('device-mobile') ? self.overlay.mobile : self.overlay.pc;
      cboxArgs.className = 'loyalty-offer-overlay alt_layout1';
      cboxArgs.fixed = true;
    }

    self.openWindow(content, {
      // Hide the content and overlay in onOpen, so we can fade it in initSignUpForm
      // This prevents "sliding" while the overridden css is loading, and also makes the overlay and content fade in simultaneously
      onOpen: function(){ $('.loyalty-offer-overlay #cboxContent,#cboxOverlay').css('visibility','hidden'); },
      onComplete: site.offers.loyaltyOffer.initSignUpForm
    });
  },

  /**
   * Helper function to determine if the loyaltyOffer offer should appear on this page
   * @TODO: this will likely be expanded to be disabled on checkout and whatnot
   */
  showOfferOnPage: function() {
    var self       = this,
        cookieName = self.offerCookie,
        cookieExpire = self.offerCookieExpire,
        hasCookie  = $.cookie(cookieName),
        hasExpiration = $.cookie(cookieExpire),
        showOffer  = false,
        undef;

    // adding to allow manual disabling of the popover
    var disabled = 0;
    if (hasCookie == undef){
      // there is a div in the mustache that gets printed based on the disabled checbox input loyalty_offer_signup_v1
      var markUp = self.getTemplateContent(self.templates.form);
      var markUpDisabled = $(markUp).find('#DISABLE_POPOVER');

      // set the session cookie if the page is disabled, rather than checking every time
      if ( markUpDisabled.length > 0 ){
        $.cookie(cookieName, '1', {
          path: '/'
        });
        return false;
      }

      // PHF 20160106 i258932: Disable pop up based on tag anywhere on page, leave no cookie
      markUpDisabled = $('#DISABLE_POPOVER');
      if ( markUpDisabled.length > 0 ){
          return false;
      }
    }

    var persistentCookie = Drupal.ELB.getJSONCookie('persistent_user_cookie');
    // console.log('/// persistentCookie ///');
    // console.log(persistentCookie);
    var hasLoyalty = persistentCookie.is_loyalty_member - 0;
    // var hasEmail = persistentCookie.email;
    // var hasFirstName = persistentCookie.first_name;
    // var signedIn = site.userInfoCookie.getValue('signed_in') - 0;
    // var isRecognized = !!hasEmail && !!hasFirstName && !!signedIn;

    //var debugLoyaltyForm = this.debugLoyaltyForm();
    //if (self.debug || hasCookie == undef || debugLoyaltyForm.length) {

    if (!hasLoyalty && hasCookie == undef) {
      showOffer = true;
      // unrecognized and expires in 3 days
      $.cookie(cookieName, '1', {
        expires: 3,
        path: '/'
      });
      // set expiration for retrieval
      //var date = $.datepicker.formatDate('dd/mm/yy', new Date());
      var datetime = new Date();
      datetime = datetime.getTime();
      $.cookie(cookieExpire, datetime, {
        path: '/'
      });
    } else if (!hasLoyalty && hasCookie){
      showOffer = false;
      // check expiration
      var timecheck = new Date();
      timecheck = timecheck.getTime();
      if (hasExpiration){
        $.cookie(cookieName, '1', {
          expires: 3,
          path: '/'
        });
        // set expiration for retrieval
        //var date = $.datepicker.formatDate('dd/mm/yy', new Date());
        var datetime = new Date();
        datetime = datetime.getTime();
        $.cookie(cookieExpire, datetime, {
          path: '/'
        });
        var days = (timecheck - hasExpiration)/1000/60/60/24;
        if (days >= 3) {
          showOffer = true;
          $.cookie(cookieName, '1', {
            expires: 3,
            path: '/'
          });
          // reset expiration
          $.cookie(cookieExpire, timecheck, {
            path: '/'
          });
        }
      } else if (hasExpiration == undef) {
        // for some reason no expiration cookie
        // set it as backup
        $.cookie(cookieExpire, timecheck, {
          path: '/'
        });
      }
    } else if (hasLoyalty) {
      // if loyalty do not show offer
      showOffer = false;
      $.cookie(cookieName, '1', {
        path: '/'
      });
      // delete expiration
      $.cookie('cookieExpire', null);
    }

    return showOffer;
  },

  sortLoyaltyForm: function(userinfo) {
    var self      = this;
    var templates = self.templates;
    var content   = '';

    //var isLoyaltyMember = userinfo.is_loyalty_member;
    var isRegistered = userinfo.registered_user;
    var offerUsed = 0;
    try {
      offerUsed = userinfo.offers.elist15.used;
      offerUsed = ( _.isNull(offerUsed) || _.isUndefined(offerUsed) ) ? 0 : offerUsed;
    } catch(e) {}

    if ( isRegistered && !offerUsed ) { // valid unused
      content = templates.form1;
    } else if ( isRegistered && offerUsed ) { // valid_used
      content = templates.form2;
    } else if ( !isRegistered && !offerUsed ) { // invalid_unused
      content = templates.form3;
    } else if ( !isRegistered && offerUsed ) { // invalid_used
      content = templates.form4;
    } else {
      // not that this should happen
      // fall back, just in case
      content = templates.form;
    }
    return content;
  },

  // Main function to get things kicked off
  attach: function(context, settings) {
    var self       = this,
        cookieName = self.offerCookie;

    // bail on excluded URL
    if (window.location.pathname == self.excludeURLpopup){
      return;
    }

    // If the user hasn't seen the popup, then show it to them
    if (self.showOfferOnPage()) {
      this.showSignupForm();
    } else {
      // disable tray
      if (window.location.pathname == self.excludeURLtray){
        return;
      }
      // check cookie
      if (!($.cookie("FeedTrayCookie"))) {
        $.cookie("FeedTrayCookie", 1, {
          expires : 3,
          path: '/'
        });
        var $myFeedTray = $('.my-feed-tray--loyalty');
        if ( $myFeedTray.length ){
          setTimeout(function() {
            site.drawers.open($('.my-feed-drawer .drawer-formatter__trigger'), $myFeedTray.parents('.drawer-formatter__content'), 0, true);
            setTimeout(function() {
              site.drawers.close($myFeedTray.parents('.drawer-formatter__content'));
            }, (10 * 1000)); //site.specialOffers.footerDisplayDuration = 10
          }, 60);
        }
       }
        //roll up my feed
        // borrowed from defunct special_offers.js
    }

    // Create the cookie
    // moved to showOfferOnPage logic
    // $.cookie(cookieName, '1', {
    //   expires: 3,
    //   path: '/'
    // });

    // Bind to the email_signup.success event
    // When a user does the email sign up in the footer, we'll show them the loyaltyOffer overlay
    // if the offer is still valid, and they haven't signed up already
    $(context).on('email_signup.success', function(event, rpcResponse) {
      console.log('email_signup.success');
      var response  = rpcResponse.getData();
      var userinfo  = response.userinfo || {};
      var content = self.sortLoyaltyForm(userinfo);
      if (content.length > 0) {
        // @TODO: triggering an overlay will close the special-offers-tray. We don't want it to do that.
        var html = self.getTemplateContent(content);
        self.openWindow(html);
      }
    });

    // Bind to the join_loyalty.success event
    $(context).on('join_loyalty.success', function(event, userinfo) {
      console.log('join_loyalty.success');
      var userinfo = userinfo || {};
      var content = self.sortLoyaltyForm(userinfo);

      if (content.length > 0) {
        // @TODO: triggering an overlay will close the special-offers-tray. We don't want it to do that.
        var html = self.getTemplateContent(content);
        self.openWindow(html);
      }
    });

    // Bind to the email_signup.error event for no particular reason except that it exists
    // Do we need to show an error message?
    $(context).on('email_signup.error', function(event, rpcResponse) {
    });

    // Bind to the cbox_complete event. This fires anytime a colorbox window is opened.
    // This event handler adds the disclaimer text to the overlays, but could be used for similiar tasks as well. // no disclaimer
    $(context).on('cbox_complete', function() {
      var overlay  = ($('body').hasClass('device-mobile') ? self.overlay.mobile : self.overlay.pc);
      //$element = $('#cboxContent', '#colorbox.' + overlay.className.split(" ")[0]);
    });

    $(context).on('cbox_cleanup', function() {
      $response = $('.loyalty_popover--response');
      if ($response.length){
        //hook up close button to refresh
        location.reload();
      }
    });

    $(document).on('loyalty.show_signup_form', function(e) {
      Drupal.behaviors.ELB_loyalty_offer.showSignupFormNow();
    });

  }
};


// --------
// Callbacks and whatnot

site.offers.loyaltyOffer = {
  behavior: Drupal.behaviors.ELB_loyalty_offer,

  getOverlayContent: function() {
    return $('#cboxLoadedContent');
  },

  triggerLoyaltyEnrollmentTemplates: function(userinfo) {
    var self    = site.offers.loyaltyOffer,
        overlay = self.getOverlayContent();

    // console.log('userinfo:');
    // console.log(userinfo);

    var b = self.behavior,
        t = b.templates,
        c = t.error,                                       // Default template to return
        e = true,                                          // Defaults to the error condition
        d = { message: "<p>There's been an error.</p>" };  // Error message

    //var isLoyaltyMember = userinfo.is_loyalty_member;
    var isRegistered = userinfo.registered_user;
    var offerUsed = ( _.isNull(userinfo.offers) || _.isUndefined(userinfo.offers) ) ? 0 : userinfo.offers.elist15.used;

    if ( isRegistered && !offerUsed ) { // valid unused
      c = t.form1;
    } else if ( isRegistered && offerUsed ) { // valid_used
      c = t.form2;
    } else if ( !isRegistered && !offerUsed ) { // invalid_unused
      c = t.form3;
    } else if ( !isRegistered && offerUsed ) { // invalid_used
      c = t.form4;
    }

    // And make sure there's no error to show
    e = false;

    // Remove any existing content, and show the error/thanks/already_signed_up template
    overlay
      .empty()
      .append( e ? b.getTemplateContent(c, d) : b.getTemplateContent(c) );

    // Act like we're opening a new colorbox
    $(document).trigger('cbox_complete');

    //Resize the colorbox to accomodate the new content
    $.colorbox.resize();

    var formAction = overlay.find('form').attr('action');
    overlay.find('form').attr('action', 'https://' + window.location.hostname + formAction);
  },

  /**
   * Initialize the signup form
   */
  initSignUpForm: function() {
    var self    = site.offers.loyaltyOffer,
        overlay = self.getOverlayContent();

    // we set visibility to 0 onOpen, to avoid "sliding" while the css is loading
    // now we will:
    // 1) fade them both out
    $('.loyalty-offer-overlay #cboxContent,#cboxOverlay').fadeOut(1,function(){
        // 2) set visibility on and fade in the overelay
        $('#cboxOverlay').css('visibility','visible').fadeIn(500,function(){
          // 3) set visibility and fade in the content (very quickly)
          $('.loyalty-offer-overlay #cboxContent').css('visibility','visible').fadeIn(100);
      });
    });
    if($('body').hasClass("device-mobile")) {
      var isKeyboard = false;
      var initialScreenSize = $(window).innerHeight();
      $(window).on('resize', _.debounce(function(e) {
        e.preventDefault();
        isKeyboard = ($(window).innerHeight() < initialScreenSize);
        if (isKeyboard) {
          wHeight = $(window).innerHeight();
          $('.loyalty_popover__content').css({"height": wHeight + "px"});
        }
        else {
          $('.loyalty_popover__content').css({"height":"auto"});
        }
      }, 100));
    }
    overlay.find('form').submit(function(e) {
      e.preventDefault();

      var form = this;
      var fields = [
       '_SUBMIT',
       'COUNTRY_ID',
       'LANGUAGE_ID',
       'PC_EMAIL_PROMOTIONS',
       'PC_EMAIL_PROMOTIONS_PRESENT',
       'LOYALTY_ACTIVE_FLAG',
       'ACCEPTED_LOYALTY_TERMS',
       'LAST_SOURCE',
       'redirect_or_text',
       'redirect',
       'PC_EMAIL_ADDRESS',
       'LOYALTY_EMAIL_PROMOTIONS',
       'LOYALTY_ENROLLED_SOURCE'
      ];

      var paramObj = {};
      $.each(fields, function(i, name) {
        var field = $('input[name="' + name + '"]', form),
            undef;

        if (field != undef && field.length > 0) {
          //paramObj[name] = field.val();
          // for the unchecked checkboxes we want to send empty strings to backend for processing
          var isUncheckedBox = field.is(':checkbox') && !field.prop('checked');
          paramObj[name] = isUncheckedBox ? '' : field.val();
        }
      });

        if ($.cookie('csrftoken')) {
          paramObj['_TOKEN'] = $.cookie('csrftoken');
        }
      // submit form
      generic.jsonrpc.fetch({
        method: 'rpc.form',
        params: [paramObj],
        onSuccess: function(jsonRpcResponse) {
          console.log('success');
          var response = jsonRpcResponse.getData(),
              userinfo = response.userinfo || {};
          site.offers.loyaltyOffer.triggerLoyaltyEnrollmentTemplates(userinfo);
        },
        onFailure: function(jsonRpcResponse){
          //console.log('failed');
          var messages = jsonRpcResponse.getMessages();
          console.log(messages);

          // Get the error messages from the rpc response, and use them in the error template
          var tmp = [],
              out = '',
              proceed = 1;
          $.each(messages, function(i, message) {
            tmp.push(message.text);
            if (message.key == "required.pc_email_address.loyalty_email_signup" || message.key == "invalid.pc_email_address.loyalty_email_signup" || message.key == "required.pc_email_promotions.loyalty_email_signup" || message.key == "required.accepted_loyalty_terms.loyalty_email_signup") {
              var $formContainer = $('.loyalty_popover__submit-container');
              var $input = $('.form-text',$formContainer);
              $input.addClass('error');
              $formContainer.next('.error').remove();
              $formContainer.after('<div class="error">'+ message.text +'</div>');
              $.colorbox.resize();
              proceed = 0;
            }
          });

          if (proceed){
            if (tmp.length > 0) {
              out = '<p>' + tmp.join('<br />') + '</p>';
            }

            // Populate the template with an error message
            var b = self.behavior,
                t = b.templates.error,
                d = { message: ((out.length > 0) ? out : "<p>There's been an error.</p>") };

            overlay
              .empty()
              .append( b.getTemplateContent(t, d) );

            // Act like we're opening a new colorbox
            $(document).trigger('cbox_complete');
          } else {
            //
          }
        }
      });

      return false;
    });
  }

};
})(jQuery);
