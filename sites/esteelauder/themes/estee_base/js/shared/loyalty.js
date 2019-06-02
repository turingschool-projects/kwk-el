
(function($) {

window.site = site || {};
site.loyalty = site.loyalty || {};

site.loyalty = {
  multiImg : function(context){
    if( $('.loyalty_multi_image_tout_right').length ){
      var i=0;
      var random;
      var sequence = [];
      var position = 0;
      var time_per_image = $('[data-time_per_img]', context).attr('data-time_per_img');
      while ( i < $('.loyalty_multi_image_tout_right img').size() ){
        random = Math.floor( Math.random() * $('.loyalty_multi_image_tout_right img', context).size() )
        if ( !$('.loyalty_multi_image_tout_right img', context).eq(random).hasClass('processed') ){
          $('.loyalty_multi_image_tout_right img', context).eq(random).addClass('processed');
          sequence.push(random);
          i++;
        }
      }
      function rotate_img() {
        position = (position === sequence.length-1) ? 0 : position+1;
        $('.loyalty_multi_image_tout_right img').addClass('hidden');
        $('.loyalty_multi_image_tout_right img').eq(sequence[position]).removeClass('hidden');
        setTimeout(rotate_img, time_per_image * 1000);
      }
      rotate_img();
    }
  },
  enrollmentBtn : function(context) {
    var $joinBtn = $('.js-join-popup',context);
    $joinBtn.click(function(event) {
      event.preventDefault();
      var signedIn = site.userInfoCookie.getValue('signed_in') - 0;
      // just submit the form
      if(signedIn) {
        if(Drupal.settings.globals_variables.loyalty_join_now_btn == 1){
          // send them to account landing
          window.location.href = Drupal.settings.globals_variables.loyalty_enroll_url;
          return false;
        }
        var params = {};
        params['_SUBMIT'] = 'loyalty_join';
        params['LOYALTY_ACTIVE_FLAG'] = '1';

        var require_loyalty_terms_acceptance = 0;
        var field = $('.loyalty_join_signin input[name="_SUBMIT"]'), undef;
        if (field != undef && field.length > 0) {
          require_loyalty_terms_acceptance = 1;
          params['_SUBMIT'] = field.val();
          params['profile_loyalty_join'] = '1';
          params['PC_EMAIL_ADDRESS'] = site.userInfoCookie.getValue('email');
          params['LOYALTY_EMAIL_PROMOTIONS'] = '1';
          field = $('.loyalty_join_signin input[name="ACCEPTED_LOYALTY_TERMS"]'), undef;
          if (field != undef && field.length > 0) {
            var isUncheckedBox = field.is(':checkbox') && !field.prop('checked');
            params['ACCEPTED_LOYALTY_TERMS'] = isUncheckedBox ? '' : field.val();
          }
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
            console.log('error in joining');
            if (require_loyalty_terms_acceptance) {
              var messages = jsonRpcResponse.getMessages();
              $.each(messages, function(i, message) {
                if (message.key == "required.accepted_loyalty_terms.loyalty_email_signup") {
                  var $formContainer = $('.loyalty_join_signin');
                  var $input = $('.text--checkbox-label', $formContainer);
                  $formContainer.next('.error').remove();
                  $formContainer.after('<div class="error">'+ message.text +'</div>');
                  $input.addClass('error');
                }
              });
            }
          }
        });
      }
      // show a popup so the user can enter their email
      else {
        if(Drupal.settings.globals_variables.loyalty_join_now_btn == 1){
          // send them to create account
          window.location.href = Drupal.settings.globals_variables.account_enroll_url;
        }
        else{
          Drupal.behaviors.ELB_loyalty_offer.showSignupFormNow();
        }
      }
    });
  },
  signInBtn : function(context) {
    var $signInBtn = $('.js-sign-in-popup',context);
    $signInBtn.click(function(event) {
      event.preventDefault();
      // trigger sign in button or send to signin
      if( $('.device-pc').length ) {
        $('.page-utilities__account-button')[0].click();
      } else {
        $.cookie("showsignin", 1);
        window.location.href = '/account/signin.tmpl';
      }
    });
  },
  checkLoyaltyPageAccess : function() {
    // a check table of products and the minimum tier needed to access the product
    // example: 36143:3 (product 36143 is restricted to tier 3 members)
    var checkTable = {};

    //product/689/36143/Product-Catalog/Skincare/By-Category/Repair-Serums/New-Dimension/Shape-Fill-Expert-Serum
    var url = window.location.pathname;
    var pathArray = window.location.pathname.split( '/' );
    // this will return 36143
    var product = pathArray[3];

    return checkTable[product] ? checkTable[product] : 0;
  },
  loyaltyNavLinks : function() {
    window.scroll(0,0);
    $('.account-utilities__account-details-elist a').each(function(index) {
      var ele = this;
      if ((window.location.hash != "") && (this.href.indexOf(window.location.hash) > -1)) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
  }
};

Drupal.behaviors.ELB_loyalty = {
  attach: function(context, settings) {
    var self = this;
    //site.loyalty();
    $(window).on('hashchange',function(){
      var pageMainNode = $('.page-main')
      if(pageMainNode.hasClass('loyalty-account-page')) {
        site.loyalty.loyaltyNavLinks();
      };
    }).trigger('hashchange');
  }
};

})(jQuery);
