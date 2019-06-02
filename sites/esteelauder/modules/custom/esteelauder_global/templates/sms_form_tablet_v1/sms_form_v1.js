
var generic = generic || {};
var site = site || {};

(function ($) {

  site.sms = {

    initSMSForm : function() {
      // NB: the promotions page has 2 SMS forms on it but with the same class name
      // there is the promotions SMS for and the normal footer SMS form
      // so we loop here to bind to each individual form
      $('.sms-signup').each(function(){
        var smsContainerNode = $(this);

        var smsFormNode          = smsContainerNode.find('form'),
            smsSuccessNode       = smsContainerNode.find('.sms-signup__success'),
            smsErrorNode         = smsContainerNode.find('.sms-signup__error'),
            smsInputNode         = smsContainerNode.find("input[name='SMSPROMO_MOBILE_NUMBER']"), 
            smsPromtionsCheckbox = smsContainerNode.find("input[name='SMSPROMO_SMS_PROMOTIONS']"),
            smsCheckbox          = smsContainerNode.find('#sms-signup-checkbox');

            if(smsCheckbox.length > 1) {
              smsCheckbox.each(function(index, val) {
                 $(this).attr('id', 'sms-signup-checkbox'+index);
                 $(this).parent().find('.form-checkbox__label').attr('for','sms-signup-checkbox'+index);
              });
            }

        smsFormNode.once('mobile-signup-form').bind('submit', function(submitEvt) {
          submitEvt.preventDefault();
          smsSuccessNode.addClass('hidden');
          smsErrorNode.addClass('hidden');

          // Retrieve form data in querystring format
          var formSerial = smsFormNode.serialize();

          // Transform string into array of form elements
          var paramArr = formSerial.split("&");

          // Check phone number for extra chars.
          var smsNumberFind = _.findWhere(paramArr, "SMSPROMO_MOBILE_NUMBER");
          if (generic.env.isIE8) {
              smsNumberFind = _.filter(paramArr, function(item){return item.indexOf('SMSPROMO_MOBILE_NUMBER') >= 0;})[0];
          }
          var smsNumberIndex = _.indexOf(paramArr,smsNumberFind);
          var smsNumberArray = paramArr[smsNumberIndex].split('=');
          var smsNumber = smsNumberArray[1].toString();
          smsNumber = smsNumber.replace(/[^0-9]+/g, '');
          paramArr[smsNumberIndex] = "SMSPROMO_MOBILE_NUMBER="+smsNumber;

          paramStr = "";
          // Iterate through collection to transform form name/value into key/value properties of a literal object string.
          $.each(paramArr, function(index){
            paramStr += '"'+ this.split('=')[0] + '":"' + this.split('=')[1] + '",';
          });

          // Parse the string and create the literal object
          var params = eval("(" + "{"+paramStr.substring(0,(paramStr.length-1)).replace("undefined","").replace("%40","@")+"}" + ")");
          if ($.cookie('csrftoken')) {
            params._TOKEN = $.cookie('csrftoken');
          }
          //Send the data via a json rpc call
          generic.jsonrpc.fetch({
            method : 'rpc.form',
            params: [params],
            onSuccess:function(jsonRpcResponse) {
              $.colorbox({html:smsSuccessNode.html()});
              smsErrorNode.addClass('hidden');
              smsInputNode.removeClass('error');
            },
            onFailure: function(jsonRpcResponse){           
              var error = jsonRpcResponse.getError();
              var errorText = error.data.messages[0].text;
              smsErrorNode.text(errorText).removeClass('hidden');
              smsInputNode.addClass('error');
            }
          });       
        });      
      });
    } 
  }; 

  Drupal.behaviors.smsFormV1 = {
    attach: function (context, settings) {
      site.sms.initSMSForm();
      if (generic.env.isIE8) {
         $('.sms-signup__terms .sms-signup__checkbox').next().addClass('smsnotcheckedlabel');
         $('.sms-signup__terms').on('click','.sms-signup__checkbox', function(e){
           if($(this).next().hasClass('smsnotcheckedlabel')) {
             $(this).next().removeClass('smsnotcheckedlabel').addClass('smscheckedlabel');
             $(this).attr('checked', true);
             $(this).next().parent().html($(this).next().parent().html());
           }
           else {
             $(this).next().removeClass('smscheckedlabel').addClass('smsnotcheckedlabel');
             $(this).removeAttr('checked');
             $(this).next().parent().html($(this).next().parent().html());
           }
         });
       }
    }
  };

})(jQuery);
