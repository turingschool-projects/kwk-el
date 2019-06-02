
(function ($) {
  Drupal.behaviors.multi_use_homepage_formatter_v1 = {
    attach: function (context, settings) {
      $('.main-content', context).once('multi_use_homepage_formatter_v1', function () {

        $homeBlocks = $('.multi_use_homepage_module');
        $homeHeroBlocks = $('.multi_use_homepage_module').find('.homepage_module_wrapper');

        // home-block add anchor links for each block to our formatter
        if ($homeBlocks.length > 0) {
          $homeBlocks.each(function (e) {
            var linkid = $(this).find('.homepage_module_wrapper').attr("data-module"),
              $linkid = $(linkid),
              newanchor = '<a class="js-home-scrollto home-scrollto" href="#' + linkid + '" data-homeblock-id="' + linkid + '"></a>',
              $appendedlink = $('.js-home-scrollto[data-homeblock-id=' + linkid + ']');
            // add anchors
            // only if they are not already there
            if (!$appendedlink.length) {
              $('#home-formatter__scroller').append(newanchor);
            }
            // waypoints for custom directions so we can account for bugs in offset
            //down
            $(this).waypoint(function (direction) {
              if (direction === "down") {
                $('.js-home-scrollto').removeClass('block-active');
                $('.js-home-scrollto[data-homeblock-id=' + linkid + ']').addClass('block-active');
              }
            }, {
              offset: 0
            });
            // up
            $(this).waypoint(function (direction) {
              if (direction === "up") {
                $('.js-home-scrollto').removeClass('block-active');
                $('.js-home-scrollto[data-homeblock-id=' + linkid + ']').addClass('block-active');
              }
            }, {
              offset: '-10'
            });

          });
        }

        // dot nav click function
        $('.js-home-scrollto').on('click', function (event) {
          event.preventDefault();
          var scrollLink = $(this).attr('href');
          scrollLink = scrollLink.replace('#', '.');
          $scrollLink = $(scrollLink);
          var anchorOffset = $scrollLink.offset().top;
          $('html,body').animate({
            scrollTop: anchorOffset
          }, 800);
        });
      });
    }
  };
})(jQuery);
