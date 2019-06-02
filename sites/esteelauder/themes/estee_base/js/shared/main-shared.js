
(function($) {
  // global settings object
  Drupal.ELB = {
    ui: {
      alt_class: "is-alternate", // global/_variables.scss:$alt,
      landing_class: "is-landing", // front/landing class based on home/mobile-home-formatter
      sticky_class: "is-sticky", // header sticky
      active_class: "js-active", // active states (menus), _variables.scss
      search_class: "is-search", // global/_variables.scss:$search,
      dark_nav_class: "is-dark-nav", // global/_variables.scss:$$dark-nav,
      back_top_duration: 800, // default scroll to top value, components/_scroll_to_top.scss
      back_top_distance: -50, // how far from top of page before showing "top" widget
      mq_state: {
        small_only: 'only screen and (max-width: 640px)',
        medium_only: 'only screen and (min-width:641px) and (max-width: 768px)',
        medium_up: 'only screen and (min-width:641px)',
        ipad_only_portrait: 'only screen and (min-width:768px) and (max-width: 1024px) and (orientation: portrait)',
        ipad_only_landscape: 'only screen and (min-width:768px) and (max-width: 1024px) and (orientation: landscape)',
        tablet_only_portrait: 'only screen and (min-width:800px) and (max-width: 1280px) and (orientation: portrait)',
        tablet_only_landscape: 'only screen and (min-width:800px) and (max-width: 1280px) and (orientation: landscape)'
      },
      nav_open: false,
      search_open: false,
      // we often need to get the header height for other calculations
      header_height: function() {
        // set a variable value here instead of constant lookup
        return $('#toolbar').height() + $('.page-header').outerHeight();
      },
      // we often need to get the sticky footer height for other calculations
      sticky_footer_height: function() {
        return $('.page-sticky-footer').height();
      },
      // Resize an element to the usable height of the window,
      // see home_formatter.js for implementation
      fullHeightElement: function($element, includeHeader) {
        // scope stickyFooterHeight
        var stickyFooterHeight = this.sticky_footer_height(),
          headerHeight = this.header_height();
        // return a throttle-able function (with args!) ready to be used in a .resize
        return _.throttle(function() {
          // start with window height, subtract admin toolbar height
          var windowHeight = $(window).height(),
            realWindowHeight = windowHeight - stickyFooterHeight,
            // minHeight = 700;
            minHeight = 650;
          if (includeHeader) {
            realWindowHeight = realWindowHeight - headerHeight;
          }
          // Set element to safe height unless it's below minHeight
          $element.height((realWindowHeight >= minHeight ? realWindowHeight : minHeight));
        }, 250);
      } // fullHeightElement()
    }, // ui
    getJSONCookie : function(cookieName) {
      return jQuery.parseJSON($.cookie(cookieName)) || {};
    },
    // Initiate all selectboxes
    applySelectBoxes: function() {
      $('select.selectbox, select.selectBox').selectBox().removeClass('selectbox');
    },
    // selectbox.js doesn't account for iOS when refreshing even though it does
    // when initing. Use this wrapper function instead of using .selectBox('refresh')
    // directly
    refreshSelectBoxes : function($selectBoxes) {
      $selectBoxes.each(function(){
        var control = $(this).data('selectBox-control');
        if (control && control.length) {
          $(this).selectBox('refresh');
        }
      });
    },
    waypointBottomOffset : function(element) {
      var $element = $(element);
      var contextHeight = $(window).height();
      if( $element.outerHeight() >  contextHeight){
        contextHeight = $element.outerHeight() - 200; //200 for minibag offset
      }
      return contextHeight - $element.outerHeight() - 200;
    },
    //
    // Helper function to return TRUE or FALSE based on whether the personalization engine is enabled.
    // We know this to be true or not based on personal_block being loaded in Drupal.settings.
    //
    hasPersonalization: function() {
      var settings        = Drupal || {};
          settings        = settings.settings || {};
          personalization = settings.personal_block;
      return personalization ? 1 : 0;
    },
    loadPersistenUserCookie: function() {
      var cookieName = 'persistent_user_cookie';
      var cookieVal = Drupal.ELB.getJSONCookie(cookieName);
      // These are the keys we want to copy out of FE_USER_CART:
      var cookieKeys = ['first_name', 'pc_email_optin', 'email', 'is_loyalty_member', 'points', 'loyalty_level', 'loyalty_level_name', 'points_to_next_level', 'next_level', 'next_level_name'];
      // Share accross desktop and mobile sites:
      var domain = '.' + window.location.hostname.replace(
        /^.*(esteelauder\.)/,
        function(m, $1) { return $1; }
      );

      // The jquery.cookie.js included in Drupal is from before this feature
      // existed :(
      // $.cookie.json = true;

      // User only gets one first time:
      if ($.isEmptyObject(cookieVal)) {
        cookieVal.first_time = 1;
      } else {
        cookieVal.first_time = 0;
      }

      // Prevent errors if user_info_cookie.js isn't found:
      if (typeof site != 'undefined' && typeof site.userInfoCookie != 'undefined') {
        // FE_USER_CART is not persistent, it gets emptied when the user signs
        // out. If the values in it update, we want to update our persistent
        // cookie as well, but if they're null we want what's in our cookie to
        // persist.
        var key, val;
        for (var i = 0; i < cookieKeys.length; i++) {
          key = cookieKeys[i];
          val = site.userInfoCookie.getValue(key);
          cookieVal[key] = val;
        }
      }

      $.cookie(cookieName, JSON.stringify(cookieVal), { expires: 365 * 5, path: '/', domain: domain });

      if(cookieVal.is_loyalty_member - 0) {
        // set global loyalty class for when user is enlisted in loyalty
        // used to controll footer state
        $('body').addClass('elc-user-state-loyalty');
      }else{
        // make sure class is not there for non-loyal
        $('body').removeClass('elc-user-state-loyalty');
      }

    }
  }; // Drupal.ELB

  // init page_data
  var page_data = page_data || {};

  Drupal.behaviors.ELB = {
    attach: function(context, settings) {
      //init
      Drupal.ELB.ui.mq = {
        small_only: Modernizr.mq(Drupal.ELB.ui.mq_state.small_only),
        medium_only: Modernizr.mq(Drupal.ELB.ui.mq_state.medium_only),
        medium_up: Modernizr.mq(Drupal.ELB.ui.mq_state.medium_up),
        ipad_only_portrait: Modernizr.mq(Drupal.ELB.ui.mq_state.ipad_only_portrait),
        ipad_only_landscape: Modernizr.mq(Drupal.ELB.ui.mq_state.ipad_only_landscape),
        tablet_only_portrait: Modernizr.mq(Drupal.ELB.ui.mq_state.tablet_only_portrait),
        tablet_only_landscape: Modernizr.mq(Drupal.ELB.ui.mq_state.tablet_only_landscape)
      };
      //resize
      $(window).resize(function(){
        Drupal.ELB.ui.mq = {
          small_only: Modernizr.mq(Drupal.ELB.ui.mq_state.small_only),
          medium_only: Modernizr.mq(Drupal.ELB.ui.mq_state.medium_only),
          medium_up: Modernizr.mq(Drupal.ELB.ui.mq_state.medium_up),
          ipad_only_portrait: Modernizr.mq(Drupal.ELB.ui.mq_state.ipad_only_portrait),
          ipad_only_landscape: Modernizr.mq(Drupal.ELB.ui.mq_state.ipad_only_landscape),
          tablet_only_portrait: Modernizr.mq(Drupal.ELB.ui.mq_state.tablet_only_portrait),
          tablet_only_landscape: Modernizr.mq(Drupal.ELB.ui.mq_state.tablet_only_landscape)
        };
      });
    } // attach
  };

  /**
   * Nav fixed position scroll behavior
   */
  Drupal.behaviors.ELB_headersticky = {
    attach: function(context, settings) {
      var $header = $('.page-header'),
        headerHeight = $header.height();
      // Only apply sticky header above mobile mq, because we sometimes demo
      // mobile behavior on a PC browser. THIS JS ONLY FIRES ON PC
      // if (!Drupal.ELB.ui.mq.small_only){

        // waypoint module, once we hit the bottom of header, trigger
        $('body').waypoint(function(direction){
            $header.toggleClass(Drupal.ELB.ui.sticky_class);
        }, {
          offset: function(){
            return -headerHeight;
          }
        }); // waypoint

      // } // if mq.small_only
    } // attach
  };

  Drupal.behaviors.ELB_userState = {
    attach: function(context, settings) {
      var signedIn = typeof site != 'undefined';
      signedIn = signedIn && typeof site.userInfoCookie != 'undefined';
      signedIn = signedIn && parseInt(site.userInfoCookie.getValue('signed_in'), 10);
      var signInState = signedIn ? 'logged-in' : 'anonymous';
      $('body').addClass( 'elc-user-state-' + signInState );
    }
  };

  Drupal.behaviors.ELB_persistentUserCookie = {
    attach: function(context, settings) {
      Drupal.ELB.loadPersistenUserCookie();
    }
  };

  Drupal.behaviors.ELBPC_clientToggle = {
    attach: function (context, settings) {
      // wire device toggle links
      if(site && site.client && site.client.controls) {
        site.client.controls();
      }
    }
  };

  /**
   * Modernizr shivs and checks
   */
  Drupal.behaviors.ELB_shivs = {
    attach: function(context, settings) {
      // Modernizr.load({
      //   test: Modernizr.mq('only all'),
      //   nope: 'respond.min.js'
      // });
    }
  };


  /**
   * Mobile-pc navigation behaviors
   */
  Drupal.behaviors.ELBPC_nav = {
    attach: function(context, settings) {
      var $header = $('.page-header'),
      $footer = $('.page-footer'),
      activeclass = Drupal.ELB.ui.active_class;

      var mouseEventType = (Modernizr.touch) ? 'click' : 'mouseenter';

      // close nav on these elements:hover
      // var $navCloseElements = $('#main, .page-branding, .page-utilities, .page-footer, .level-1:not(.menu-trigger)');
      // constrain to page-header
      //var $navCloseElements = $('.page-branding, .page-utilities', $header);
      var $navCloseElements = $('.page-branding', $header);

      // When clicking away from nav header, close the nav header
      $('html').on('click', function() {
        // Trigger generic close event other things can hop onto
        $(document).trigger('navClose');
      });

      // Prevent header clicks from propagating to html tag
      $header.on('click', function(event) {
        event.stopPropagation();
      });

       // Clicking .menu-trigger menu headers (Makeup, Skinecare)
      $header.on(mouseEventType, '.menu-trigger', function(event) {
        event.preventDefault();

        // don't open if mouseenter and search is open
        if(mouseEventType == 'mouseenter' && Drupal.ELB.ui.search_open) {
          return;
        }
        // go all the way up the chain to the parent menu-reference
        var $major_section = $(this).parents('.menu-reference');

        // Major section toggling hide/showing, take into account mobile toggle
        if ($major_section.hasClass(activeclass) && Drupal.ELB.ui.mq.small_only) {
          $('.'+activeclass, $header).removeClass(activeclass);
        }
        // Specific iPad and tablet portrait only Major section toggling hide/showing, take into account mobile nav toggle
        else if ($major_section.hasClass(activeclass) && (Drupal.ELB.ui.mq.ipad_only_portrait || Drupal.ELB.ui.mq.tablet_only_portrait)) {
          $('.'+activeclass, $header).removeClass(activeclass);
        } else {
          $('.'+activeclass, $header).removeClass(activeclass);
          $major_section.addClass(activeclass);
        }

        // Get category class from array of css classes
        var trigger_class_split = $(this).attr('class').split(' ');
        // Ignore the standard drupal classes
        var ignoreThese = ['', 'active-trail', 'level-1', 'menu-trigger', 'leaf', 'last', 'expanded'];
        trigger_class_split = _.difference(trigger_class_split, ignoreThese);
        // Category class is most likely what is left
        var cat_class = trigger_class_split[0];
        // Trigger generic open event other things can hop onto
        $(document).trigger('navOpen', [cat_class]);
      });

      // close search, if open, on nav click
      // nav hover elements
      if(mouseEventType == 'mouseenter') {
        $header.on('click', '.menu-trigger', function(event) {
          event.preventDefault();
          if (Drupal.ELB.ui.search_open) {
            $(document).trigger('searchClose');
            //$(document).trigger('navOpen');
            $(this).trigger('mouseenter');
          }
        });
        // hover state for skincare make up fragrance renutriv sub nav elements
        $header.on('mouseenter', '.level-3', function(event) {
          event.preventDefault();
          if (!Drupal.ELB.ui.search_open && Drupal.ELB.ui.nav_open) {
            $(this).addClass('has-hover');
          }
        });
        $header.on('mouseleave', '.level-3', function(event) {
          event.preventDefault();
            if (!Drupal.ELB.ui.search_open && Drupal.ELB.ui.nav_open) {
              $(this).removeClass('has-hover');
            }
        });
        // hover state for nav elements with no menu-trigger
        $header.on('mouseenter', '.level-1:not(.menu-trigger)', function(event) {
          event.preventDefault();
          if (!Drupal.ELB.ui.search_open && Drupal.ELB.ui.nav_open) {
            $(this).addClass('has-hover');
          }
        });
        $header.on('mouseleave', '.level-1:not(.menu-trigger)', function(event) {
          event.preventDefault();
            if (!Drupal.ELB.ui.search_open && Drupal.ELB.ui.nav_open) {
              $(this).removeClass('has-hover');
            }
        });
        // hover state for Aerin sub nav elements
        $header.on('mouseenter', '.level-2 h3', function(event) {
          event.preventDefault();
          if (!Drupal.ELB.ui.search_open && Drupal.ELB.ui.nav_open) {
            $(this).addClass('has-hover');
          }
        });
        $header.on('mouseleave', '.level-2 h3', function(event) {
          event.preventDefault();
            if (!Drupal.ELB.ui.search_open && Drupal.ELB.ui.nav_open) {
              $(this).removeClass('has-hover');
            }
        });
      }

      // Mobile nav: Clicking submenus (Makeup > Face), toggle active state
      $header.on('click', '.depth-1 h3', function(event) {
        event.stopPropagation();
        var $sub_menu = $(this).parents('.menu-item-container');
        if (!$sub_menu.hasClass(activeclass)) {
          $('.menu-item-container', $header).removeClass(activeclass);
        }
        $sub_menu.toggleClass(activeclass);
      });
       // Menu toggle (X button)
      $header.on('click', '.page-navigation__menu-toggle', function(event) {
        var startingCat = 'makeup';
        // toggle header state
        if (Drupal.ELB.ui.nav_open) {
          $(document).trigger('navClose');
          if (generic.env.isIOS4) {
           $header.css({'top' : $(window).scrollTop()});
          }
        } else {
          $(document).trigger('searchClose');
          // $(document).trigger('navOpen', [startingCat]); // give a default cat
          $(document).trigger('navOpen'); // requested we remove starting cat, 180070
          // Edit, NOPE: 180070. Since we safely have a default cat, set js-active on it.
          // $('.menu-trigger.'+startingCat).parents('.menu-reference').addClass(activeclass);
        }
      });

      // back button
      var $mobileBackButton = $('.js-mobile-checkout-back', context);
      var pathArray = window.location.pathname.split( '/' );
      var mobileCheckout = (pathArray[1] === 'checkout');
      if (mobileCheckout) {
          if (!$('.checkout-confirmation-page').length && history.length > 1) {
              $mobileBackButton.removeClass('hidden');
          } else if($('.checkout-confirmation-page').length){
              $mobileBackButton.remove();
          }
      } else {
          $mobileBackButton.remove();
      }

      // $('.page-navigation__hotswap, page-navigation__supplemental',$header).on('mouseleave', function() {
          // event handling buggy, may be usefull as an additional check.
      // });

      // close nav on mousenter outside of .page-navigation__hotswap
      if(mouseEventType == 'mouseenter') {
        $navCloseElements.on('mouseenter', function() {
            if (!Drupal.ELB.ui.search_open) {
              $(document).trigger('navClose');
            }
            //$(document).trigger('searchClose');
        });
        $header.on('mouseleave', function() {
            if (!Drupal.ELB.ui.search_open) {
              $(document).trigger('navClose');
            }
        });
      }

      // Close nav on esc press
      $(document).keyup(function(e) {
        if (e.which === 27) {
          $(document).trigger('navClose');
          $(document).trigger('searchClose');
        }
      });

      /**
       * React to navOpen event
       */
      $(document).on('navOpen', function(event, category) {
        // add active header state class
        $header.addClass(Drupal.ELB.ui.alt_class);
        //$('html,body').addClass('noscroll');
        // hide footer if it is visible
        //if ($footer.is(':visible')) {
        //  $footer.fadeOut();
        //}
        // finally set global var
        Drupal.ELB.ui.nav_open = true;
        // do one little .resize() to trigger js layout recalcs
        $(window).resize();
         if (generic.env.isIOS4) {
           setTimeout(function(){
             navScroll.refresh();
           }, 500);
         }
      });
       /**
       * React to navClose event
       */
      $(document).on('navClose', function(event, category) {
        // remove active header class
        $header.removeClass(Drupal.ELB.ui.alt_class);
        //$('html,body').removeClass('noscroll');
        // remove menu active states
        $('.'+activeclass, $header).removeClass(activeclass);
        // specific footer handling
        $footer.fadeIn();
        // finally set global var
        Drupal.ELB.ui.nav_open = false;
      });

      $('.page-navigation .nav-tout').parents('.menu-item-container').addClass('menu-item-container--has-nav-tout').parents('.menu-container').addClass('menu-container').addClass('menu-container--has-nav-tout');

      // FE-959: ReNutriv image tout
      // The "nav-tout-3-cols" CSS class must be first added in the "Reference: Contentblock Menu Reference - V1" template item (node/30)
      var $menuRef = $('.page-navigation').find('.menu-reference');
      $menuRef.each(function () {
        var $self = $(this);
        if ($self.hasClass('nav-tout-3-cols')) {
          $('.nav-tout--3-cols.nav-tout').closest('div.menu-container').addClass('nav-tout-3-cols');
        }
      });

    } // attach
  }; // ELBPC_nav

  Drupal.behaviors.ELB_cartConfirm = {
    attach: function(context, settings) {
      if (typeof site.cartConfirm != 'undefined') {
        site.cartConfirm.init();
      }
      if (typeof site.offerConfirm != 'undefined') {
        site.offerConfirm.init();
      }
      $('.page-utilities__cart-button').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        window.location.href = '#';
      });
      var item_count = site.userInfoCookie.getValue('item_count');
      if(item_count > 0){
        $('.page-utilities__cart-count').html(item_count);
      }else{
        $('.page-utilities__cart-count').html('');
      }
    }
  };

  /**
   * Nav fixed position scroll behavior
   */
  Drupal.behaviors.ELB_headersticky = {
    attach: function(context, settings) {
      var $header = $('.page-header'),
        headerHeight = $header.height();

      // Only apply sticky header above mobile mq, because we sometimes demo
      // mobile behavior on a PC browser. THIS JS ONLY FIRES ON PC
      // if (!Drupal.ELB.ui.mq.small_only){

        var pathArray = window.location.pathname.split( '/' );
        var mobileCheckout = (pathArray[1] === 'checkout');
        if (mobileCheckout) {
            $header.addClass(Drupal.ELB.ui.sticky_class);
        } else {
            // waypoint module, once we hit the bottom of header, trigger
            $('body').waypoint(function(direction){
                $header.toggleClass(Drupal.ELB.ui.sticky_class);
            }, {
              offset: function(){
                return -headerHeight;
              }
            }); // waypoint
        }

      // } // if mq.small_only
    } // attach
  };

  Drupal.behaviors.ELB_userState = {
    attach: function(context, settings) {
      var signedIn = typeof site != 'undefined';
      signedIn = signedIn && typeof site.userInfoCookie != 'undefined';
      signedIn = signedIn && parseInt(site.userInfoCookie.getValue('signed_in'), 10);
      var signInState = signedIn ? 'logged-in' : 'anonymous';
      $('body').addClass( 'elc-user-state-' + signInState );
    }
  };

  Drupal.behaviors.ELB_persistentUserCookie = {
    attach: function(context, settings) {
      var cookieName = 'persistent_user_cookie';
      var cookieVal = Drupal.ELB.getJSONCookie(cookieName);
      // These are the keys we want to copy out of FE_USER_CART:
      var cookieKeys = ['first_name', 'pc_email_optin', 'email'];
      // Share accross desktop and mobile sites:
      var domain = '.' + window.location.hostname.replace(
        /^.*(esteelauder\.)/,
        function(m, $1) { return $1; }
      );

      // The jquery.cookie.js included in Drupal is from before this feature
      // existed :(
      // $.cookie.json = true;

      // User only gets one first time:
      if ($.isEmptyObject(cookieVal)) {
        cookieVal.first_time = 1;
      } else {
        cookieVal.first_time = 0;
      }

      // Prevent errors if user_info_cookie.js isn't found:
      if (typeof site != 'undefined' && typeof site.userInfoCookie != 'undefined') {
        // FE_USER_CART is not persistent, it gets emptied when the user signs
        // out. If the values in it update, we want to update our persistent
        // cookie as well, but if they're null we want what's in our cookie to
        // persist.
        var key, val;
        for (var i = 0; i < cookieKeys.length; i++) {
          key = cookieKeys[i];
          val = site.userInfoCookie.getValue(key);
          if (!cookieVal[key] || (typeof val != 'undefined' && val !== null && val != 'null')) {
            cookieVal[key] = val;
          }
        }
      }

      $.cookie(cookieName, JSON.stringify(cookieVal), { expires: 365 * 5, path: '/', domain: domain });
    }
  };

  Drupal.behaviors.ELBPC_clientToggle = {
    attach: function (context, settings) {
      // wire device toggle links
      if(site && site.client && site.client.controls) {
        site.client.controls();
      }
    }
  };

  /**
   * Modernizr shivs and checks
   */
  Drupal.behaviors.ELB_shivs = {
    attach: function(context, settings) {
      // Modernizr.load({
      //   test: Modernizr.mq('only all'),
      //   nope: 'respond.min.js'
      // });
    }
  };

  /**
   * Move submenus into .page-navigation__hotswap when the nav is opened
   */
  Drupal.behaviors.ELBPC_nav_hotswap = {
    attach: function(context, settings) {
      var $hotswap = $('.page-navigation__hotswap');

      // hop on navOpen event
      $(document).on('navOpen', function(event, category) {
        // clear out our "landing area"
        $hotswap.empty();
        // only trigger this "hotswap" container behavior ABOVE mobile
        if (!Drupal.ELB.ui.mq.small_only){
          // clone our subnav in prep for positioning, category is emmitted with event
          var $subnav = $('.'+category).next('.depth-1').clone(),
            // holding var for child elements
            $subnav_children = $('.menu-item-container', $subnav),
            // count of subnav elements
            sliceafter = 8;

          // Break apart ULs longer than 7 (according to comps)
          $subnav_children.each(function(){
            // When subnav longer than 7 li's
            if ($('.depth-2 li', $(this)).length > sliceafter) {
              // Make new ul
              $menucol = $('<ul class="menu menu-column"></ul>');
              // Rip out all lis after 7
              $('.depth-2 li', $(this)).slice(sliceafter).appendTo($menucol);
              // UL's are now side by side
              $('.depth-2', $(this)).append($menucol);
            }
          });

          // put a count on the elements to help sizing columns
          $subnav_children.addClass('menu-item-container--childcount-' + $subnav_children.length);
          // place
          $subnav.appendTo($hotswap);
          $('.page-navigation').addClass('is_animated');
        }
      }); //.on('navOpen')

    $(document).on('navClose', function(event, category) {
      // clear hotswap
      $hotswap.empty();
      // pause animation for quick access to other navs
      setTimeout(function(){
        if (!Drupal.ELB.ui.nav_open) {
          $('.page-navigation').removeClass('is_animated');
        }
      }, 300);
    }); //.on('navClose')

    } // attach
  }; // ELBBPC_nav_hotswap

  /**
   * Sticky footer behaviors
   */
  Drupal.behaviors.ELB_stickyFooter = {
    attach: function(context, settings) {
      var $footer = $('.page-footer', context);
      var $stickyFooter = $('.page-sticky-footer', context);
      var $promos = $('.promo-messages', $stickyFooter).children();
      var offset = 0;
      var stickyFooterHeight = $stickyFooter.height();
      var promoIndex = -1;

      // footer tablet
      var $ResponsiveFooter = $('.responsive-footer', context);
      var $ResponsiveFooterInner = $('.page-sticky-footer__right__inner', context);
      var $ResponsiveFooterLeft = $('.page-sticky-footer__left', context);
      var $TabletFooter = $('.tablet-footer', context);
      var $TabletFooterSticky = $('.page-sticky-footer__mobile__inner', context);

      if (!$footer.length) {
        return;
      }

      function _setStickyClass() {
        $stickyFooter.toggleClass( 'is-sticky', $(window).scrollTop() < offset );
      }

      function _setOffset() {
        offset = $footer.offset().top - $(window).height() + stickyFooterHeight;
        _setStickyClass();
      }

      function _fadePromos() {
        ++promoIndex;
        $promos.eq(promoIndex % $promos.length).fadeIn(300).delay(5000).fadeOut(500, _fadePromos);
      }

      $(window).scroll(_setOffset).resize(_setOffset);

      _setOffset();
      // Use a timeout to ensure this is run after other scripts set their dimensions
      setTimeout(_setOffset, 60);

      if ($promos.length > 1) {
        _fadePromos();
      }


      var $TabletFooterCheck = $TabletFooter.contents().length;

      if (($TabletFooterCheck > 1) && (Drupal.ELB.ui.mq.ipad_only_portrait || Drupal.ELB.ui.mq.tablet_only_portrait)) {

        $ResponsiveFooter.addClass('hidden');
        $ResponsiveFooterInner.addClass('hidden');
        $ResponsiveFooterLeft.addClass('hidden');
        $TabletFooterSticky.removeClass('hidden');
        $TabletFooter.removeClass('hidden');


        $(window).on('orientationchange', function(event) {
          $ResponsiveFooter.toggleClass('hidden');
          $ResponsiveFooterInner.toggleClass('hidden');
          $ResponsiveFooterLeft.toggleClass('hidden');
          $TabletFooter.toggleClass('hidden');
          $TabletFooterSticky.toggleClass('hidden');
        });

       } else if (($TabletFooterCheck > 1) && (Drupal.ELB.ui.mq.ipad_only_landscape || Drupal.ELB.ui.mq.tablet_only_landscape)){

       $TabletFooter.addClass('hidden');
       $TabletFooterSticky.addClass('hidden');
       $ResponsiveFooter.removeClass('hidden');
       $ResponsiveFooterInner.removeClass('hidden');
       $ResponsiveFooterLeft.removeClass('hidden');

       $(window).on('orientationchange', function(event) {
         $TabletFooter.toggleClass('hidden');
         $TabletFooterSticky.toggleClass('hidden');
         $ResponsiveFooter.toggleClass('hidden');
         $ResponsiveFooterInner.toggleClass('hidden');
         $ResponsiveFooterLeft.toggleClass('hidden');
       });

       } else {
         $TabletFooter.remove();
         $TabletFooterSticky.remove();
       }
      // footer tablet


    }
  };

  Drupal.behaviors.ELB_mp_translate = {
    attach: function(context, settings) {
      window.MP = {
        Version: '1.0.23',
        // Domains: {'es':'stage3espanol.esteelauder.com', 'fr':'stagefrancais.esteelauder.ca'},
        Domains: {
          'es': 'espanol.esteelauder.com',
          'fr': 'francais.esteelauder.ca'
        },
        SrcLang: 'en',
        UrlLang: 'mp_js_current_lang',
        SrcUrl: decodeURIComponent('mp_js_orgin_url'),
        init: function(){
          if (MP.UrlLang.indexOf('p_js_')==1) {
            MP.SrcUrl=window.top.document.location.href;
            MP.UrlLang=MP.SrcLang;
          }
        },
        getCookie: function(name){
          var start=document.cookie.indexOf(name+'=');
          if(start < 0) return null;
          start=start+name.length+1;
          var end=document.cookie.indexOf(';', start);
          if(end < 0) end=document.cookie.length;
          while (document.cookie.charAt(start)==' '){ start++; }
          return decodeURIComponent(document.cookie.substring(start,end));
        },
        setCookie: function(name,value,path,domain){
          var cookie=name+'='+encodeURIComponent(value);
          if(path)cookie+='; path='+path;
          if(domain)cookie+='; domain='+domain;
          var now=new Date();
          now.setTime(now.getTime()+1000*60*60*24*365);
          cookie+='; expires='+now.toUTCString();
          document.cookie=cookie;
        },
        switchLanguage: function(lang){
          var script;
          if (lang!=MP.SrcLang){
            script=document.createElement('SCRIPT');
            script.src=location.protocol+'//'+MP.Domains[lang]+'/'+MP.SrcLang+lang+'/?1023749632;'+encodeURIComponent(MP.SrcUrl);
            document.body.appendChild(script);
          } else if(lang==MP.SrcLang && MP.UrlLang!=MP.SrcLang){
            script=document.createElement('SCRIPT');
            script.src=location.protocol+'//'+MP.Domains[MP.UrlLang]+'/'+MP.SrcLang+MP.UrlLang+'/?1023749634;'+encodeURIComponent(location.href);
            document.body.appendChild(script);
          }
          return false;
        },
        switchToLang: function(url) {
          window.top.location.href=url;
        }
      };

      function switchLanguage(lang) {
        MP.SrcUrl=decodeURIComponent('mp_js_orgin_url');
        MP.UrlLang = lang !== 'en' ? 'mp_js_current_lang' : MP.getCookie('MP_LANG');
        MP.init();
        MP.switchLanguage(MP.UrlLang==lang?'en':lang);
        return false;
      }

      $('.switch-lang-link').on('click', function(event) {
        event.preventDefault();
        return switchLanguage( $(this).attr('data-mp-lang') );
      });
    }
  };

  /**
   * product CTA quickshop
   */
  Drupal.behaviors.ELB_CTA_quickshop = {
    attach: function(context, settings) {

      if(!_.isUndefined(page_data['cta-mpp'])){
        var quickData = page_data['custom-mpp'].products;
        var $btn_quickshop = $('.action-quickview');
        $btn_quickshop.click(function(e) {
          e.preventDefault();
          var quickshopPID = $(this).attr('data-productid');
          var quickshopData = _.find(quickData, function(p){ return p.PRODUCT_ID == quickshopPID; });
          site.quickshop(quickshopData);
        });
      }

    }
  };

  /**
   * Add a class to checkout pages for a different nav bar
   */
  Drupal.behaviors.checkout_theme = {
    attach: function(context, settings) {
      var pathArray = window.location.pathname.split( '/' );
      // Show a minimal nav throughout checkout, except for the viewcart page and samples pages.
      if (pathArray[1] === 'checkout' && !(pathArray[2] === 'viewcart.tmpl' || pathArray[2] === 'samples.tmpl' || pathArray[2] === 'gwp_samples.tmpl' || pathArray[2] === 'wp_samples.tmpl')) {
        $('body').addClass('is-min-nav');
      } else if (pathArray[1] === 'checkout' && (pathArray[2] === 'viewcart.tmpl' || pathArray[2] === 'samples.tmpl' || pathArray[2] === 'gwp_samples.tmpl' || pathArray[2] === 'wp_samples.tmpl')) {
        $('body').addClass('has-mobile-checkout-nav');
      }
    } // attach
  };

  /**
   * estee edit moodboard slideshow overlay launcher
   */
  Drupal.behaviors.mb_slideshow = {
    attach: function(context, settings) {
      if (!$('.formatter-mb-slideshow').length) return;
      // share link vars
      var url = document.documentURI;
      var title = document.title;

      var twitter_url = 'http://twitter.com/intent/tweet?url=' + encodeURI(url) + '&amp;text=' + encodeURI(title) + '&amp;via=EsteeLauder';
      $('.mb-slide-share__link.twitter').attr('href', twitter_url);

      var facebook_url = 'http://www.facebook.com/sharer.php?u=' + encodeURI(url) + '&amp;t=' + encodeURI(title);
      $('.mb-slide-share__link.facebook').attr('href', facebook_url);

      // @todo debug this is grabbing the first image/first slide only
      var img = $('.mb-slideshow__slide img').attr("src");
      var pinterest_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURI(url) + '&amp;media=' + encodeURI(window.location.protocol) + '//' + encodeURI(window.location.host) + img + '&amp;description=' + encodeURI(title);
      $('.mb-slide-share__link.pinterest').attr('href', pinterest_url);

      // launch colorbox slideshow and oncomplete add what we need
      $('.mb-slides-launcher').colorbox({
        width: '100%',
        height: '100%',
        fixed: true,
        transition: 'none',
        speed: 0,
        className: 'colorbox__mb-slides',
        href: function() { return this.href + ' #main';},
        onOpen: function() {
          $(document).trigger('elc_colorboxOpen');
        },
        onClosed: function() {
          $(document).trigger('elc_colorboxClosed');
        },
        onComplete:function(){
          $('.formatter-mb-slideshow .flexslider').flexslider({
            animation: "fade",
            slideshow: false,
            controlNav: false
          });
          $('.mb-slide-share__link.twitter').attr('href', twitter_url);
          $('.mb-slide-share__link.facebook').attr('href', facebook_url);

          // Each slide inside the colorbox needs to have that image associated with it's pinterest share. All social links (Pinterest included) just need the URL from the main page.
          $('.colorbox__mb-slides .mb-slideshow__slide').each(function(i) {
            var img = $(this).find('.mb-slideshow__slide__image').attr("src");
            var pinterest_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURI(url) + '&amp;media=' + encodeURI(window.location.protocol) + '//' + encodeURI(window.location.host) + img + '&amp;description=' + encodeURI(title);
            $(this).find('.mb-slide-share__link.pinterest').attr('href', pinterest_url);
          });
        }
        });

      // responsive colorbox
      $( window ).resize(function() {
        if($('#cboxOverlay').is(':visible')){
          $.colorbox.resize({width:'100%',height:'100%'});
        }
      });

      // apply flexslider to the main node for previewing purposes
      if( $('.formatter-mb-slideshow .flexslider').length > 0 ){
        $('.formatter-mb-slideshow .flexslider').flexslider({
          animation: "fade",
          slideshow: false,
          controlNav: false
        });
      }
    } // attach
  };
  /**
   * Print this page
   */
  Drupal.behaviors.ELB_printPage = {
    attach: function(context, settings) {
      var $trigger = $('.print-link');
      $trigger.on('click', function(e) {
        e.preventDefault();
        window.print();
      });
    } // attach
  };

  /**
   * Colorbox Common Events
   */
  Drupal.behaviors.colorbox_events = {
    attach: function(context, settings) {

      $(document).on('elc_colorboxOpen', function(event, category) {
        $('body').addClass('colorbox-on');
      });
      $(document).on('elc_colorboxClosed', function(event, category) {
        $('body').removeClass('colorbox-on');
      });
    } // attach
  };

  Drupal.behaviors.ELB_fileUpload = {
    attach: function(context, settings) {
      var $uploadContainers = $('.upload-file', context);
      $uploadContainers.each(function() {
        var $fileInput = $('input[type=file]', this);
        var $fileInputImposterVal = $('.upload-file__value', this);
        if (!$fileInput.length || !$fileInputImposterVal.length) return;
        $fileInput.on('change', function(event) {
          $fileInputImposterVal.text( $(this).val().replace('C:\\fakepath\\', '') );
        });
      });
    }
  };

  Drupal.behaviors.esteelauder_common = {
    attach: function(context, settings) {
      // open multi use hero custom link in a new tab if wrapper class .custom-link-target-blank is found
      $('.custom-link-target-blank').each(function(e) {
        $(this).find('.hero-block__custom-link').attr('target','_blank');
      });
    }
  };
})(jQuery);

// Adds User Agent string as data attribute on <html> needed mainly for IE8 ~ http://css-tricks.com/ie-10-specific-styles/
var doc = document.documentElement;
doc.setAttribute('data-useragent', navigator.userAgent);
