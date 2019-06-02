
var generic = generic || {};
(function($) {
  Drupal.behaviors.ELBPC_nav = {
    attach: function(context) {
      var $block = $('.header-items', context);
      var $sectionPageNav = $('.page-navigation', context);
      var $sectionNav = $('.js-page-navigation-menu', context);
      var $menuRef = $('.menu-ref', $sectionNav);
      var $menuTitleTrigger = $('.menu-ref__title, .menu__item--category-expandable', context);
      var $body = $('body', context);
      var $header = $('.page-header', context);
      var $footer = $('.page-footer', context);
      var $menuTrigger = $('.page-navigation__menu-toggle', $block);
      var $currentBackTitle;
      var activeclass = 'js-active';
      var alt_class = 'is-alternate';
      var nav_open = false;
      var isCurrentMobileView = _isGnavMobileView();
      var mouseEventType = Modernizr.touch ? 'click' : 'mouseenter';
      var $mobileBackButton = $('.js-mobile-checkout-back', context);
      var pathArray = window.location.pathname.split('/');
      var mobileCheckout = pathArray[1] === 'checkout';
      $sectionPageNav.addClass('active-menu-toogle');

      function _isGnavMobileView() {
        var isMobileView = false;
        var mediaMobileView = matchMedia('screen and (max-width:768px)').matches || matchMedia('screen and (max-width:1024px)').matches;
        var unisonIsMobile = parseInt(Unison.fetch.now().width) <= parseInt(Unison.fetch.all().medium);
        isMobileView = mediaMobileView || unisonIsMobile;
        return isMobileView;
      }

      function _createthirdTierWrapper() {
        if (_isGnavMobileView()) {
          var heightMenuRefs = 0;
          $header.find('.js-menu-ref').each(function() {
            heightMenuRefs += $(this).outerHeight();
          });
          $sectionNav.attr('data-height-menu-navigation', heightMenuRefs);
          $sectionNav.height(heightMenuRefs);
        }
        // add third tier menu for mobile
        $('.menu__item--category-expandable').each(function() {
          var $thirdTierWrapper = null;
          if (_isGnavMobileView()) {
            if ($(this).next().hasClass('menu-ref__content')) {
              return;
            }
            $thirdTierWrapper = $('<div class="menu-ref__content"><div class="menu--lvl-4"><ul class="menu menu--lvl-5"></ul></div></div>');
            while (!$(this).next().hasClass('menu__item--category') && $(this).next().hasClass('menu__item--link')) {
              var $nextItem = $(this).next();
              $thirdTierWrapper.find('.menu--lvl-5').append($nextItem);
            }
            $(this).after($thirdTierWrapper);
          } else {
            if ($(this).next().hasClass('menu__item--link') && !$(this).next().hasClass('menu__item--category')) {
              return;
            }
            while (!$(this).next().hasClass('menu__item--category') && $(this).next().hasClass('menu-ref__content')) {
              var $nextItemPC = $(this).next();
              var $menuItemLink = $nextItemPC.find('.menu--lvl-5 .menu__item--link');
              if ($menuItemLink) {
                $(this).after($menuItemLink);
              }
              $nextItemPC.remove();
            }
          }
        });
        $menuRef.find('.menu__item--back').remove();
        if (!_isGnavMobileView()) {
          $menuRef.find('.menu--lvl-2').removeAttr('style');
        }
      }

      _createthirdTierWrapper();

      // hamburger adds a body class so we can toggle main nav
      $menuTrigger.on('click', function(event) {
        event.preventDefault();
        if (nav_open) {
          $(document).trigger('navClose');
          if (generic.env.isIOS4) {
            $header.css({'top': $(window).scrollTop()});
          }
        } else {
          $(document).trigger('searchClose');
          $(document).trigger('navOpen');
        }
      });

      $menuTitleTrigger.on('click', function(event) {
        var $title = $(this);
        var $title_link = $title.find('.menu-ref__link');
        var $content = $title.siblings('.menu-ref__content');
        var hasContent = $.trim($content.html()) ? true : false;
        var leftAnimate = 0;
        var menuLevel = 0;
        var $nextLevel = null;
        var $backTitle = null;
        var leftPosition = 0;
        var heightNextLevel = 0;
        var heightMenuColumnLevel = 0;
        var $nextLevelList = null;
        if (_isGnavMobileView()) {
          if ($title_link.length && !hasContent) {
            window.location = $title_link.attr('href');
            return;
          }
          event.preventDefault();
          if ($(this).hasClass('menu-ref__title')) {
            leftAnimate = 111;
            menuLevel = 2;
          } else {
            leftAnimate = 222;
            menuLevel = 4;
          }
          $sectionPageNav.scrollTop(0);
          $('.menu-ref__content').find('.menu--lvl-' + menuLevel).hide();
          $currentBackTitle = $content.find('.menu__item--back');
          $nextLevel = $($(this).next('.menu-ref__content')[0]).find('.menu--lvl-' + menuLevel + ':first-child');
          $nextLevel.show();
          leftPosition = $sectionNav.position().left - leftAnimate + '%';
          $sectionNav.animate({left: (leftAnimate * -1) + '%'}, 250);

          //add mobile back title
          if (!$nextLevel.find('.menu__item--back').length) {
            $backTitle = $('<li class="menu__item menu__item--lvl-3 menu__item--link menu__item--back menu__item--back-lvl--' + menuLevel + '"></li>');
            $backTitle.html($(this).find('a').html() || $(this).find('span').html() || $(this).html());
            $($nextLevel.find('.menu--lvl-3, .menu--lvl-5')[0]).prepend($backTitle);

            $backTitle.on('click', function() {
              var backAnimate = $(this).hasClass('menu__item--back-lvl--4') ? 111 : 0;
              leftPosition = (backAnimate * -1) + '%';
              $sectionNav.animate({left: leftPosition}, 250);
              $nextLevel.hide();
              $sectionNav.removeAttr('height');
              if ($(this).hasClass('menu__item--back-lvl--4')) {
                var menuLevelPreviousHeight = $(this).parents('.menu--lvl-2').height();
                $sectionNav.height(menuLevelPreviousHeight);
              } else {
                $sectionNav.height($sectionNav.data('height-menu-navigation'));
              }
            });
          }
          $nextLevelList = $($(this).next('.menu-ref__content')[0]).find('.menu--lvl-' + menuLevel);
          $nextLevelList.find('li.menu__item--lvl-3').each(function() {
            if (menuLevel === 2 && $(this).parents('.menu--lvl-4').length > 0) {
              return;
            }
            heightNextLevel += $(this).outerHeight();
          });
          heightMenuColumnLevel = heightNextLevel + Math.abs($nextLevelList.position().top) * 2;
          $nextLevelList.height(heightMenuColumnLevel);
          $sectionNav.height(heightMenuColumnLevel);
        }
      });

      $menuRef.on('click mouseenter', function() {
        if (!$(this).hasClass('menu-ref--has-children') || _isGnavMobileView()) {
          return;
        }
        // don't open if mouseenter and search is open
        if (mouseEventType === 'mouseenter' && Drupal.ELB.ui.search_open) {
          return;
        }
        $('.' + activeclass, $header).removeClass(activeclass);
        $(this).addClass(activeclass);
        $menuRef.find('.menu--lvl-2').hide();
        $(document).trigger('navOpen');
        $(this).find('.menu--lvl-2').show();
      });

      // close search, if open, on nav click
      // nav hover elements
      $menuRef.on('click', function() {
        if (mouseEventType === 'mouseenter' && Drupal.ELB.ui.search_open) {
          $(document).trigger('searchClose');
          $(this).trigger('mouseenter');
        }
      });
      // hover state for nav elements with no menu-ref--has-children and currently nav opened
      $header.on('mouseenter', '.js-menu-ref:not(.menu-ref--has-children)', function() {
        if (mouseEventType === 'mouseenter' && !Drupal.ELB.ui.search_open) {
          $(this).addClass('has-hover');
          if (nav_open) {
            $(document).trigger('navClose');
          }
        }
      });
      $header.on('mouseleave', '.js-menu-ref:not(.menu-ref--has-children)', function() {
        if (mouseEventType === 'mouseenter' && !Drupal.ELB.ui.search_open) {
          $(this).removeClass('has-hover');
        }
      });
      $header.on('mouseleave', function() {
        if (mouseEventType === 'mouseenter' && !Drupal.ELB.ui.search_open) {
          $(document).trigger('navClose');
        }
      });

      // back button
      if (mobileCheckout) {
        if (!$('.checkout-confirmation-page').length && history.length > 1) {
          $mobileBackButton.removeClass('hidden');
        } else if ($('.checkout-confirmation-page').length) {
          $mobileBackButton.remove();
        }
      } else {
        $mobileBackButton.remove();
      }

      /**
      * React to navOpen event
      */
      $(document).on('navOpen', function() {
        // add active header state class
        $header.addClass(alt_class);
        if (_isGnavMobileView()) {
          $body.addClass('mobile-gnav-active');
        } else {
          $body.addClass('gnav-active');
        }
        nav_open = true;
      });
      /**
      * React to navClose event
      */
      $(document).on('navClose', function() {
        // remove active header class
        $header.removeClass(alt_class);
        if (_isGnavMobileView()) {
          $body.removeClass('mobile-gnav-active');
          if ($currentBackTitle) {
            if ($currentBackTitle.is(':visible')) {
              $currentBackTitle.trigger('click');
            }
          }
          $menuRef.find('.menu--lvl-2').hide();
          $sectionNav.animate({left: 0}, 250);
          $sectionPageNav.scrollTop(0);
        } else {
          $body.removeClass('gnav-active');
          $menuRef.find('.menu--lvl-2').hide();
        }
        $('.' + activeclass, $header).removeClass(activeclass);
        // specific footer handling
        $footer.fadeIn();
        // finally set global var
        nav_open = false;
      });
      $(window).resize(_.debounce(function() {
        var isMobileView = _isGnavMobileView();
        mouseEventType = Modernizr.touch && isMobileView ? 'click' : 'mouseenter';

        if (isCurrentMobileView !== isMobileView) {
          $sectionNav.removeAttr('style');
          _createthirdTierWrapper();
          $(document).trigger('navClose');
          isCurrentMobileView = isMobileView;
        }
        if (!isMobileView) {
          $(document).trigger('navClose');
        }
      }, 250));
    }
  };
})(jQuery);
