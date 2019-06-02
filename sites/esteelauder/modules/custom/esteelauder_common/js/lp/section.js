
var site = site || {};
var generic = generic || {};
var lpTag = lpTag || {};
if (window.location === window.parent.location) {
  lpTag.section = [Drupal.settings.lp.site_name];

  if (typeof Drupal.settings.lp !== 'undefined') {
    var getMobileOperatingSystem = function() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/windows phone/i.test(userAgent)) {
        return 'Windows';
      } else if (/android/i.test(userAgent)) {
        return 'Android';
      } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'iOS';
      } else {
        return 'unknown';
      }
    };
    var deviceName = getMobileOperatingSystem().toLowerCase();
    $('.js-' + deviceName).removeClass('hidden');
    lpTag.section.push('EL_' + deviceName);
  }

  //Trigger the loyalty offer when the user ended up the livechat
  lpTag.events.bind({
    eventName: 'state',
    appName: 'lpUnifiedWindow',
    func: function(chat) {
      if (chat.state === 'ended') {
        site.userInfoCookie = site.userInfoCookie || {};
        site.userInfoCookie.getValue = site.userInfoCookie.getValue || function() {
          return '';
        };

        var signedIn = parseInt(site.userInfoCookie.getValue('signed_in'));
        var isLoyaltyMember = parseInt(site.userInfoCookie.getValue('is_loyalty_member'));
        if (signedIn && isLoyaltyMember) {
          var paramObj = {'offer_code': 'lyl_vba_chat', 'do_not_defer_messages': 1};
          generic.jsonrpc.fetch({
            method: 'offers.apply',
            params: [paramObj],
          });
        }
      }
    },
    triggerOnce: false
  });
}
