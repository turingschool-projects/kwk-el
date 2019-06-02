
/*global prodcat*/
(function(site, $) {
  var formCaptureObj = {}, linkCaptureObj = {};
  var drupalAnalyticsSettings = Drupal.settings.analytics ? Drupal.settings.analytics.analytics_tagging_enabled : false;

  Drupal.behaviors.analyticsBehavior = {

    attached: 0,

    findElementIndex: function(arr, value) {
      return _.findIndex(arr, function(elem) {
        return elem === value;
      });
    },

    linkToPage: function() {
      window.open(linkCaptureObj.href, linkCaptureObj.target);
    },

    setLinkCapture: function(href, target) {
      linkCaptureObj.href = href;
      linkCaptureObj.target = target;
    },

    submitForm: function() {
      formCaptureObj.form.off('submit');
      formCaptureObj.form.trigger('submit');
    },

    stripOutMarkup: function(str) {
      return str.replace(/(<([^>]+)>)/ig, '');
    },

    // Accepts an array of PRODUCT_IDS, returns an array of positions
    getProductPositions: function(productIds) {
      var positions = [0];
      var self = this;
      if (prodcat && prodcat.data && prodcat.data.pids) {
        positions = productIds.map(function(element) {
          return self.findElementIndex(prodcat.data.pids, element);
        });
      }
      return positions;
    },

    // Examples of brand specific overrides for event handling

    addToCart: function(eventData) {
      site.track.addToCart(Object.assign({}, eventData));
    },

    addToFavorites: function(eventData) {
      site.track.addToFavorites(Object.assign({}, eventData));
    },

    removeFromCart: function(eventData) {
      site.track.removeFromCart(Object.assign({}, eventData));
    },

    liveChatManualInitiated: function(eventData) {
      var targetClass, nodeElement, contentName, obj;
      targetClass = $('#mpp_chat').attr('class') !== undefined && typeof $('#mpp_chat').attr('class') !== 'undefined' ? $('#mpp_chat') : '';
      if (targetClass !== '') {
        contentName = targetClass.closest('.node-elc-nodeblock').attr('trackname').replace(/\|.*/gi, '');
        nodeElement = targetClass.text().trim();
        obj = {
          event_action: contentName,
          event_category: 'Content Modules',
          event_label: nodeElement
        };
        site.track.evtLink(obj);
      }
      site.track.liveChatManualInitiated(Object.assign({}, eventData));
    },

    // End examples brand specific overrides for event handling

    attach: function(context) {
      // all code here
      var self = this;

      if (self.attached) {
        return;
      }

      // Track Brand Logo
      $('a.page-branding__logo , .js-page-logo', context).on('click', function(event) {
        var obj;
        event.preventDefault();
        self.setLinkCapture($(this).attr('href'), '_self');
        obj = {
          event_name: 'logo_click',
          event_category: 'global',
          event_action: 'logo clicked'
        };
        site.track.evtLink(obj, self.linkToPage);
      });

      //track Navigation Click
      $('.js-nav-link-trigger', context).on('click', function() {
        var navElemLast = $(this).text();
        var navTrackName = $(this).closest('.node').attr('trackname').split('|', 1);
        var promoTrackName = navTrackName[0].split(' - ');
        var promoName = promoTrackName.splice(1).join('>') + '>' + navElemLast;

        if (typeof promoName !== 'undefined' && promoName !== '') {
          site.track.navigationClick({
            promo_name: [promoName]
          });
        }
      });

      $('.menu-ref__link', context).on('click', function() {
        var promoName = $(this).text();
        if (typeof promoName !== 'undefined' && promoName !== '') {
          site.track.navigationClick({
            promo_name: [promoName]
          });
        }
      });

      // Track Product Click
      $('.js-product-brief a', context).on('click', function() {
        var prodElem = $(this).parents('.js-product-brief');
        var prodId = prodElem.attr('data-product-id');

        if (typeof prodId !== 'undefined' && prodId !== '') {
          site.track.productClick({
            product_id: [prodId]
          });
        }
      });

      // Track Quick Shop
      $(document).on('click', 'a.js-mpp_quickshop, .product_brief__button-panel, .js-quickshop-show', function() {
        var $targetElem = $(this);
        var catName = $('.main-content > article', context).attr('trackname');
        var prodElem = $targetElem.closest('.js-product-brief, .product-brief');
        var prodId = $targetElem.attr('data-product-id');
        var prodHeader = prodElem.find('.product_brief__header,.product-brief__header').text();
        var prodSubHeader = prodElem.find('.product_brief__sub-header,.product-brief__sub-header').text();
        var prodName = prodHeader + ' ' + prodSubHeader;
        var obj = {
          event_label: prodName + ' - ' + prodId,
          page_name: 'QV | ' + prodName,
          product_id: [prodId],
          product_catagory_name: [catName],
          product_price: [prodElem.find('.product_brief__price').text().replace(/\s+/g, ' ').trim()]
        };
        site.track.quickView(obj);
      });

      //Track Quick Shop 2 - Special case in EL where some pages don't have data-test-id=mpp_quickshop
      $('.js-quickshop-button, a.product_brief__button-panel', context).on('click', function() {
        var $targetElem = $(this);
        var catName = $('.content > article', context).attr('trackname');
        var prodElem = $targetElem.closest('.js-product-brief');
        var prodId = $targetElem.attr('data-product-id');
        var prodHeader = prodElem.find('.product_brief__headers').find('.product_brief__header').text();
        var prodSubHeader = prodElem.find('.product_brief__headers').find('.product_brief__sub-header').text();
        var prodName = prodHeader + ' ' + prodSubHeader;
        var obj = {
          event_label: prodName + ' - ' + prodId,
          page_name: 'QV | ' + prodName,
          product_id: [prodId],
          product_catagory_name: [catName],
          product_price: prodElem.find('.product_brief__price').text().replace(/\s+/g, ' ').trim()
        };
        site.track.quickView(obj);
      });

      // Track Predictive Search Product Click and All Results Click
      $('#typeahead-wrapper').on('click', '.product-result', function() {
        var prods = $(this);
        var prodDetail = prods.find('.product-result__name a');
        var prodName = prodDetail.text().trim();
        var prodUrl = prodDetail.attr('href');
        var prodElemID = 'PROD' + prodUrl.split('/')[3];
        var term = $('input#search').val();
        var obj;
        event.preventDefault();
        self.setLinkCapture(prodUrl, '_self');
        obj = {
          event_label: term,
          search_keyword: term,
          product_id: prodElemID,
          product_name: prodName
        };
        site.track.evtAction('searchOneResultSelected', obj, self.linkToPage);
      });

      // Track Social Icon Links
      $('.footer-social-links a').on('click', function() {
        var href = $(this).attr('href');
        var obj = {
          event_action: href,
          event_label: window.location.href
        };
        site.track.evtAction('socialLink', obj);
      });

      // CHECKOUT EVENTS
      // Track guest user checkout
      var guestUserElemets = [
        '#js_analytics_newuser_submit',
        '.new-account__submit',
        '#checkout_signin_new_user-submit',
        '#checkout_signin_guest_user-submit'
      ];
      $(document).on('click', guestUserElemets.join(', '), function() {
        var obj = {};
        site.track.evtAction('checkoutGuestUser', obj);
      });

      // Track return user checkout
      var returnUserElements = [
        '#js_analytics_return_user_submit',
        '.return-user__submit',
        '#checkout_signin-submit'
      ];
      $(document).on('click', returnUserElements.join(', '), function() {
        var obj = {};
        site.track.evtAction('checkoutReturnUser', obj);
      });

      // Track Payment Method
      var paymentElements = [
        '#checkout_billing input.btn-primary',
        '#checkout_review input.button--dark',
        'a.checkout-buttons',
        'input.js-checkout-complete',
        '#continue-checkout-btm a.checkout-buttons',
        'input#continue-checkout',
        '.js-analytics-payment',
        '.btn_continue_checkout',
        '#checkout_payment .js_analytics_payment',
        '#checkout_complete .js_analytics_payment'
      ];
      $(document).on('click', paymentElements.join(','), function() {
        var paymentLabel = '';
        var paymentTypePP = [
          'PayPal',
          'PP',
          'PAYMENT_OPTION_PAYPAL',
          'PP_PAYPAL'
        ];
        var paymentTypeCC = [
          'Credit Card',
          'CC',
          'PAYMENT_OPTION_MC',
          'PAYMENT_OPTION_VISA',
          'PAYMENT_OPTION_MAESTRO',
          'PAYMENT_OPTION_AMEX',
          'PAYMENT_OPTION_SOFORT',
          'PAYMENT_OPTION_MYBANK',
          'PAYMENT_OPTION_CARDLINK',
          'PP_MPWEB',
          'GMO',
          'SecurePay',
          'PAYMENT_OPTION_PP',
          'PAYMENT_OPTION_CC',
          'Card',
          'Pelecard'
        ];
        var paymentTypeCOD = [
          'COD',
          'PAYMENT_OPTION_COD'
        ];
        var paymentType = $('input[name=PAYMENT_METHOD]:checked').val() || $('input[name=PAYMENT_TYPE]:checked').val() || $('input[name=PAYMENT_OPTION]:checked').val() || $('input[name=PP_NAME]:checked').val() || $('input[name=PP_PAYMENT_METHOD]:checked').val() || $('#form--checkout_payment_type--field--PAYMENT_OPTION').val();
        if ($.inArray(paymentType, paymentTypePP) > -1) {
          paymentLabel = 'paypal';
        } else if ($.inArray(paymentType, paymentTypeCC) > -1) {
          paymentLabel = 'creditcard';
        } else if ($.inArray(paymentType, paymentTypeCOD) > -1) {
          paymentLabel = 'cashondelivery';
        }
        var obj = {
          event_label: paymentLabel
        };
        if (paymentLabel.length !== 0) {
          site.track.evtAction('checkoutPaymentSelected', obj);
        }
      });

      // Track Paypal Express Check-out
      $('a.paypal-checkout').on('click', function() {
        var obj = {
          event_label: 'paypal'
        };
        site.track.evtAction('checkoutPaymentSelected', obj);
      });

      // END CHECKOUT EVENTS

      // Thumbnail for product pages
      $(document).on('SLICKCHANGE', function(e, data) {
        var thumbnail = '';
        var thumbnailaction = '';
        var obj = '';
        var productname = '';
        var prodid = '';
        if (typeof data !== 'undefined' && data !== '') {
          thumbnail = data.getAttribute('class');
          productname = $('.js-prod-header').text() + ' ' + $('.js-prod-sub-header').text();
          prodid = $('.product-full__images , .spp-product__images').data('productId');
          thumbnailaction = thumbnail.replace(/((product-full__image|spp-product__image)|(slick.*))/gi, '');
          thumbnailaction = thumbnailaction.match(/video/gi) ? ' js-prod-level-video' : thumbnailaction;
          if (thumbnail.match(/js-sku-level-image|js-prod-level-image|video/gi)) {
            obj = {
              'event_category': 'Product Thumbnail Clicks',
              'event_action': 'alt image' + thumbnailaction,
              'event_label': productname + ' - ' + prodid
            };
            site.track.evtLink(obj);
          }
        }
      });

      // Content Module Shopnow , Explore More, Read article, Play Button, Watch Now, Embed Play Button, Chat Now, Read Review, Read Rage Review, Quick Shop For Content Modules
      var contentModule = [
        '.js-module-block-container .js-button',
        '.js-chat p a',
        '.js-hero-block-wrapper .button.cta',
        '.js-hero-block-wrapper .js-button',
        '.ee-landing__tile .link--bold',
        '.field-content .lets-talk-button'
      ];
      $(contentModule.join(', ')).on('click', function() {
        var contentLink, contentName, contentText, getClass, obj;
        var prod = $(this);
        getClass = typeof prod.attr('class') !== 'undefined' ? prod.attr('class') : '';
        contentText = prod.text().toUpperCase().trim();
        contentLink = contentText !== '' ? contentText : 'PLAY BUTTON';
        contentLink = getClass.match(/cboxElement/gi) ? 'EMBEDDED PLAY BUTTON' : contentLink;
        contentName = prod.closest('.node-elc-nodeblock, .node-page').attr('trackname').split('|')[1];
        obj = {
          'event_category': 'Content Modules',
          'event_action': contentName,
          'event_label': contentLink
        };
        site.track.evtLink(obj);
      });

      // MPP Exposed Shade Filter tracking
      $('#mpp_filter_dropdown_1_select,#mpp_filter_dropdown_2_select', context).on('change', function() {
        var shadeText, id, shadeTextDrop, obj;
        shadeText = $('option:selected', this).text();
        id = $(this).attr('id');
        shadeTextDrop = id === 'mpp_filter_dropdown_1_select' ? 'Dropdown-1' : 'Dropdown-2';
        if (shadeText !== '(Select Coverage)' && shadeText !== '(Select Finish)') {
          obj = {
            'event_category': 'filter & sort selection',
            'event_action': 'filter - MPP Product Filter',
            'event_label': shadeTextDrop + ' - ' + shadeText
          };
          site.track.evtLink(obj);
        }
      });

      //SPP Filter Interaction
      $('.js-spp-filter', context).on('click', function() {
        var obj, shadeText;
        shadeText = $(this).text();
        obj = {
          'event_category': 'filter & sort selection ',
          'event_action': 'filter - SPP Shade Filter',
          'event_label': shadeText
        };
        site.track.evtLink(obj);
      });

      //Foundation Finder tracking
      $(window).on('load', function() {
        if ($('body').hasClass('foundation-finder-page') && drupalAnalyticsSettings) {
          trackFoundationFinder();
        }
      });

      function trackFoundationFinder() {
        var eventLabel, foundationId;

        $('.ff-quiz__slide', context).each(function(key) {
          $(this).attr('data-id', key);
        });

        function getfoundationName(findElement) {
          var $foundationDomElement, foundationName;
          $foundationDomElement = $('.ff-quiz__nav-item', context)[findElement];
          foundationName = $($foundationDomElement).find('.ff-quiz__nav-label').text().trim();
          return foundationName;
        }

        initFoundationFinder();

        function trackStartState() {
          var $foundationElement = $('.ff-quiz__slide--1', context);
          if ($foundationElement.hasClass('slick-active') || $foundationElement.hasClass('active')) {
            foundationId = $('.ff-quiz__slide--1', context).data('id');
            eventLabel = 'Initiated | ' + getfoundationName(foundationId);
            trackEventState('foundationfinder_start', eventLabel);
          }
        }

        function trackNextState() {
          $('.ff-quiz__button--next', context).on('click', function() {
            var $foundationButtonElement = $(this);
            if ($foundationButtonElement.is('.ff-quiz__button--results') || $foundationButtonElement.is('.active') && $foundationButtonElement.children().is('.ff-quiz__button-text--results')) {
              trackEventState('foundationfinder_complete', 'Completed');
            }
            $('.ff-quiz__slide', context).each(function() {
              var $foundationSlideElement, foundationStep;
              $foundationSlideElement = $(this);
              if (($foundationSlideElement.is('.slick-active') || $foundationSlideElement.is('.active')) && !$foundationButtonElement.is('.ff-quiz__button--results')) {
                foundationId = $foundationSlideElement.data('id');
                foundationStep = 'foundationStep_' + (foundationId + 1);
                eventLabel = 'Initiated | ' + getfoundationName(foundationId);
                trackEventState(foundationStep, eventLabel);
              }
            });
          });
        }

        function trackStartOver() {
          $('.ff-quiz__start-over-link', context).on('click', function() {
            foundationId = $('.ff-quiz__slide.slick-active', context).data('id');
            eventLabel = 'Initiated | ' + getfoundationName(foundationId);
            trackEventState('foundationfinder_start', eventLabel);
          });
        }

        function trackEventState(name, label) {
          var obj = {
            event_name: name,
            event_category: 'foundation finder',
            event_action: 'diagnostic',
            event_label: label
          };
          site.track.evtLink(obj);
        }

        function initFoundationFinder() {
          trackStartState();
          trackNextState();
          trackStartOver();
        }
      }

      //Moisturizer Quiz Tagging start
      if ($('body').hasClass('section-skin-care') && drupalAnalyticsSettings) {
        trackMoisturizerTagging();
      }

      function trackMoisturizerTagging() {
        $('.js-quiz-question', context).each(function(key) {
          $(this).attr('data-id', key);
        });

        var quizStep;
        initMoisturizerTagging();

        function trackQuizStartTagging() {
          $('.js-btn-init-quiz', context).once('js-quiz-start').each(function() {
            var $quizStartElem = $(this);
            $quizStartElem.on('click', function() {
              trackMoisturizerEvent('start', 'click');
              trackMoisturizerEvent('step 1', 'load');
            });
          });
        }

        function trackQuiztagging() {
          $('.js-panel-quiz .js-btn-next', context).once('js-Quiz-tagging').each(function() {
            var $quizElem = $(this);
            $quizElem.on('click', function() {
              var $quizParentElem = $quizElem.closest('.js-panel-quiz');
              var quizval = $quizParentElem.find('.mr-question--current .mr-question__option--selected').text();
              quizStep = $quizParentElem.find('.mr-question--current').data('id');
              trackMoisturizerEvent('step ' + (quizStep + 1), 'answer | ' + quizval);
              if ($quizElem.text().trim() !== 'Show Results') {
                trackMoisturizerEvent('step ' + (quizStep + 2), 'load');
              }
            });
          });
        }

        function trackQuizBackTagging() {
          $('.mr-actions__back', context).once('js-quiz-back').each(function() {
            var $quizBackElem = $(this);
            $quizBackElem.on('click', function() {
              trackMoisturizerEvent('step ' + (quizStep + 1), 'back');
            });
          });
        }

        function trackQuizRestartTagging() {
          $('.js-btn-restart', context).once('js-quiz-restart').each(function() {
            var $quizRestartElem = $(this);
            $quizRestartElem.on('click', function() {
              trackMoisturizerEvent('step 1', $quizRestartElem.text().trim());
            });
          });
        }

        function trackQuizResultTagging() {
          $(document).on('click', '.js-results-wrapper .mr-result__cta-wrapper a', function() {
            trackMoisturizerEvent('step ' + (quizStep + 2), $(this).text().trim());
          });
        }

        function tracktestTagging() {
          $(document).on('Quizresult', function(event, data) {
            var resultLabel;
            for (var i = 0; i < data.results.length; i++) {
              var $quizResultParent = data.results[i].children('.mr-result__copy');
              var quizResultHeader = $quizResultParent.children('.product-brief__header').text().trim();
              var quizsubHeader = $quizResultParent.children('.product-brief__sub-header').text().trim();
              var quizResult = quizResultHeader + quizsubHeader;
              resultLabel = i === 0 ? quizResult : resultLabel + ' | ' + quizResult;
            }
            trackMoisturizerEvent('Complete', resultLabel);
          });
        }

        function trackMoisturizerEvent(action, label) {
          var obj = {
            event_name: 'moisturizer quiz',
            event_category: 'moisturizer quiz',
            event_action: action,
            event_label: label
          };
          site.track.evtLink(obj);
        }

        function initMoisturizerTagging() {
          trackQuizStartTagging();
          trackQuiztagging();
          trackQuizBackTagging();
          trackQuizRestartTagging();
          trackQuizResultTagging();
          tracktestTagging();
        }
      }
      //Moisturizer Quiz Tagging end

      //Moisturizer Myth Tagging start
      if ($('body').hasClass('section-skin-care') && drupalAnalyticsSettings) {
        $('.js-btn-true-false', context).once('js-myth').each(function() {
          var $mythElem = $(this);
          $mythElem.on('click', function() {
            var $trackNameElem = $mythElem.closest('.js-product-grid__tout');
            var trackName = $trackNameElem.children('div').attr('trackname');
            var eventLabel = trackName.split('|')[0];
            var obj = {
              event_name: 'content modules myth',
              event_category: 'content modules',
              event_action: 'Myth vs Reality',
              event_label: eventLabel
            };
            site.track.evtLink(obj);
          });
        });
      }
      //Moisturizer Myth Tagging end

      self.attached = 1;
    }
  };
}(window.site || {}, jQuery));
