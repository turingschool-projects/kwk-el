
<!-- TEALIUM Loading script asynchronously -->
window.loadTealium = function(a, b, c, d) {
  var tealium_profile_by_locale = Drupal.settings.analytics.tealium_profile_by_locale;
  var currentProfile = Drupal.settings.analytics.tealium_profile;

  if (tealium_profile_by_locale) {
    var localeMatch = document.cookie.match(new RegExp('(?:^|; )LOCALE=([^;]*)'));
    if (localeMatch && localeMatch.length !== 0) {
      var locale = localeMatch[1];
      currentProfile = tealium_profile_by_locale[locale];
    }
  }

  a = '//tags.tiqcdn.com/utag/esteelauder/' + currentProfile + '/' + Drupal.settings.analytics.tealium_env + '/utag.js';
  b = document; c = 'script'; d = b.createElement(c); d.src=a; d.type = 'text/java' + c; d.async = true;
  a = b.getElementsByTagName(c)[0]; a.parentNode.insertBefore(d, a);
  d.handlerFlag = 0; d.onreadystatechange = function() { if ((this.readyState === 'complete' || this.readyState === 'loaded') && !d.handlerFlag) { d.handlerFlag = 1; site.elcEvents.dispatch('tealium:loaded'); } }; d.onload = function() { if (!d.handlerFlag) { d.handlerFlag = 1; site.elcEvents.dispatch('tealium:loaded'); } };
}
