
var site = site || {};
site.account = site.account || {};
site.signin = site.signin || {};
site.userInfoCookie = site.userInfoCookie || {};
site.userInfoCookie.getValue = site.userInfoCookie.getValue || function() { return ''; };


(function ($) {
  Drupal.behaviors.restrictedLoyaltyPage = {
    attach: function (context, settings) {
      var self = this;
      self.validateLoyaltyUser();
      self._initForm($('.restricted-loyalty-sign-in-component'));
    },

    validateLoyaltyUser: function () {
      var self = this;

      var levelAccess = site.loyalty.checkLoyaltyPageAccess();

      if(levelAccess == 0) {
        // page has no restictions
        return;
      }

      var overlay = $('.restricted-loyalty-sign-in-component');
      var overlayTemplate = $('#loyalty-restricted-overlay-template');
      var overlayContent = overlayTemplate.html();
      var isMobile = !$('body').hasClass('device-pc');

      var colorboxSettings = {
          html: overlayContent,
          className: 'restricted-loyalty-signin-overlay-wrapper restricted-loyalty-signin-overlay-loyalty',
          width: '100%',
          height: '600px',
          maxWidth: '1022px',
          fixed: true,
          escKey: false,
          closeButton: false,
          overlayClose: false
        };
        if (isMobile) {
          colorboxSettings.top = '0px';
          colorboxSettings.height = '1000px';
      };

      $.colorbox(colorboxSettings);

      var signedIn = site.userInfoCookie.getValue('signed_in');
      if (signedIn == '0') signedIn = false;

      var loyalty = parseInt(site.userInfoCookie.getValue('is_loyalty_member'));
      var persistentCookie = Drupal.ELB.getJSONCookie('persistent_user_cookie');
      var currentLoyaltyLevel = persistentCookie.loyalty_level || 0;
      var firstName = persistentCookie.first_name || '';
      var userDetected = !!firstName;

      var args = {
        signedIn : signedIn,
        isLoyaltyMember : loyalty
      };

      var showOverlay = 1;

      // containers whose default state is hidden
      var hiddenContainers = [
        'js-loyalty-point-restriction',
        'js-loyalty-tier-restriction',
        'js-sign_in_text',
        'js-earn-more',
        'js-not-enrolled',
        'js-one-tier-away'
      ];

      // reset all containers back to their default state
      // this is to handle cases where we are revalidating after user state change
      $.each( hiddenContainers, function( index, value ) {
        $(overlay).find('.' + value).addClass('hidden');
      });

      // container that show form errors
      var errorContainers = [
        'form--errors--loyalty-restricted-signin',
        'form--errors--loyalty-cta'
      ];

      // reset errors
      // this is to handle cases where we are revalidating after user state change
      $.each( errorContainers, function( index, value ) {
        $('#' + value).html();
      });

      // user is signed in or detected and a loyalty member so check if they have access
      if ( !signedIn || ((signedIn || userDetected) && loyalty) ) {
        //console.log('user is not signed in or they are a detected loyalty person');
        var points = persistentCookie.points || 0;
        var pointsNeededUntilNextLevel = persistentCookie.points_to_next_level || 50;

        //console.log('we need to be level ' + levelAccess);
        //console.log('currentLoyaltyLevel is ' + currentLoyaltyLevel);
        // 6.1.1 Restricted Page by points
        // 6.1.2 Restricted Page by tier
        if(levelAccess > currentLoyaltyLevel) {
          var loyaltyDiff = levelAccess - currentLoyaltyLevel;
          //console.log('we dont have access to this page - trigger popup');
          // tell the user they need to be a certain tier
          // 6.1.3 Restricted Page - Error Message - Already Member
          if(loyaltyDiff > 1) {
            //console.log('page only accessible to level ' + levelAccess + ' members');
            args['levelAccess'] = levelAccess;
          }
          // show the user how close they are to accessing this page
          // 6.1.5 Restricted Page - Only One Tier Away
          else {
            //console.log('pointsNeededUntilNextLevel is ' + pointsNeededUntilNextLevel);
            args['pointsNeededUntilNextLevel'] = pointsNeededUntilNextLevel;
          }
        }
        // dont show the user the overlay because they validated ok
        else {
          //console.log('we are ok to see this page');
          $.colorbox.close();
          showOverlay = 0;
        }
      }
      // show them the popup that allows them to join elist
      // 6.1.4 Restricted Page - Error Message
      else if (signedIn && !loyalty) {
        //console.log('show popup to join elist');
        args['join_elist'] = 1;
        args['levelAccess'] = levelAccess;
      }

      // show the overlay to user
      if(showOverlay) {
        //console.log('showOverlay is ' + showOverlay );
        self._launchOverlay(args);
      }
    },

    _launchOverlay: function(args) {
      var self = this;
      var overlay = $('.restricted-loyalty-sign-in-component');

      var signedIn = args.signedIn;
      var levelAccess = args.levelAccess || 0;
      var pointsNeeded = args.pointsNeededUntilNextLevel || 0;
      var isLoyaltyMember = args.isLoyaltyMember;

      var signin = $(overlay).find('.js-retricted-signin-form-container');
      var signInText = $(overlay).find('.js-sign_in_text');
      var pointRestrictionMsg = $(overlay).find('.js-loyalty-point-restriction');
      var tierRestrictionMsg = $(overlay).find('.js-loyalty-tier-restriction');
      var earnMore = $(overlay).find('.js-earn-more');
      var notEnrolled = $(overlay).find('.js-not-enrolled');
      var oneTierAway = $(overlay).find('.js-one-tier-away');

      // find and replace content with loyalty details
      $(overlay).find('.js-points').html(pointsNeeded);
      $(overlay).find('.js-elist-level').html(levelAccess);

      // hide the signin form if the user is signed in
      if(signedIn) {
        $(signin).addClass('hidden');
      }

      // user is not signed in
      // show signin text in conjunction with other messaging
      if(!signedIn) {
        $(signInText).removeClass('hidden');
        if(levelAccess) {
          $(tierRestrictionMsg).removeClass('hidden');
        }
        else if(pointsNeeded) {
          $(pointRestrictionMsg).removeClass('hidden');
        }
      }

      // 6.1.4 Restricted Page - Error Message - Not Member
      else if(signedIn && !isLoyaltyMember) {
        //console.log('notEnrolled + tierRestrictionMsg');
        $(notEnrolled).removeClass('hidden');
      }

      // 6.1.1 Restricted Page - Restricted By Tier
    //   6.1.3 Restricted Page - Error Message - Already Member
      else if(levelAccess) {
        $(earnMore).removeClass('hidden');
        //console.log('notEnrolled + levelAccess');
      }

      // 6.1.2 Restricted Page - Restricted By Points
      // 6.1.5 Restricted Page - Only One Tier Away
      else if(pointsNeeded) {
        //console.log('pointsNeeded + pointRestrictionMsg');
        if(signedIn) {
          $(oneTierAway).removeClass('hidden');
        }
      }

      var returnURL = returnURL || window.location.pathname + window.location.search;
      $('input[name=RETURN_URL]', $(overlay)).val(returnURL);

      // Init selectboxes for desktop:
      var isMobile = !$('body').hasClass('device-pc');
      if (!isMobile) {
        $('.selectbox', $(overlay)).selectBox();
        // Apply global js text input behavior:
        Drupal.behaviors.formTextInputs.attach($('.signin-overlay-wrapper'));
      }

      $(overlay).show();
    },

    _initForm: function($wrapper) {
      var self = this;

      if ($('.sign-in-component__fpw-link', $wrapper).length > 0){
        site.signin.forgotPassword({
          resetPassword: true,
          emailNode: $("input#sign-in-component__EMAIL_ADDRESS", $wrapper),
          errorListNode: $(".signin-block__lost-pass-text", $wrapper),
          forgotPasswordLink: $('#forgot-password', $wrapper),
          forgotPasswordNote: $('p#forgot_pw_note', $wrapper)
        });
      }

      // bind join loyalty form
      $('.js-loyalty-cta__button',$wrapper).click(function(event) {
        event.preventDefault();
        var params = {};
        params['_SUBMIT'] = 'loyalty_join';
        params['LOYALTY_ACTIVE_FLAG'] = '1';
        params['ACCEPTED_LOYALTY_TERMS'] = '1';

        generic.jsonrpc.fetch({
          method: 'rpc.form',
          params: [params],
          onSuccess: function(jsonRpcResponse) {
            var data = jsonRpcResponse.getData();
            loyalty = data.userinfo.is_loyalty_member;
            currentLoyaltyLevel = data.userinfo.loyalty_level;
            // revalidate user info
            self.validateLoyaltyUser();
          },
          onFailure: function(jsonRpcResponse) {
            // display error
            var errorObjectsArray = jsonRpcResponse.getMessages();
            var errListNode = $('#form--errors--loyalty-cta');
            generic.showErrors(errorObjectsArray, errListNode, $wrapper);
          }
        });
      });

      // bind signin form
      $('.js-restricted-loyalty-signin__button', $wrapper).click(function(event) {
        event.preventDefault();
        var params = {};
        params['_SUBMIT'] = 'signin';
        params['EMAIL_ADDRESS'] = $wrapper.find('#restricted-loyalty-sign-in-component__EMAIL_ADDRESS').val();
        params['PASSWORD'] = $wrapper.find('#restricted-loyalty-sign-in-component__PASSWORD').val();

        generic.jsonrpc.fetch({
          method: 'rpc.form',
          params: [params],
          onSuccess: function(jsonRpcResponse) {
            var data = jsonRpcResponse.getData();
            site.userInfoCookie.init();
            Drupal.ELB.loadPersistenUserCookie();
            self.validateLoyaltyUser();
          },
          onFailure: function(jsonRpcResponse) {
            // display error
            var errorObjectsArray = jsonRpcResponse.getMessages();
            var errListNode = $('#form--errors--loyalty-restricted-signin');
            generic.showErrors(errorObjectsArray, errListNode, $wrapper);
          }
        });
      });
    }
  };
})(jQuery);
