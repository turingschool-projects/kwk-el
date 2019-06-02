
var site = site || {};
var generic = generic || {};
site.account = site.account || {};
site.signin = site.signin || {};
site.userInfoCookie = site.userInfoCookie || {};
site.userInfoCookie.getValue = site.userInfoCookie.getValue || function() { return ''; };
var csrfToken = generic.cookie('csrftoken');
(function ($) {
  Drupal.behaviors.signIn = {
    attach: function (context, settings) {
      Drupal.ELB.loadPersistenUserCookie();
      var signedIn = site.userInfoCookie.getValue('signed_in');
      var forceReturn = false;
      var returnURL = null;
      if (signedIn == '0') signedIn = false;


      // Determine if user has signed in before by looking at the persistent
      // user cookie.
      var persistentCookie = Drupal.ELB.getJSONCookie('persistent_user_cookie');
      var loyalty = persistentCookie.is_loyalty_member == "1";

      // @TODO: get email address too so we can put it in the input field
      var firstName = persistentCookie.first_name || '';
      firstName = firstName.replace(/\+/g, ' ');
      var firstTime = persistentCookie.first_time;
      var userDetected = !!firstName;

      // Show/hide registration/sign in links on Beaty Feed page based on user detection
      if (userDetected) {
        $('.bfeed-create-account').hide();
        $('.bfeed-sign-in').show();
      } else {
        $('.bfeed-create-account').show();
        $('.bfeed-sign-in').hide();
      }

      var $overlayTemplate = $('#signin-overlay-template', context);
      var overlayContent = $overlayTemplate.html();
      // replaced page-utilities__account-button with page-utilities__signin-text
      //
      var $triggerButton = $('.page-utilities__signin-text, .js-launch-account, .field-mobile-menu .sign-in---my-account, .loyalty_join_signin .form-submit:last-child', context);

      // Determine the state of the overlay to show:
      var signInOverlayState = $.cookie('signInOverlayState', {path: '/'});
      // Delete the cookie immediately (apparently these are both needed?):
      $.cookie('signInOverlayState', null, {path: '/'});
      $.cookie('signInOverlayState', null);

      var isMobile = site.client.isMobile;
      var $signInPage = $('.sign-in-page', context);
      var isSignInPage = $signInPage.length;
      var colorboxSettings = {
        html: overlayContent,
        className: 'signin-overlay-wrapper signin-overlay-loyalty',
        width: '100%',
        height: '630px',
        maxWidth: '1022px',
        fixed: true
      };
      if (isMobile) {
        colorboxSettings.top = '0px';
        colorboxSettings.height = '1000px';
      }

      // User greeting and login/logout link below Account button
      // top SIGN IN or SIGN OUT section
      var userLoginState = $('.user-login-state');
      var $accountText = $('.page-utilities__account-text');
      var $loyaltyTermsCheckbox = $('.js-loyalty-required-terms', context);

      if (userLoginState.length) {
        if (signedIn) {
          if (isMobile) {
            if (settings.ajaxPageState.theme === 'de_mobile') {
              $('.js-is_signed_in', $accountText).removeClass('hidden');
              $('.user-greeting', $accountText).addClass('hidden');
            }
          } else { // Implied !isMobile
            // user is signed in so show the sign out link
            // "Hi [name!] Sign Out"
            $accountText.show();
            $('.js-is_signed_in', $accountText).removeClass('hidden');
            $('.page-utilities__signin-text').hide();
            $('.loyalty_mrkt_ldng .js-sign-in-popup').hide();
            $loyaltyTermsCheckbox.removeClass('hidden');
          }
        } else if (!isMobile) { // Implied !signedIn
          if (userDetected || loyalty) {
            // user is signed out but detected show
            // "Hi [name!] Not You?"
            $accountText.show();
            $('.js-is_recognized', $accountText).removeClass('hidden');
            $('.page-utilities__signin-text').hide();
            $('.loyalty_mrkt_ldng .js-sign-in-popup').hide();
            $loyaltyTermsCheckbox.removeClass('hidden');
          } else {
            // user is signed out so show the sign in link
            // "Sign In"
            $('.page-utilities__signin-text').show();
            $('.page-utilities__account-text').hide();
            $('.loyalty_mrkt_ldng .js-sign-in-popup').show();
            $loyaltyTermsCheckbox.addClass('hidden');
          }
        } else { // Implied !signedIn and isMobile
          $('.loyalty_market .loyalty_market__btn__signin').css('display', 'block');
        }
      }

      // Show JOIN LOYALTY or USERNAME + POINTS
      var userLoyaltyState = $('.user-loyalty-state');
      if( userLoyaltyState.length ) {
        if (!isMobile) {
          if ( loyalty ) {
            // add the points/tier name to the global navigation under the user name
            var points = persistentCookie.points || 0;
            var levelName = persistentCookie.loyalty_level_name || '';
            levelName = levelName.replace(/\+/g, ' ');

            $(userLoyaltyState).find('.user-logged-in').find('.js-loyalty-points-value').html(points);
            $(userLoyaltyState).find('.user-logged-in').find('.js-loyalty-tier-name').html(levelName);

            // show points
            $('.user-logged-in').show();
            $('.user-logged-out').hide();
          } else {
            // show join link
            $('.user-logged-out').show();
            $('.user-logged-in').hide();
          }
        }

        // bind the click so when the user clicks 'join e-list' they are shown the popup to enroll
        $('.js-join-elist').click(function(event) {
          event.preventDefault();
          Drupal.behaviors.ELB_loyalty_offer.showSignupFormNow();
        });
      }

      // Cursor issue on IOS11.X
      function _launchOverlay(forceReturn, returnURL) {
        var $body = $('html');
        if (generic.env.isiOS11) {
          colorboxSettings.onComplete = function() {
            $body.addClass('body__fixed');
          };
          colorboxSettings.onClosed = function() {
            $body.removeClass('body__fixed');
          };
        }
        $.colorbox(colorboxSettings);

        var $overlay = $('.signin-overlay-wrapper .sign-in-component');

        // Redirect back to the current page
        // var returnURL = '?RETURN_URL=' + window.location.pathname;
        // Generally only registration sends you back to your last page, but
        // there are some cases where sign in can (ie. "Save to Profile" in the
        // Foundation Finder)
        if (forceReturn) {
          $('form', $overlay).each(function(){
            if (!$('input[name=RETURN_URL]', this).length) {
              $(this).append('<input type="hidden" name="RETURN_URL" value="" />');
            }
          });
        }
        returnURL = returnURL || window.location.pathname + window.location.search;

        $('input[name=RETURN_URL]', $overlay).val(returnURL);

        _initForm($overlay);

        // Init selectboxes for desktop:
        if (!isMobile) {
          $('.selectbox', $overlay).selectBox();
          // Apply global js text input behavior:
          if (typeof Drupal.behaviors.formTextInputs !== "undefined") {
            Drupal.behaviors.formTextInputs.attach($('.signin-overlay-wrapper'));
          }
        }
      }

      function triggerOverlay(event, element) {
        event.preventDefault();

        var $element = $(element);
        var forceReturn = $element.hasClass('js-launch-account--return');
        var returnURL = forceReturn ? $element.attr('data-return-url') : null;
        var $signInComponent = $('.sign-in-component', context);

        // If already signed in, this button works as a link to the account
        // landing.
        if (signedIn) {
          window.location = '/account/index.tmpl';
        } else if ($signInComponent.length) {
          //show the sign in form if you clicked on the SIGN IN link
          event.currentTarget.classList.contains('page-utilities__signin-text') && $signInComponent.addClass('sign-in');
          // If the form is already on the page, focus on the first element in it
          $signInComponent.find('.form-text:visible').first().focus();
        } else {
          _launchOverlay(forceReturn, returnURL);
          if(generic.env.isIOS4) {
             popupScroll.destroy();
             popupScroll = null;
             popupScroll = new IScroll('#colorbox',  { mouseWheel: true });
             setTimeout( function(){
               popupScroll.refresh();
             }, 500 ) ;
          }
        }
      }

      function _initForm($wrapper) {
        $('.sign-in-component', $signInPage).show();
        var $registerForm = $('.sign-in-component__form--registration', $wrapper);
        var $registerConfirmForm = $('.sign-in-component__confirm--registration', $wrapper);
        var $signInForm = $('.sign-in-component__form--sign-in', $wrapper);
        var $showPass = $('input[name=SHOW_PASSWORD]', $wrapper);
        var $pass = $('input[type=password]', $registerForm);
        var $error_messages_list = $("ul.error_messages").find('li');

        // Set the appropriate class on the outer container to tell css what to
        // display. By default we show the registration
        // form, but if the overlay state cookie indicates we just registered or
        // signed in, we show the relevant confirmation screen instead. Finally,
        // if the user's ever logged in on this machine we display the sign in
        // form by default.

        // First off, if there's an error in the form, and we're trying to show
        // a confirmation page, go back a step:
        if (isSignInPage && $('input.error, select.error', $wrapper).length) {
          if (signInOverlayState == 'register-confirm') {
            signInOverlayState = 'register';
          } else if (signInOverlayState == 'signin-confirm') {
            signInOverlayState = 'signin';
          }
        }

        if(isSignInPage && $('#account_lockout\\.\\.').is(":visible")){
          if (signInOverlayState == 'signin-confirm') {
            signInOverlayState = 'signin';
          }
        }

        // Toggle the class:
        if (signInOverlayState == 'register' || signInOverlayState == null) {
          $wrapper.addClass('registration');
        } else if (signInOverlayState == 'register-confirm') {
          $wrapper.addClass('registration-confirmation');
        } else if (signInOverlayState == 'signin-confirm') {
          // $wrapper.addClass('sign-in-confirmation');
        } else if (signInOverlayState == 'signin' || userDetected) {
          $wrapper.addClass('sign-in');
        }

        // if user has registered before then show sign in form
        if ((firstTime == 0) && (signInOverlayState != 'register-confirm') && (userDetected)) {
          $wrapper.addClass('sign-in');
        }

        if(signInOverlayState == 'signin-confirm' && !loyalty) {
          $wrapper.addClass('signin-join-loyalty');
        }

        // Remove any stray error classes that may have ended up on the hidden forms:
        $('form:hidden', $wrapper).find('input.error, select.error').removeClass('error');

        // Preprocess the form:

        $pass.each(function(){
          $(this).after('<div class="visible-pass-wrapper"><input class="visible-pass form-text" type="text" style="display: none;" /></div>');
          if (!isMobile) {
            if (typeof Drupal.behaviors.formTextInputs !== "undefined") {
              Drupal.behaviors.formTextInputs.attach($('.visible-pass-wrapper'));
            }
          }
        });
        var $visiblePass = $('.visible-pass', $wrapper);

        // Add the user's first name to the sign in confirmation screen header:
        if (firstName) {
          var $signInConfirmHeader = $('.sign-in-component__confirm--sign-in .sign-in-component__header', $wrapper);
          $signInConfirmHeader.text($signInConfirmHeader.text().replace('first_name', firstName));
        }

        if ($('.sign-in-component__fpw-link', $wrapper).length >0){
          site.signin.forgotPassword({
            resetPassword: true,
            emailNode: $("input#sign-in-component__EMAIL_ADDRESS", $wrapper),
            errorListNode: $(".signin-block__lost-pass-text", $wrapper),
            forgotPasswordLink: $('#forgot-password', $wrapper),
            forgotPasswordNote: $('p#forgot_pw_note', $wrapper)
          });
        }

        // Bind events:

        $showPass.on('change', function(e) {
          var show = $(this).is(':checked');
          $visiblePass.add($pass).toggle();
          if (show) {
            $('.visible-pass', $wrapper).each(function(){
              $(this).val($(this).parent().prev().val()).trigger('blur');
            });
          } else {
            $pass.each(function(){
              $(this).val($(this).next().children().first().val()).trigger('blur');
            });
          }
        });

        // Prevent the sms form from submitting on the register-confirm overlay when the mobile number is blank
        if (signInOverlayState == 'register-confirm') {
          $('.sign-in-component__confirm-options, input[type=submit]').on('click', function() {
            var mobileNumber = $('#sign-in-component__SMSPROMO_MOBILE_NUMBER');
            if ( $(mobileNumber).attr('value') == '') {
              $('input[type=hidden], [name=_SECONDARY_SUBMIT], [value=sms]').remove();
            }
            if (typeof csrfToken !== 'undefined') {
              $(this).append('<input type="hidden" name="_TOKEN" value="' + csrfToken + '" />');
            }
            $('.sign-in-component__confirm-options, input[name=RETURN_URL]').val('/account/registration.tmpl');
          });
        }

        if (signInOverlayState == 'signin-confirm') {
          // join loyalty
          $('.signin-loyalty-cta__button',$wrapper).click(function(event) {
            event.preventDefault();
            var params = {};
            params['_SUBMIT'] = 'loyalty_email_signup';
            params['LOYALTY_ACTIVE_FLAG'] = '1';
            params['PC_EMAIL_ADDRESS'] = site.userInfoCookie.getValue('email');
            params['ACCEPTED_LOYALTY_TERMS'] = '1';

            var field = $('.signin-loyalty-cta input[name="ACCEPTED_LOYALTY_TERMS"]'), undefined;
            if (field != undefined && field.length > 0) {
              var isUncheckedBox = field.is(':checkbox') && !field.prop('checked');
              params['ACCEPTED_LOYALTY_TERMS'] = isUncheckedBox ? '' : field.val();
            } else {
              params['PC_EMAIL_PROMOTIONS'] = '1';
              params['PC_EMAIL_PROMOTIONS_PRESENT'] = '1';
            }
            if (typeof csrfToken !== 'undefined') {
              params['_TOKEN'] = csrfToken;
            }
            generic.jsonrpc.fetch({
              method: 'rpc.form',
              params: [params],
              onSuccess: function(jsonRpcResponse) {
                // send them to loyalty landing
                window.location.href = "/account/loyalty/index.tmpl";
              },
              onFailure: function(jsonRpcResponse) {
                // display error
                var errorObjectsArray = jsonRpcResponse.getMessages();
                var errListNode = $('#form--errors--loyalty-cta');
                generic.showErrors(errorObjectsArray, errListNode, $wrapper);
              }
            });
          });

          // no thanks
          $('.signin-loyalty-cta__link',$wrapper).click(function(event) {
            event.preventDefault();
            $.colorbox.close();
          });
        }

        $signInForm.add($registerForm).on('submit', function() {
          // Set the password field to what's in the visible password field if
          // show password is checked
          var showPass = $showPass.is(':checked');
          if (showPass) {
            $pass.each(function(){
              $(this).val($(this).next().children().first().val());
            });
          }
          if (typeof csrfToken !== 'undefined') {
            $(this).append('<input type="hidden" name="_TOKEN" value="' + csrfToken + '" />');
          }

          // Set a cookie so we remember which form was submitted so we can
          // launch the relevant confirmation overlay on the next page load
          var cookieVal = $(this).hasClass('sign-in-component__form--sign-in') ? 'signin-confirm' : 'register-confirm';
          $.cookie('signInOverlayState', cookieVal, {path: '/'});

        });

        $('.signin-overlay__toggle-form a', $wrapper).on('click.signIn', function(event) {
          event.preventDefault();
          //$error_messages_list //not sure why this is here
          //this also hides Session Timeout message, since it's lumped into the Registration Form error message list
          var fromSessionTimeOut = window.location.href.indexOf('timeout=1') > 0;
          //show Session Timeout message if your session timed out
          $error_messages_list && !fromSessionTimeOut && $error_messages_list.hide();
          $wrapper.toggleClass('sign-in');
        });

        $('.sign-in-component__close', $wrapper).on('click.signIn', function(event) {
          event.preventDefault();
          $.colorbox.close();
          if (signInOverlayState == 'register-confirm' && signedIn) {
            $( '.my-feed-drawer .drawer-formatter__trigger').trigger('mouseover');
          }
        });
        var openSignin = $.cookie('showsignin');
        if(openSignin) {
          $('.signin-overlay__toggle-form.signin-overlay__toggle-form--have-acount a').trigger('click');
          $.cookie('showsignin', null);
        }

      } // /End initForm()

      $triggerButton.on( 'click.signIn', function(event) {
        $.cookie("showsignin", 1);
        triggerOverlay(event, this);
        if (site.facebook) {
          site.facebook.init();
        }
        $.colorbox.resize();
      });

      // Automatically launch the overlay if the cookie is set and we're not on
      // the dedicated sign in page.
      if (!isSignInPage) {
        // Disabling the sign in confirmation functionality since it was removed from the spec.
        // if ((signInOverlayState == 'register-confirm' || signInOverlayState == 'signin-confirm') && signedIn) {
        if (signInOverlayState == 'register-confirm' && signedIn) {
          colorboxSettings.className += " new-user-registration";
          _launchOverlay(forceReturn, returnURL);
        }

        // check loyalty
        if ( signInOverlayState == 'signin-confirm' && signedIn && !loyalty) {
          _launchOverlay(forceReturn, returnURL);
        }
      }

      // Run initForm directly on the context. This will only really be useful
      // for the sign in page, where the form is already embedded.
      _initForm($('.sign-in-component', context));

      // Ensure this script doesn't break site if perlgem isn't running:
      if (typeof site != 'undefined' && typeof site.userInfoCookie != 'undefined') {
        // enabling to use first_name placeholder in CMS
        var $template = $('.page-utilities__account-text');
        if(firstName.length){
          var rendered = Mustache.render( $template.html(), { first_name: firstName } );
          $template.html( rendered );
        }else{
          var $userGreating = $('.user-greeting__name',$template);
          $userGreating.html('');
        }
        // bind to the recogized sign in link in the gnav
        $('.js-is_detected').bind('click.signIn', function(event){ triggerOverlay(event, this) });
        // if user clicks on 'Sign out' link reset recognized user related cookies
        $('.sign-out-link').each(function(event) {
          var $signOutLink = $(this);
          var returnURL = window.location.pathname;
          var signOutURL = $signOutLink.attr('href');
          if (returnURL != "/checkout/confirm.tmpl") {
            signOutURL += '&success_url=' + returnURL;
          }
          $signOutLink.attr('href', signOutURL).on('click', function(event) {
            var domain = '.' + window.location.hostname.replace(/^.*(esteelauder\.)/, function(m, $1) {
              return $1;
            });
            var cookieObj = $.parseJSON($.cookie('persistent_user_cookie', { path: '/', domain: domain }));
            cookieObj.first_name = null;
            $.cookie('persistent_user_cookie', JSON.stringify(cookieObj), { path: '/', domain: domain });
            $.cookie("persistent_user_last_purchase", null, { path: '/' });
            $.cookie('expandMyFeedTray', 0, { path: '/' });
            $.cookie('showsignin', 1);
          });
        });
      }
    }
  };
})(jQuery);
