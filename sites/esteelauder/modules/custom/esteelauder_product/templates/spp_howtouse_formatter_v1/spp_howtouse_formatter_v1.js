
(function($) {
  Drupal.behaviors.spp_howtouse_formatter_v1 = {
    equalHeights: function($elem, px) {
      var currentTallest = 0;
      $elem.each(function() {
        if ($(this).height() > currentTallest) { currentTallest = $(this).height(); }
        if (!px && Number.prototype.pxToEm) currentTallest = currentTallest.pxToEm(); //use ems unless px is specified
      });
      $elem.each(function() {
        $(this).css({'min-height': currentTallest});
      });
    },
    attach: function(context, settings) {
      var self = this;
      self.equalHeights($('.spp_howtouse__header .text-promo', context));
      self.equalHeights($('.spp_howtouse__product-details', context));

      // show the spp nav link to this component
      // when we load
      if ($('#spp-howtouse-formatter', context).length) {
        $('.spp-nav-howtouse', context).show().removeClass('hidden');
      }
    }
  };

})(jQuery);
