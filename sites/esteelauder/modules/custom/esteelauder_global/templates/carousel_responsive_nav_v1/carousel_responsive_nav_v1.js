
/**
 * Header nav responsive carousel trigger and behavior
 * Trigger slick, respond to opening/closing of top expand-o nav container
 */
(function($) {
  Drupal.behaviors.carousel_responsive_nav = {
    attach: function(context, settings) {
      var $carousel = $('.responsive-carousel-nav');

      // trigger flexslider on *just* our top nav carousel(s)
      $('.flexslider', $carousel).flexslider({
        animation: "slide",
        minItems: 1,
        maxItems: 5,
        controlNav: false,
        move: 5,
        slideshow: false,
        animationLoop: true,
        itemWidth: 173,
        itemMargin: 0, // leave this as ZERO for math
        start: centerCarousel
      });

      // respond to opening nav
      $(document).on('navOpen', function(event, category) {
        $carousel.removeClass('responsive-carousel-nav--visible');
        $('.responsive-carousel-nav[data-menucat="' + category + '"]').addClass('responsive-carousel-nav--visible');
      });

      // respond to closing nav
      $(document).on('navClose', function(event) {
        $carousel.removeClass('responsive-carousel-nav--visible');
      });

      // Quick function to center a variable slide carousel
      // alternate styles are applied
      // resize triggered
      function centerCarousel(slider) {
        if (slider.pagingCount == 1) {
          slider.addClass('js-flex-centered');
          slider.resize();
        }

      }

    }
  };
})(jQuery);
