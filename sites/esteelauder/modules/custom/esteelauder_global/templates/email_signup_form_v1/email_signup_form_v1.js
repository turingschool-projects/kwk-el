
var generic = generic || {};
var site = site || {};

(function($) {
  site.emailSignup = {
    templateContainer: $(),

    initEmailSignup: function() {
      var $emailContainerNodes = this.templateContainer;
      if (!$emailContainerNodes.length) {
        return null;
      }

      $emailContainerNodes.each(function() {
        var $emailContainerNode = $(this);
        var $emailForm = $emailContainerNode.is('form') ? $emailContainerNode : $('form', $emailContainerNode);
        var $emailSuccess = $('.email-signup__success', $emailContainerNode);
        var $emailError = $('.email-signup__error', $emailContainerNode);
        var $emailInput = $('input[name="PC_EMAIL_ADDRESS"]', $emailContainerNode);
        var errorList = $('#email-signup__errors', $emailContainerNode);

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
          $emailForm.find('label').removeClass('error');
          $emailForm.find('input').removeClass('error');

          // Transform string into array of form elements
          var params = {};
          $.each($emailForm.serializeArray(), function(index, kv) {
            params[kv.name] = kv.value.replace('undefined', '').replace('%40', '@');
          });

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
            method: 'rpc.form',
            params: [params],
            onSuccess: function(jsonRpcResponse) {
            //1st condition satisfies in promotions page where as in footer it has three levels so introduced the OR condition
              if ($(form).parent().parent().parent().parent().hasClass('content') || $(form).parent().parent().parent().hasClass('content')) {
              // Only show the success message if the email_signup.success handlers haven't already done so
                if ($('#colorbox').css('display') !== 'block') {
                  $.colorbox(colorboxSettings);
                }
              } else {
                $.when(
                  $(document).triggerHandler('email_signup.success', [jsonRpcResponse])
                ).then(function() {
                // Only show the success message if the email_signup.success handlers haven't already done so
                  if ($('#colorbox').css('display') !== 'block') {
                    $.colorbox({ html: $emailSuccess.html() });
                  }
                });
              }
              $('.email_signup_sucess_popup .email-signup__success-text').on('click', function() {
                $.colorbox.close();
              });
            },
            onFailure: function(jsonRpcResponse) {
              var error = jsonRpcResponse.getError();
              var error_message = jsonRpcResponse.getMessages();
              $emailError.removeClass('hidden');
              generic.showErrors(error_message, errorList, $emailForm);
            }
          });
        });
      });
    },

    gdprRemInfoMessageBox: function() {
      if ($('.info-msg-gdpr').get(0)) {
        $('.info-msg-gdpr').remove();
      }
    },

    gdprSetInfoBoxPosition: function(infoLink, infoMessageBox, infoMsgArrow, isMobile) {
      var infoLinkTop = infoLink.offset().top + infoLink.height() + infoMsgArrow.outerHeight(true);
      var infoLinkLeft = infoLink.offset().left;
      var infoMsgMaxWidth = parseInt(infoMessageBox.css('max-width').replace('px', ''));
      var infoMsgArrowMidPoint = infoMsgArrow.outerWidth(true)/2;

      if (isMobile || navigator.userAgent.match(/iPad/)) {
        // This is the gap between popup and page in mobile. Ideal is 10px.
        var popupLeftPosMobile = 10;
        infoMsgArrow.css({
          left: (infoLinkLeft - infoMsgArrowMidPoint) + 'px'
        });
        infoLinkLeft = popupLeftPosMobile;
      } else if ((infoMessageBox.outerWidth(true) === infoMsgMaxWidth) && ((infoLinkLeft + (infoMsgMaxWidth + 25)) > screen.width)) {
        infoLinkLeft = infoLinkLeft - infoMessageBox.innerWidth() + infoMsgArrowMidPoint;
        infoMsgArrow.addClass('top-right-arrow');
      }
      infoMessageBox.css({
        top: infoLinkTop + 'px',
        left: infoLinkLeft + 'px'
      });
    },

    gdprToolTip: function(context) {
      if (Drupal.settings.globals_variables.gdpr_compliant) {
        var isMobile = Unison.fetch.now().name === 'small';
        $('body', context).click(function(e) {
          if (e.target.className !== 'info-msg-gdpr' && e.target.className !== 'info-msg-gdpr__txt') {
            $('.info-msg-gdpr').addClass('hidden');
          }
          if ($('html').hasClass('colorbox_scroll')) {
            $('html').removeClass('colorbox_scroll');
          }
        });
        $('.info-link-gdpr', context).live('click', function(e) {
          e.preventDefault();
          var infoLink = $(e.currentTarget);

          if ($('#colorbox').is(':visible')) {
            $('html').addClass('colorbox_scroll');
          }
          site.emailSignup.gdprRemInfoMessageBox();

          $("<div class='info-msg-gdpr'><div class='info-msg-gdpr__arrow'></div><div class='info-msg-gdpr__txt'></div></div>").appendTo('body');
          var infoBoxEle = $('#' + infoLink.attr('message-in'));
          var infoMessageBox = $('.info-msg-gdpr');
          var infoMsgArrow = $('.info-msg-gdpr__arrow');

          $('.info-msg-gdpr__txt').html("<div class='info-msg-gdpr__close'>X</div>" + infoBoxEle.html());

          $('#cboxClose, .info-msg-gdpr__close', context).live('click', function(e) {
            e.stopPropagation();
            site.emailSignup.gdprRemInfoMessageBox();
            if ($('#colorbox').is(':visible')) {
              $('html').removeClass('colorbox_scroll');
            }
          });

          site.emailSignup.gdprSetInfoBoxPosition(infoLink, infoMessageBox, infoMsgArrow, isMobile);
          $(window).on('resize-debounced', site.emailSignup.gdprSetInfoBoxPosition(infoLink, infoMessageBox, infoMsgArrow, isMobile));

          $('.info-msg-gdpr__txt span').live('mousedown', function() {
            window.location = $(this).attr('data-url');
          });
        });
      }
    },

  };

  Drupal.behaviors.emailSignupFormV1 = {
    attach: function(context, settings) {
      site.emailSignup.templateContainer = $('.email-signup', context);
      site.emailSignup.initEmailSignup();
      site.emailSignup.gdprToolTip(context);
    }
  };
})(jQuery);
