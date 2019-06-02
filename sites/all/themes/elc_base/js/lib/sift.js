
var _sift = window._sift = window._sift || [];
(function ($) {

  var fraudscore = {
    includeFraudScoreTracking: function() {
      // User id should be the email being used.
      var puser_obj = $.parseJSON(getCookie('persistent_user_cookie'));
      var user_id = puser_obj && puser_obj.email ? puser_obj.email : '';
      var session_id = getCookie('ngglobal');
      var snippet_key = Drupal.settings.siftscience.js_snippet_key;

      _sift.push(['_setAccount', snippet_key]);
      _sift.push(['_setUserId', user_id]);
      _sift.push(['_setSessionId', session_id]);
      _sift.push(['_trackPageview']);
    }
  };

  var getCookie = function(cookieName) {
    var cookieValue = '';
    var beginIndex = 0;
    var endIndex = 0;
    var cookies = document.cookie;
    if (cookies.length > 0) {
      beginIndex = cookies.indexOf(cookieName + '=');
      if (beginIndex != -1) {
        beginIndex += cookieName.length + 1;
        endIndex = cookies.indexOf(';', beginIndex);
        if (endIndex == -1) {
          endIndex = cookies.length;
        }
        cookieValue = unescape(cookies.substring(beginIndex, endIndex));
      }
    }
    return cookieValue;
  };

  $(document).ready(function() {
    if (getCookie('csr_logged_in') !== 1) {
      fraudscore.includeFraudScoreTracking();
    }
  });

})(jQuery);
