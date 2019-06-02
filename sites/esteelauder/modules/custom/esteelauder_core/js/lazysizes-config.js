
var lazySizesConfig = lazySizesConfig || {};

(function() {
  // Options can be set by declaring a global configuration option object named lazySizesConfig.
  // This object must be defined before the lazysizes script.

  document.addEventListener('lazybeforeunveil', function(e) {
    var isMobile = false;
    if (typeof site.client !== 'undefined') {
      isMobile = site.client.isMobile;
    }
    var bg = e.target.getAttribute('data-bg');
    if (isMobile && typeof e.target.getAttribute('data-bg-mobile') !== 'undefined') {
      bg = e.target.getAttribute('data-bg-mobile');
    }
    if (bg) {
      e.target.style.backgroundImage = 'url(' + bg + ')';
    }
  });
})();
