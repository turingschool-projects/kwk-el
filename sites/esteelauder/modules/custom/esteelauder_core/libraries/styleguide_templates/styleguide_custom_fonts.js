
(function ($) {
  Drupal.behaviors.styleguide_custom_fonts = {
    attach: function ($this, settings) {
      $('.main-content', $this).once(function () {
        /*
        /--------------------------------------------------------------------------
        / Apply approximate vw values to custom font-sizes below 1366 screen width.
        /--------------------------------------------------------------------------
        */
        // Headlines
        // Store the initial and updated font-sizes.
        var headlineSizes = [];
        var newHeadlineSizes = [];
        var mobHeadlineSizes = [];
        var custom_headline = false;
        var thisHeadline = $('h1.headline_content__headline.custom_size');
        if (thisHeadline[0]) {
          custom_headline = true;
        }

        function grabHeadlines() {
          thisHeadline.each(function (index) {
            // Grab the custom font-size, sans px, of each headline.
            var headlineSize = parseFloat($(this).css('font-size'));

            // Calculate the vw value it should be at 1366px.
            // 1.000733 brings it closest to the original font size.
            // 1366 is the breakpoint.
            var newHeadlineSize = (((100 / 1366) * headlineSize) * 1.000733).toFixed(6);

            // Calculate the vw value it should be at 640px.
            // 1.198438 brings it closest to the original font size.
            // 767 is the breakpoint.
            var newMobHeadlineSize = (((100 / 767) * headlineSize) * 1.198438).toFixed(6);

            // Push these values.
            headlineSizes.push(headlineSize);
            newHeadlineSizes.push(newHeadlineSize);
            mobHeadlineSizes.push(newMobHeadlineSize);
          });
        }

        // Credits
        // Store the initial and updated font-sizes.
        var creditSizes = [];
        var newCreditSizes = [];
        var mobCreditSizes = [];
        var custom_credit = false;
        var thisCredit = $("div.headline_content__credit.custom_size");
        if (thisCredit[0]) {
          custom_credit = true;
        }

        function grabCredits() {
          thisCredit.each(function (index) {
            // Grab the custom font-size, sans px, of each headline.
            var creditSize = parseFloat($(this).css('font-size'));

            // Calculate the vw value it should be at 1366px.
            // 1.000733 brings it closer to the original font size.
            // 1366 is the breakpoint.
            var newCreditSize = (((100 / 1366) * creditSize) * 1.000733).toFixed(6);

            // Calculate the vw value it should be at 640px.
            // 1.198438 brings it closest to the original font size.
            // 767 is the breakpoint.
            var newMobCreditSize = (((100 / 767) * creditSize) * 1.198438).toFixed(6);

            // Push these values.
            creditSizes.push(creditSize);
            newCreditSizes.push(newCreditSize);
            mobCreditSizes.push(newMobCreditSize);
          });
        }

        // Set the initial value on page load - Headline(s).
        function initialHeadlines() {
          if ($(window).width() >= 1366) {
            thisHeadline.each(function (index) {
              $(this).addClass('font_size_desktop').removeClass('font_size_tablet font_font_size_mob');
              $(this).css('font-size', headlineSizes[index] + 'px');
            });
          } else if ($(window).width() > 767 && $(window).width() < 1366) {
            thisHeadline.each(function (index) {
              $(this).addClass('font_size_tablet').removeClass('font_size_desktop font_size_mob');
              $(this).css('font-size', newHeadlineSizes[index] + 'vw');
            });
          } else if ($(window).width() <= 767) {
            thisHeadline.each(function (index) {
              $(this).addClass('font_size_mob').removeClass('font_size_desktop font_size_tablet');
              $(this).css('font-size', mobHeadlineSizes[index] + 'vw');
            });
          }
        }

        // Set the initial value on page load - Credit(s).
        function initialCredits() {
          if ($(window).width() >= 1366) {
            thisCredit.each(function (index) {
              $(this).addClass('font_size_desktop').removeClass('font_size_tablet font_font_size_mob');
              $(this).css('font-size', creditSizes[index] + 'px');
            });
          } else if ($(window).width() > 767 && $(window).width() < 1366) {
            thisCredit.each(function (index) {
              $(this).addClass('font_size_tablet').removeClass('font_size_desktop font_size_mob');
              $(this).css('font-size', newCreditSizes[index] + 'vw');
            });
          } else if ($(window).width() <= 767) {
            thisCredit.each(function (index) {
              $(this).addClass('font_size_mob').removeClass('font_size_desktop font_size_tablet');
              $(this).css('font-size', mobCreditSizes[index] + 'vw');
            });
          }
        }

        // Apply the updated values as required.
        function applySizes() {
          if ($(window).width() >= 1366) {
            if (custom_headline) {
              thisHeadline.each(function (index) {
                // Only update if it hasn't already been updated.
                if ($(this).is('.font_size_tablet, .font_size_mob')) {
                  $(this).addClass('font_size_desktop').removeClass('font_size_tablet font_size_mob');
                  $(this).css('font-size', headlineSizes[index] + 'px');
                }
              });
            }
            if (custom_credit) {
              thisCredit.each(function (index) {
                // Only update if it hasn't already been updated.
                if ($(this).is('.font_size_tablet, .font_size_mob')) {
                  $(this).addClass('font_size_desktop').removeClass('font_size_tablet font_size_mob');
                  $(this).css('font-size', creditSizes[index] + 'px');
                } else {
                  return;
                }
              });
            }
          } else if ($(window).width() > 767 && $(window).width() < 1366) {
            if (custom_headline) {
              thisHeadline.each(function (index) {
                // Only update if it hasn't already been updated.
                if ($(this).is('.font_size_desktop, .font_size_mob')) {
                  $(this).addClass('font_size_tablet').removeClass('font_size_desktop font_size_mob');
                  $(this).css('font-size', newHeadlineSizes[index] + 'vw');
                }
              });
            }
            if (custom_credit) {
              thisCredit.each(function (index) {
                // Only update if it hasn't already been updated.
                if ($(this).is('.font_size_desktop, .font_size_mob')) {
                  $(this).addClass('font_size_tablet').removeClass('font_size_desktop font_size_mob');
                  $(this).css('font-size', newCreditSizes[index] + 'vw');
                } else {
                  return;
                }
              });
            }
          } else
          if ($(window).width() <= 767) {
            if (custom_headline) {
              thisHeadline.each(function (index) {
                // Only update if it hasn't already been updated.
                if ($(this).is('.font_size_desktop, .font_size_tablet')) {
                  $(this).addClass('font_size_mob').removeClass('font_size_desktop font_size_tablet');
                  $(this).css('font-size', mobHeadlineSizes[index] + 'vw');
                } else {
                  return;
                }
              });
            }
            if (custom_credit) {
              thisCredit.each(function (index) {
                // Only update if it hasn't already been updated.
                if ($(this).is('.font_size_desktop, .font_size_tablet')) {
                  $(this).addClass('font_size_mob').removeClass('font_size_desktop font_size_tablet');
                  $(this).css('font-size', mobCreditSizes[index] + 'vw');
                } else {
                  return;
                }
              });
            }
          }
        }

        function listen() {
          listen.called = true;
          // Update the font sizes for responsiveness.
          // Listen for window resizing.
          var resizeTimer;

          $(window).on('resize', function () {
            // Throttle/ debounce resize event:
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
              // Resizing has "stopped"
              applySizes();
            }, 50);
          });

          // On first load, without resizing event:
          applySizes();
        }

        if (custom_headline) {
          grabHeadlines();
          initialHeadlines();
          listen();
        }

        if (custom_credit) {
          grabCredits();
          initialCredits();
          listen();
        }
      });
    }
  };
})(jQuery);
