
var site = site || {};
site.client = site.client || {
  cookieName : 'client.isMobile',
  doMobileRedirect : (typeof site.doMobileRedirect !== 'undefined') ? site.doMobileRedirect : true,
  subdomain : window.location.hostname.replace(
    /^.*(esteelauder.*\.)/, function(m, $1) { return $1; }
  ),
  isMobileRegex : /(iPhone|iPod|Android|BlackBerry|BB)/,
  isTabletRegex : /(Tablet|tablet|ipad)|(android(?!.*mobile))/i
};

site.client.getDeviceCookie = function() {
  var c = document.cookie;
  var matches = c.match(new RegExp("(?:^|; )" + site.client.cookieName + "=([^;]*)"));
  return (matches) ? parseInt(decodeURIComponent(matches[1])) : undefined;
};

site.client.clearDeviceCookie = function() {
  document.cookie = site.client.cookieName + '=; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/;';
};

site.client.setDeviceCookie = function(isMobile) {
  document.cookie = site.client.cookieName + '=' + isMobile + '; domain=.' + site.client.subdomain + '; path=/;';
};

site.client.getDeviceType = function() {
  return site.client.isMobile ? 'mobile' : 'desktop';
};

site.client.setDevice = function(isMobile) {
  site.client.isMobile = isMobile;
  site.client.setDeviceCookie(site.client.isMobile);
  site.client.redirect();
}

site.client.redirect = function() {
  // disable redirect, akamai is handling it
  if (!site.client.doMobileRedirect) {
    return;
  }

  var hostname = window.location.hostname;
  var href = window.location.href;
  var preDomain = hostname.match(/^(m|www)(tmp)?\./);
  var mobileDomain = ( preDomain && preDomain[1] == "m" );
  var isTmp = ( preDomain && preDomain[2] == "tmp" );

  // on a mobile domain without a mobile device -> redirect
  if(mobileDomain && !site.client.isMobile) {
    // If this was mtmp, redirect to wwwtmp.
    // Else (was "m." something) just strip the "m."
    var newHostname = isTmp ? hostname.replace(/^mtmp\./, 'wwwtmp.') : hostname.replace(/^m\./, '');
    window.location = href.replace(hostname, newHostname);
  }

  // on a NONmobile domain with a mobile device -> redirect
  else if(!mobileDomain && site.client.isMobile) {
    // If this was wwwtmp, our redirect should be to mtmp.
    // In any case, strip leading www or wwwtmp, if any, and then prepend our hostname with the right mobile prefix.
    var wwwStr = isTmp ? 'wwwtmp.' : 'www.';
    var mStr = isTmp ? 'mtmp.' : 'm.';
    var newHostname = mStr + hostname.replace(wwwStr, '');
    window.location = href.replace(hostname, newHostname);
  }
};

site.client.controls = function() {
  $('.toggle-mobile[data-ismobile]').each(function() {
    $(this).bind('click', function(e) {
      var isMobile = $(this).attr('data-ismobile')
      site.client.setDevice(parseInt(isMobile));
      return false; // yes false
    }).show();
  });
};
site.client.init = function() {
  var isMobile = site.client.getDeviceCookie();
  // no device cookie, read from useragent
  if(typeof(isMobile) === 'undefined') {
    isMobile = navigator.userAgent.match( site.client.isTabletRegex ) ? 0 : (navigator.userAgent.match( site.client.isMobileRegex ) ? 1 : 0);
  }
  // store + redirect
  site.client.setDevice(isMobile);
}();
