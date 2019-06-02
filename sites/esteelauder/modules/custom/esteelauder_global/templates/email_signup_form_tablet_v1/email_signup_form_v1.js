
var generic = generic || {};
var site = site || {};

(function ($) {

site.emailSignup = {
  templateContainer: $(),

  initEmailSignup : function() {
    var $emailContainerNodes = this.templateContainer;
    if (!$emailContainerNodes.length) {
      return null;
    }

    $emailContainerNodes.each(function() {
      var $emailContainerNode = $(this);
      var $emailForm    = $emailContainerNode.is('form') ? $emailContainerNode : $('form', $emailContainerNode);
      var $emailSuccess = $('.email-signup__success', $emailContainerNode);
      var $emailError   = $('.email-signup__error', $emailContainerNode);
      var $emailInput   = $('input[name="PC_EMAIL_ADDRESS"]', $emailContainerNode);
      var isMobile = !$('body').hasClass('device-pc');
      var colorboxSettings = {
        html: $emailSuccess.html(),
        width: '600px',
        height: '600px',
        className: 'email_signup_sucess_popup'
      };
      if (isMobile) {
        colorboxSettings.width = '100%';
      }

      $emailForm.once('email-signup__form').submit(function(submitEvt) {
        submitEvt.preventDefault();
        $emailSuccess.add($emailError).addClass('hidden');
        $emailInput.removeClass('error');

        // Transform string into array of form elements
        var params = {};
        $.each($emailForm.serializeArray(), function(index, kv) {
          params[kv.name] = kv.value.replace('undefined', '').replace('%40', '@');
        });
          if ($.cookie('csrftoken')) {
            params['_TOKEN'] = $.cookie('csrftoken');
          }
        var form = this;
        // Send the data via a json rpc call
        generic.jsonrpc.fetch({
          method : 'rpc.form',
          params: [params],
          onSuccess:function(jsonRpcResponse) {
            //1st condition satisfies in promotions page where as in footer it has three levels so introduced the OR condition
            if (($(form).parent().parent().parent().parent().hasClass('content')) || ($(form).parent().parent().parent().hasClass('content'))) {
              // Only show the success message if the email_signup.success handlers haven't already done so
              if ($('#colorbox').css('display') != 'block') {
                $.colorbox(colorboxSettings);
              }
            } else {
              $.when(
                $(document).triggerHandler('email_signup.success', [jsonRpcResponse])
              ).then(function() {
                // Only show the success message if the email_signup.success handlers haven't already done so
                if ($('#colorbox').css('display') != 'block') {
                  $.colorbox({ html: $emailSuccess.html() });
                }
              });
            }
            $('.email_signup_sucess_popup .email-signup__success-text').on('click', function() {
              $.colorbox.close();
            });
          },
          onFailure: function(jsonRpcResponse){
            $emailError.removeClass('hidden');
            $emailInput.addClass('error');
          }
        });
      });
    });
  }
};

Drupal.behaviors.emailSignupFormV1 = {
  attach: function (context, settings) {
    site.emailSignup.templateContainer = $('.email-signup', context);
    site.emailSignup.initEmailSignup();
  }
};

})(jQuery);
