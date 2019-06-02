
(function($) {

Drupal.behaviors.ELB_MyFeed_Loyalty = {
  attach: function(context, settings) {

    // loyalty
    var $container  = $('.my-feed-tray--loyalty');
    $container.closest('.drawer-formatter__content').css('min-height','auto');
    var persistentCookie = Drupal.ELB.getJSONCookie('persistent_user_cookie');
    // console.log('/// persistentCookie ///');
    // console.log(persistentCookie);
    var newsletterOptin = persistentCookie.pc_email_optin - 0;
    var hasLoyalty = persistentCookie.is_loyalty_member - 0;
    var signedIn = site.userInfoCookie.getValue('signed_in') - 0;
    if ( hasLoyalty ) {
      $container.removeClass('anon');
      $container.addClass('auth loyal');
      var points = persistentCookie.points || 0;
      var pointsClass = 'my-feed-tray--' + points;
      var level = persistentCookie.loyalty_level || 1;
      var levelClass= 'level__' + level;
      var levelName = persistentCookie.loyalty_level_name || '';
      levelName = levelName.replace(/\+/g,' ');
      var nextLevelPoints = persistentCookie.points_to_next_level || 0;
      var nextLevel = persistentCookie.next_level || 2;
      var nextLevelName = persistentCookie.next_level_name || '';
      nextLevelName = nextLevelName.replace(/\+/g,' ');
      var levelSeparator = $container.find('.level-separator').html() + ' ';
      var levelText = $container.find('.level-text--2').html() + ' ';
      var levelDisplay = level + levelSeparator + levelName;
      var nextLevelDisplay = levelText + nextLevel + levelSeparator + nextLevelName;
      var firstName = persistentCookie.first_name || '';
      firstName = firstName.replace(/\+/g, ' ');

      $container.addClass(levelClass);
      $container.addClass(pointsClass);
      $container.find('.first-name').html('&nbsp;' + firstName);
      $container.find('.point-value').html(points);
      $container.find('.current-level').html(levelDisplay);
      $container.find('.next-level').html(nextLevelDisplay);

      if (nextLevelPoints && nextLevelPoints > 0) {
        $container.find('.next-level-points').html(nextLevelPoints);
      } else {
        $container.find('.my-feed-loyalty__status-next').hide();
      }
    } else if ( signedIn ) {
      $container.removeClass('anon');
      $container.addClass('auth');
    }

    var $newsletterCheckbox = $('.my-feed-loyalty__checkbox-container',$container);
    if(newsletterOptin){
      $newsletterCheckbox.hide();
      $container.addClass('my-feed-tray--newsletter');
    }

    var loyaltyFeedForm = $('#my-feed-loyalty__form');
    $(loyaltyFeedForm).find('.js-my-feed-loyalty__form-submit').bind('click', function(e){
      e.preventDefault();

      // we want to get all the fields in the form because 'serialize' encodes potentially bad emails and decode doesn't decode characters like '+' properly
      var fields = [
        'PC_EMAIL_ADDRESS',
        'LOYALTY_ACTIVE_FLAG',
        'ACCEPTED_LOYALTY_TERMS',
        'PC_EMAIL_PROMOTIONS',
        'PC_EMAIL_PROMOTIONS_PRESENT',
        '_SUBMIT'
      ];

      var paramObj = {};

      // loop through all the fields and get the values
      $.each(fields, function(index, value){
          var formField = $("#my-feed-loyalty__form input[name=" + value + "]");

          // for the unchecked PC_EMAIL_PROMOTIONS we want to send empty strings to backend for processing
          if(value == "PC_EMAIL_PROMOTIONS" && formField.is(':checkbox') && !formField.prop('checked')) {
              //paramObj[value] = '';
              paramObj[value] = 0;
          }

          else {
              paramObj[value] = formField.val();
          }
      });

      var csrftoken = $("#my-feed-loyalty__form input[name=_TOKEN]").val() || $.cookie('csrftoken');
      if (csrftoken) {
        paramObj['_TOKEN'] = csrftoken;
      }

      generic.jsonrpc.fetch({
        method: 'rpc.form',
        params: [paramObj],
        onSuccess: function(jsonRpcResponse) {
          $(document).triggerHandler('email_signup.success', [jsonRpcResponse]);
        },
        onFailure: function(jsonRpcResponse) {
          var errorObjectsArray = jsonRpcResponse.getMessages();
          var errListNode = $('#form--errors--my-feed-loyalty__form');
          generic.showErrors(errorObjectsArray, errListNode, loyaltyFeedForm);
        }
      });
    });

    // already logged in
    var $joinBtn = $('.loyalty-offer__join',$container);
    $joinBtn.click(function(event) {
      event.preventDefault();

      if($container.hasClass('anon')){
        if(Drupal.settings.globals_variables.loyalty_join_now_btn == 1){
          // send them to create account
          window.location.href = Drupal.settings.globals_variables.account_enroll_url;
        }
        else{
          // anon user, non loyal > show overlay
          Drupal.behaviors.ELB_loyalty_offer.showSignupFormNow();
        }
      }else{
        // recognized user, non loyal
        var params = {};
        params['_SUBMIT'] = 'loyalty_join';
        params['LOYALTY_ACTIVE_FLAG'] = '1';

        var require_loyalty_terms_acceptance = 0;
        var field = $('#my-feed-loyalty__form input[name="_SUBMIT"]'), undefined;
        if (field != undefined && field.length > 0) {
          require_loyalty_terms_acceptance = 1;
          params['_SUBMIT'] = field.val();
          params['profile_loyalty_join'] = '1';
          params['PC_EMAIL_ADDRESS'] = site.userInfoCookie.getValue('email');
          //params['LOYALTY_EMAIL_PROMOTIONS'] = '1';
          field = $('#my-feed-loyalty__form input[name="ACCEPTED_LOYALTY_TERMS"]'), undefined;
          if (field != undefined && field.length > 0) {
            var isUncheckedBox = field.is(':checkbox') && !field.prop('checked');
            params['ACCEPTED_LOYALTY_TERMS'] = isUncheckedBox ? '' : field.val();
          }
        }

        if ($.cookie('csrftoken')) {
          params['_TOKEN'] = $.cookie('csrftoken');
        }

        generic.jsonrpc.fetch({
          method: 'rpc.form',
          params: [params],
          onSuccess: function(jsonRpcResponse) {
            // send them to loyalty landing
            //window.location.href = "/account/loyalty/index.tmpl"
            if (require_loyalty_terms_acceptance) {
              var userinfo = {};
              userinfo. registered_user= 1;
              $(document).triggerHandler('join_loyalty.success', userinfo);
            } else {
              $(document).triggerHandler('email_signup.success', [jsonRpcResponse]);
            }
          },
          onFailure: function(jsonRpcResponse) {
            // display error
            console.log('error in joining');
            if (require_loyalty_terms_acceptance) {
              var messages = jsonRpcResponse.getMessages();
              $.each(messages, function(i, message) {
                if (message.key == "required.accepted_loyalty_terms.loyalty_email_signup") {
                  var $formContainer = $('.loyalty-offer__terms');
                  var $input = $('.text--checkbox-label', $formContainer);
                  $input.addClass('error');
                }
              });
            }
          }
        });
      }
    });

    // rollover for special offers link
    var $specialOffersLink = $('.page-sticky-footer__special_offers__link');
    var $myFeedTray = $('.my-feed-tray--loyalty');
    $specialOffersLink.mouseenter(function() {
      console.log('enter');
      site.drawers.open($('.my-feed-drawer .drawer-formatter__trigger'), $myFeedTray.parents('.drawer-formatter__content'), 300, false);
    });


    var $authTray = $('.my-feed-tray__auth', context);
    if (!$authTray.length) return;

    var $trigger = $( '.my-feed-drawer .drawer-formatter__trigger', context );
    $trigger.on('click', function() {
      var myWindow = window.open("/account/beauty_feed.tmpl", "_self");
    });

    // Sign out link returns you to current page and expands special offers (see
    // special_offers.js for cookie handling)

    // Drawers need to be initialized before we can bind events to them:
    site.drawers.init(context);


    // USE TO SHOW HIDE ANON/AUTH
    // if (typeof site != 'undefined' && typeof site.userInfoCookie != 'undefined') {
    //   var firstName = site.userInfoCookie.getValue('first_name') || persistentCookie.first_name;
    //   var firstTime = !!persistentCookie.first_time;
    //   if (!firstName) return;
    //   // var $triggermust have first name (logged on? or just persistant) and not be first time
    //   if (!firstTime) {
    //     $('.my-feed-tray__anon', context).hide();
    //     $('.my-feed-tray__auth', context).show();
    //   }
    //   var $template = $('.my-feed-summary--auth'); //grab section
    //   var rendered = Mustache.render( $template.html(), { first_name: firstName } ); //insert name
    //   $template.html( rendered ); // re-render
    // }

  }
};

})(jQuery);
