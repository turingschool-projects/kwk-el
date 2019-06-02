
(function($) {

  /**
   * Generic behaviors for every page load that don't need their own behavior
   */
  Drupal.behaviors.ELBPC = {
    attach: function(context, settings) {
      // Use mustache-style templating with underscore:
      _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
      };

      // Detect IE and inject class to body tag
      function detectIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        var trident = ua.indexOf('Trident/');

        if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        if (trident > 0) {
          // IE 11 (or newer) => return version number
          var rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        // other browser
        return false;
      }

      if (detectIE()) {
        var ieVersion = 'ie-' + detectIE();
        $('body').addClass('ie').addClass(ieVersion);
      } else {
        $('body').addClass('not-ie');
      }


    } // attach
  };

  /**
   * Footer behaviors
   */
  Drupal.behaviors.ELBPC_footer = {
    attach: function(context, settings) {
      var $footerMenus = $('.footer-links-sitewide-footer-menu-grouping-elc-nodeblock .menu-reference');
      var $footerMenuHeaders = $('.footer-links-sitewide-footer-menu-grouping-elc-nodeblock .footer-header');
      $footerMenuHeaders.click(function(event) {
        if(Drupal.ELB.ui.mq.medium_only){
          var $footerMenu = $(this).parents('.menu-reference');
          if($footerMenu.hasClass('is_open')){
            $footerMenus.show();
            $footerMenus.last().hide();
            $footerMenu.removeClass('is_open',200,function(){
              // $('html, body').animate({scrollTop:$(document).height()}, 500);
              // return false;
            });
          }else{
            $footerMenus.hide();
            $footerMenu.show();
            $footerMenu.addClass('is_open',200,function(){
              // $('html, body').animate({scrollTop:$(document).height()}, 500);
              // return false;
            });
          }
        }
      });
    }
  };

  /**
   * Back to top widget functionality
   *
   * Styleguide pg.168
   *
   * TODO: use Modernizr to test for opacity, otherwise just hide/show
   */
  Drupal.behaviors.ELBPC_toTop = {
    attach: function(context, settings) {

      var $back_top_el = $('.back-to-top');
      var $spp_mini_bag = $('.spp-product__mini-bag');

      if($spp_mini_bag.length){
        //console.log('$spp_mini_bag: ' + $spp_mini_bag.outerHeight());
        var miniBagHeightOffset = $spp_mini_bag.outerHeight() + 65;
        var topBottom = miniBagHeightOffset + 'px';
        $back_top_el.css('bottom',topBottom);
      }
      // Trigger when we're not at top
      $('.spp-product__details').waypoint(function(direction) {
        if(direction == 'down'){
          $back_top_el.toggleClass('back-to-top-show');
        }
        else{
          // show back to top, this toggles just fine whether up or down
          $back_top_el.removeClass('back-to-top-show');
        }
      }, { offset: 'bottom-in-view' });

      // scroll to top
      $back_top_el.on('click', function(event){
        $.scrollTo('0px', Drupal.ELB.ui.back_top_duration);
      });

      // hide/show when nav is open/closed
      $(document).on('navOpen', function(event, category) {
        $back_top_el.addClass('hidden');
      });
      $(document).on('navClose', function(event, category) {
        $back_top_el.removeClass('hidden');
      });
    } // attach
  };

  /**
   * Input Functionality
   *
   * Styleguide pg.177 and batch 2 styleguide p.73
   */
  Drupal.behaviors.formTextInputs = {
    attach: function(context, settings) {
      var $formTextInputs = $('.form-text, input.field[type="text"], input.field[type="tel"], input.field[type="password"], textarea', context).not('.no-events');

      $formTextInputs.on({
        'focus.formTextInputs': function() {
          $(this).addClass('filled-in').attr('placeholder', '');
        },
        'blur.formTextInputs': function() {
          if ($(this).val() === '') {
            if($(this).hasClass('js-label-mode') || $(this).hasClass('js-placeholder-mode')) {
               $(this).attr('placeholder','');
            }else {
               $(this).removeClass('filled-in').attr('placeholder', $(this).data('placeholder'));
            }
          } else {
            $(this).addClass('filled-in');
          }
        }
      });

      $formTextInputs.each(function() {
        $(this).data('placeholder', $(this).attr('placeholder'));
      }).filter(function(){
        return !!this.value.length;
      }).addClass('filled-in').attr('placeholder', '');

    },
    detach: function(context, settings) {
      var $formTextInputs = $('.form-text, input.field[type="text"], input.field[type="password"]', context);
      $formTextInputs.off('.formTextInputs').removeData('placeholder');
    }
  };

  Drupal.behaviors.ELBPC_selectBoxes = {
    attach: function(context, settings) {
      // Initiate all selectboxes
      // $('select.selectbox').selectBox();
      Drupal.ELB.applySelectBoxes();
    }
  };

  /**
   * PC-Tablet specific search block interface behaviors
   */
  Drupal.behaviors.ELBPC_searchBlock = {
    attach: function(context, settings) {

      var $header = $('.page-header'),
          $footer = $('.page-footer'),
          $block = $('.el-search-block'),
          alternate_color = $('.perlgem-search-block', $block).data('alt-color') || '';

      if (alternate_color !== '') {
        $header.addClass(alternate_color);
      }
      // Close search when we click away
      $('html').on('click', function() {
        // if search is open, close it
        if (Drupal.ELB.ui.search_open) {
          $(document).trigger('searchClose');
        }
      });

      // Prevent header clicks from propagating to html tag
      $header.on('click', function(event) {
        event.stopPropagation();
      });

      // Search toggle on button click
      $header.on('click', '.page-utilities__search-button', function(event) {
        event.preventDefault();

        if (Drupal.ELB.ui.search_open) {
          // close if open
          $(document).trigger('searchClose');
        }
        else {
          // open if closed
          $(document).trigger('searchOpen');
        }
      });

      /**
       * React to searchOpen event
       */
      $(document).on('searchOpen', function(event) {
        Drupal.ELB.ui.search_open = true;

        // close all open nav
        $(document).trigger('navClose');
        // add custom search class onto header, with alt state
        $header.addClass(Drupal.ELB.ui.alt_class).addClass(Drupal.ELB.ui.search_class);

        // endeca search may happen here
        //remove input from search, reset typeahead
        $('input#search').val('');
        $('#typeahead-wrapper').hide();
        $('.el-search-block__links').show();

        $footer.fadeOut();
        // $block.fadeIn();
        $('#search').focus();
      });

      /**
       * React to searchClose event
       */
      $(document).on('searchClose', function(event) {
        Drupal.ELB.ui.search_open = false;

        // remove active header class
        $header.removeClass(Drupal.ELB.ui.alt_class).removeClass(Drupal.ELB.ui.search_class);

        // $block.fadeOut();
        $footer.fadeIn();
      });

      // submit using our faux button
      $('.el-search-block__btn-submit').click(function(e) {
        e.preventDefault();
        $('#perlgem-search-form').submit();
      });

    } // attach
  };

  /**
   * confirm wishlist addition
   */
  Drupal.behaviors.ELBPC_wishlistConfirm = {
    attach: function(context, settings) {
      if (typeof site.wishlistConfirm != 'undefined') {
        site.wishlistConfirm.init();
      }
    }
  };

  /**
   * estee edit moodboard slideshow overlay launcher
   */
  Drupal.behaviors.mb_slideshow = {
    attach: function(context, settings) {
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
          $('body').addClass('colorbox-on');
        },
        onClosed: function() {
          $('body').removeClass('colorbox-on');
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
          // commenting this out due to this causing buggy behavior
          // $.colorbox.resize({width:'100%',height:'100%'});
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
   * iframe boutique overlay launcher
   */
  Drupal.behaviors.iframe_boutique = {
    attach: function(context, settings) {
      // iframe version of boutique lunches in colorbox
      // @todo temporary fix for ipad - only target colorbox
      // to no-touch devices
      $('.no-touch .boutique-launcher').click(function () {
		$(this).data('origin', $(window).scrollTop());
		$(window).scrollTop(0);
	}).colorbox({
        iframe:true,
        transition:'fade',
        width: '100%',
        height: '100%',
       	//fixed: false,
       	//top: '0px',
	//left: '0px',
	//right: '0px',
	//reposition: false,
	scrolling : false,
        className: 'colorbox__boutique',
        onOpen: function() {
         // $(document).trigger('elc_colorboxOpen');
        },
        onClosed: function() {
         // $(document).trigger('elc_colorboxClosed');
        }
      });
      // launch the url in a new page for touch devices
      $('.touch .boutique-launcher').attr('target', '_blank');

	// Colorbox: setup iframe auto-resize
	$(document).on('cbox_complete', function () {
		var $catbox_iframe, catbox_width, catbox_innerHeight;

		// url_origin(string): Devine origin portion of a URL (protocol + hostname + port)
		function url_origin(url) {
			if (typeof url !== 'string') return false;
			var a = document.createElement('a'), protocol, host;
			a.href= url;
			protocol = (a.protocol.indexOf('http') !== -1)? a.protocol : window.location.protocol;
			host = (a.host !== '')? a.host : window.location.host;
			return protocol + '//' + host;
		}

		// Select Colorbox iframe
		$catbox_iframe = $('iframe.cboxIframe');

		// Check iframe and origin
		if (!$catbox_iframe.length || url_origin($catbox_iframe[0].src) !== window.location.protocol + '//' + window.location.host) return;

		// Set onload event
		$catbox_iframe.on('load', function () {

			$(window).trigger('resize.catbox');

			// Catch late loads
			setTimeout(function () {
				$(window).trigger('resize.catbox');
			}, 1000);
		});

		// Get Colorbox width
		catbox_width = $.colorbox.element().data()['colorbox']['width'];

		// Update iframe height to match content height continually
		$(window).on('resize.catbox', function () {
			catbox_innerHeight = $catbox_iframe.contents().find('body').height();

			$.colorbox.resize({
				'innerHeight' : catbox_innerHeight,
				'width' : catbox_width
			});
		});

	// Colorbox: remove iframe auto-resize
	}).on('cbox_closed', function () {
		$(window).off('resize.catbox');
		$(window).scrollTop($.colorbox.element().data('origin'));
	});


      // parse URL to load boutique
      // uses Purl.js
      var url_boutique = $.purl_url();
      if (url_boutique.fsegment(1) === 'boutique') {
        // grab the link
        var boutiqueLink = $('#' + url_boutique.fsegment(2) + ' > a');

        // if there is an additional segment on the url, pass it through as hashtags on the boutique link, for deep linking in the iframe
        // like /#/boutique/boutique-id-pcenvy/choose, 'choose' gets passed to the url
        if ( url_boutique.fsegment(3) ){
            boutiqueLink.attr('href', boutiqueLink.attr('href')+'#'+url_boutique.fsegment(3) );
        }

        // click it!
        boutiqueLink.click();
      }

    } // attach
  };

  /**
   * youtube video overlay launcher
   */
  Drupal.behaviors.video_youtube = {
    attach: function(context, settings) {
      $('.video-launcher').colorbox({iframe:true, width: '100%', height: '100%', className: 'colorbox__youtube'});
      $('.video-launcher').each(function(e) {
        var youtube_src = $(this).attr('href');
        youtube_src += "?autoplay=1";
        $(this).attr('href', youtube_src);
      });

      // deeplink to autoplay video
      var isAutoPlay = window.location.hash.substr(1);
      if (isAutoPlay == "video-autoplay") {
        $('.hero-block-wrapper:not(.cancel-autoplay)').each(function() {
          $(this).find('.video-launcher').trigger('click');
        });
      }

    } // attach
  };

  /**
   * Samples equal height
   */
  Drupal.behaviors.checkout_heights = {
    attach: function(context, settings) {
      site.product.view.equalRowHeight($('.samples li.product'));
      site.product.view.equalRowHeight($('.sample-product-list li.sample-product.mpp__product'));
      site.product.view.equalRowHeight($('.recommended-products-panel .recommended-item'));
    }
  };

  /**
   * Multi Hero positioning debug layer
   */
  Drupal.behaviors.multihero_debug_layer = {
    attach: function(context, settings) {

      function getQueryString() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
        }
        return vars;
      }
      // load the appropriate debug image
      // we use once() to prevent ajax from re-triggering this event
      var herotest = getQueryString()['herotest'],
      $heroImage = $('.hero-block__hero');
      if (herotest == 'small') {
        $heroImage.once(this).prepend('<div style="position: absolute;z-index: 2;width: 100%;"><img style="width: 100%;opacity: .5;" src="/media/multi_hero_tools/multihero-debug-sm.png" /></div>');
      }
      if (herotest == 'medium') {
        $heroImage.once(this).prepend('<div style="position: absolute;z-index: 2;width: 100%;"><img style="width: 100%;opacity: .5;" src="/media/multi_hero_tools/multihero-debug-med.png" /></div>');
      }
      if (herotest == 'mediumplus') {
        $heroImage.once(this).prepend('<div style="position: absolute;z-index: 2;width: 100%;"><img style="width: 100%;opacity: .5;" src="/media/multi_hero_tools/multihero-debug-medplus.png" /></div>');
      }
      if (herotest == 'large') {
        $heroImage.once(this).prepend('<div style="position: absolute;z-index: 2;width: 100%;"><img style="width: 100%;opacity: .5;" src="/media/multi_hero_tools/multihero-debug-large.png" /></div>');
      }

    }
  };


})(jQuery);
