
var generic = generic || {};
var site = site || {};

(function ($) {

site.countryChooser = {
  templateContainer : $('.country-chooser'),

  initCountryChooser : function() {
    var containerNode = this.templateContainer;
    if (!containerNode) {
      return null;
    }

    var $countrySelector = $('.country-chooser__selector');
    var $countryMenu = containerNode.find('.menu');

    // Initialize the country chooser
    $countrySelector.click(function(e) {
      e.preventDefault();
      $(this).addClass('active');
      var h = $countrySelector.outerHeight(true);
      $countryMenu.css({ 'bottom': h + 'px' }).stop().delay(100).slideToggle(300, function() {
        $countryMenu.is(':visible') || $countrySelector.removeClass('active');
        $countryMenu.css({ 'overflow': 'auto' });
      });
      return !1;
    });

    $countrySelector.bind('clickoutside', function(e) {
      $countryMenu.slideUp(200);
      $(this).removeClass('active');
    });
  }
}

Drupal.behaviors.countryChooserV1 = {
  attach: function (context, settings) {
    site.countryChooser.initCountryChooser();
  }
};

})(jQuery);
