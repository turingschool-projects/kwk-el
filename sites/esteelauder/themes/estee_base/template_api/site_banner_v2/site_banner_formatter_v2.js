
var site = site || {};

(function($, Drupal) {
  Drupal.behaviors.sitewideBannerV2 = {

    // Resets height at slider init.
    pageHeaderHeight: function(context) {
      var $pageHeader, $pageWrapper, defaultPadding, headerHeight;

      $pageHeader = $('.page-header', context);
      $pageWrapper = $('.page-wrapper', context);
      defaultPadding = $pageWrapper.css('padding-top');
      headerHeight = $pageHeader.css('height');

      // due to text wrap, the header
      // padding sometimes needs an update
      if (headerHeight !== defaultPadding) {
        $pageWrapper.css('padding-top', headerHeight);
      }
    },
    attach: function(context) {
      var $siteBanner, $pageBranding, $slider_content, $guest_content, $loyalty_content, $nonLoyalty_content, $close,
          privateBrowsing, isSignedUser, animationTime, user_info, mapObj, maxHeight, pageBrandingPos;

      var self = this;
      // disable for checkout
      if ($('body').hasClass('checkout')) {
        return;
      }

      // Basic tests to make sure we're not in private browsing like on iOS
      try {
        sessionStorage.setItem('sessionTestVar', 1);
        sessionStorage.removeItem('sessionTestVar');
      } catch (err) {
        privateBrowsing = true;
      }
      if (privateBrowsing) {
        return;
      }

      // Starting point
      $pageBranding = $('.page-branding', context);
      $siteBanner = $('.js-site-banner-formatter', context);
      $slider_content = $('.js-site-banner-formatter-slider', $siteBanner);
      $guest_content = $('.js-guest', $slider_content);
      $loyalty_content = $('.js-loyalty', $slider_content);
      $nonLoyalty_content = $('.js-non-loyalty', $slider_content);
      $close = $('.js-close-site-banner-formatter', $siteBanner);

      isSignedUser = site.userInfoCookie.getValue('signed_in') - 0;
      animationTime = 400;
      pageBrandingPos = $pageBranding.css('top');
      Drupal.ELB.loadPersistenUserCookie();
      user_info = Drupal.ELB.getJSONCookie('persistent_user_cookie');
      if (user_info) {
        user_info.first_name = (user_info.first_name || '').replace(/\+/g, ' ');
        user_info.loyalty_level_name = (user_info.loyalty_level_name || '').replace(/\+/g, ' ');
        mapObj = {
          '::user::': truncate(user_info.first_name, 17),
          '::current_level::': user_info.loyalty_level_name,
          '::points::': user_info.points
        };
        $loyalty_content.add($nonLoyalty_content).html(function() {
          return $(this).html().replace(/::user::|::current_level::|::points::/gi, function(matched) {
            return mapObj[matched];
          });
        });
        if (!!(parseInt(user_info.is_loyalty_member) - 0)) {
          $nonLoyalty_content.remove();
          $guest_content.remove();
        } else if (isSignedUser) {
          $loyalty_content.remove();
          $guest_content.remove();
        } else {
          $loyalty_content.remove();
          $nonLoyalty_content.remove();
        }
      }

      // Should we show our banner?
      if (!sessionStorage.getItem('banner_viewed') && !$('html').hasClass('site-banner__is-open')) {
        $siteBanner.removeClass('hidden');
        $('html').addClass('site-banner__is-open');
        maxHeight = Math.max.apply(null, $slider_content.find('.js-site-banner-slide').map(function() {
          return $(this).height();
        }).get());
        $pageBranding.css('top', maxHeight + 'px');
        $slider_content.css('height', maxHeight);
        $slider_content.find('.js-site-banner-slide').css('height', maxHeight);
        self.pageHeaderHeight(context);
        if ($slider_content.find('.js-site-banner-slide').children().length > 1) {
          setInterval(function() {
            // select the first child each time since the order changes.
            $slider_content.find('.js-site-banner-slide').first().fadeOut(function() {
              $(this).appendTo($(this).parent()).css({overflow: '', display: ''});
              $(this).css('height', maxHeight);
            });
          }, 5000);
        }
      }

      function truncate(firstName, limit) {
        return firstName.length < limit ? firstName : firstName.substring(0, limit) + '...';
      }

      // Close the banner for the session
      $close.once().on('click', function() {
        sessionStorage.setItem('banner_viewed', 1);
        $pageBranding.animate({top: pageBrandingPos}, animationTime);
        $siteBanner.slideUp(animationTime, function() {
          $('html').removeClass('site-banner__is-open');
          $(document).trigger('siteBanner.close');
          self.pageHeaderHeight(context);
        });
      });
    }
  };
})(jQuery, Drupal);
