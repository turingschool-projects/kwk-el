
(function($) {
  Drupal.behaviors.spp_howtouse_v1 = {
    attach: function(context, settings) {

      // quickshop on how to use
      if(!_.isUndefined(page_data['spp-howto'])){
        var qsData = page_data['spp-howto'].products;
        var $btn_quickshop = $('.button__quickshop--howtouse', context);
        $btn_quickshop.off('click').on('click', function(e) {
          e.preventDefault();
          var quickshopPID = $(this).attr('data-productid');
          var quickshopData = _.find(qsData, function(pr){ return pr.PRODUCT_ID == quickshopPID; });
          site.quickshop(quickshopData);
        });
      }

    } // attach
  };

})(jQuery);
