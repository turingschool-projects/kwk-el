
(function ($) {

  Drupal.behaviors.elc_common = {
    attach: function (context, settings) {
      $('.ajax-popover', context).colorbox({ maxWidth: '100%', maxHeight: '100%', href: function() { return this.href + ' #main'; } });
    }
  };

})(jQuery);

