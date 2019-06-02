
(function($) {
  Drupal.behaviors.styleguide_multi_use_homepage_v1 = {
    attach: function(context) {
      $('.main-content', context).once(function() {
        function inlineVideo($this) {
          var breakpoint = 768,
              $loopingVid = $this.find('.looping_vidContent'),
              $loopingVidWrapper = $loopingVid.closest('.autoplay_video'),
              $muteBtn = $this.find('.auto_vid_vol_icon_src'),
              $modPicSrs = $loopingVidWrapper.siblings('.module_block__imgs'),
              $modBlockImg = $modPicSrs.children('img'),
              $desktopImgSrsSet = $modPicSrs.find('.module_block__imgs_desktop'),
              $desktopImgSrsAttr = $desktopImgSrsSet.attr('srcset'),
              $mobImgSrsSet = $modPicSrs.find('.module_block__imgs_mob'),
              mobImgSrsAttr = $mobImgSrsSet.attr('srcset'),
              hasLoopingVid, mobileVideo, desktopVideo,
              $mobileLoopingVidAttr = $loopingVid.attr('data-mob-src'),
              $desktopLoopingVidAttr = $loopingVid.attr('data-desktop-src'),
              vidSource,
              desktopSrcActive = false,
              mobSrcActive = false,
              desktopVidSrc,
              mobVidSrc,
              vidSrcTimer;

          // If there's no PC image & there is a Mobile image for the module instance,
          // we need to adjust the CSS to account for the inline video.
          function mobModImages() {
            if (($desktopImgSrsAttr === '' || $desktopImgSrsAttr === 'unknown') && mobImgSrsAttr.length > 0) {
              $modBlockImg.addClass('desktopImgSrsSet');
            } else {
              return;
            }
          }

          // If there's no PC image & no Mobile image for the module instance,
          // we need to adjust the CSS to account for the inline video.
          function checkModImages() {
            if (($desktopImgSrsAttr === '' || $desktopImgSrsAttr === 'unknown') && (mobImgSrsAttr === '' || mobImgSrsAttr === 'unknown')) {
              $modBlockImg.addClass('desktopMobImgSrsSet');
            } else {
              mobModImages();
            }
          }

          function checkLoad($thisVid) {
            var readyState = setInterval(function() {
              if ($thisVid.get(0).readyState > 0) {
                clearInterval(readyState);

                // Fade in the video once ready.
                $thisVid.addClass('fadeElemIn');
                $muteBtn.addClass('fadeElemIn');
                $thisVid.get(0).play();
                $modPicSrs.addClass('fadeElemOut');
              }
            }, 10);
          }

          // Handle desktop/mobile video source
          // for responsiveness.
          function initVid(src, $thisVid) {
            vidSource.attr('src', src);
            if ($thisVid) {
              $thisVid.get(0).load();
              checkLoad($thisVid);
            }
          }

          function mobDesktopVidGreaterBreakpoint($thisVid) {
            mobSrcActive = false;
            // Only update if it hasn't already been updated.
            if (!desktopSrcActive) {
              desktopSrcActive = true;
              initVid(desktopVidSrc, $thisVid);
            } else {
              return;
            }
          }

          function mobDesktopVidLessBreakpoint($thisVid) {
            desktopSrcActive = false;
            // Only update if it hasn't already been updated.
            if (!mobSrcActive) {
              mobSrcActive = true;
              initVid(mobVidSrc, $thisVid);
            } else {
              return;
            }
          }

          function desktopVidGreaterBreakpoint($thisVid) {
            $modPicSrs.addClass('fadeElemOut');
            // Only update if it hasn't already been updated.
            if (!desktopSrcActive) {
              desktopSrcActive = true;
              initVid(desktopVidSrc, $thisVid);
            } else {
              return;
            }
          }

          function desktopVidLessBreakpoint() {
            $modPicSrs.removeClass('fadeElemOut');
            desktopSrcActive = false;
            initVid('');
          }

          // If we have a mobile video along with a desktop video,
          // we need to handle the source according to window size.
          function desktopVidMobileCheck($thisVid) {
            if ($(window).width() >= breakpoint) {
              mobDesktopVidGreaterBreakpoint($thisVid);
            } else {
              mobDesktopVidLessBreakpoint($thisVid);
            }
          }

          // If we have no mobile video and only a desktop video,
          // we need to handle the source according to window size.
          function desktopVidCheck($thisVid) {
            if ($(window).width() >= breakpoint) {
              desktopVidGreaterBreakpoint($thisVid);
            } else {
              desktopVidLessBreakpoint();
            }
          }

          // Video src has determined to be desktop initially.
          function desktopVid($thisVid) {
            if (mobileVideo) {
              desktopVidMobileCheck($thisVid);
            } else {
              desktopVidCheck($thisVid);
            }
          }

          // Mobile Videos.
          function mobLessBreakpoint($thisVid) {
            $modPicSrs.addClass('fadeElemOut');
            // Only update if it hasn't already been updated.
            if (!mobSrcActive) {
              mobSrcActive = true;
              initVid(mobVidSrc, $thisVid);
            } else {
              return;
            }
          }

          function mobGreaterBreakpoint() {
            $modPicSrs.removeClass('fadeElemOut');
            mobSrcActive = false;
            initVid('');
          }

          function mobileVid($thisVid) {
            if ($(window).width() < breakpoint) {
              mobLessBreakpoint($thisVid);
            } else {
              mobGreaterBreakpoint();
            }
          }

          // Manage video functionality.
          function handleVidSrc($thisVid) {
            if (desktopVideo) {
              desktopVid($thisVid);
            } else if (mobileVideo) {
              mobileVid($thisVid);
            }
          }

          function muting($thisVid) {
            $muteBtn.on('click', function() {
              $muteBtn.toggleClass('muteBtnActive');
              if ($thisVid.get(0).muted === false) {
                $thisVid.get(0).muted = true;
              } else {
                $thisVid.get(0).muted = false;
                $thisVid.get(0).volume = 0.7;
              }
            });
          }

          function whichVidPairActive(whichVid) {
            if (whichVid === 'desktopVideoType') {
              $loopingVidWrapper.addClass('desktop_auto_loop');
              hasLoopingVid = desktopVideo = true;
              mobileVideo = false;
            } else if (whichVid === 'mobileVideoType') {
              $loopingVidWrapper.addClass('mob_auto_loop');
              hasLoopingVid = mobileVideo = true;
              desktopVideo = false;
            }
          }

          function isMobileDesktopActive() {
            if ($mobileLoopingVidAttr === '' && $desktopLoopingVidAttr !== '') {
              whichVidPairActive('desktopVideoType');
            } else if ($mobileLoopingVidAttr !== '' && $desktopLoopingVidAttr === '') {
              whichVidPairActive('mobileVideoType');
            }
          }

          function checkWhichVidActive() {
            if (($desktopLoopingVidAttr !== '') && ($mobileLoopingVidAttr !== '')) {
              hasLoopingVid = mobileVideo = desktopVideo = true;
              return;
            } else {
              isMobileDesktopActive();
            }
          }

          // Check first if a looping video is present
          if ($mobileLoopingVidAttr === '' && $desktopLoopingVidAttr === '') {
            hasLoopingVid = mobileVideo = desktopVideo = false;
            return;
          } else {
            checkWhichVidActive();
          }
          inlineLoopingVid();

          // Main video functionality.
          function inlineLoopingVid() {
            if (hasLoopingVid) {
              $loopingVid.each(function() {
                var $thisVid = $(this);
                vidSource = $thisVid.find('source'),
                desktopVidSrc = $thisVid.data('desktop-src'),
                mobVidSrc = $thisVid.data('mob-src');
                // Add a class to identify current video.
                $thisVid.closest('.module_block').addClass('loopingVidActive');
                // If there's no PC/Mobile Module Image loaded.
                checkModImages();
                // On first load, without resizing event:
                handleVidSrc($thisVid);
                // Listen for window resizing.
                $(window).on('resize', function() {
                  // Throttle/ debounce resize event:
                  clearTimeout(vidSrcTimer);
                  vidSrcTimer = setTimeout(function() {
                    // Resizing has "stopped"
                    handleVidSrc($thisVid);
                  }, 10);
                });
                // Mute/unmute volume.
                muting($thisVid);
              });
            } else {
              $loopingVidWrapper.remove();
            }
          }
        }

        // Handle the image source, pc/mobile
        $('.multi_use_homepage_v1').each(function() {
          var $this = $(this);
          var resizeTimer;

          // Inline Video functionality.
          inlineVideo($this);

          // Update to enable slashes in the Module Redirect URL.
          // Allows for backwards compatability.
          var heroLink = $this.find('.module_block__hero_link');
          if (heroLink.length !== 0) {
            var url = heroLink.attr('href');

            if (url.charAt(1) === '/') {
              heroLink.attr('href', url.substr(1));
            }
          }

          // Initialize some positioning
          var mobileCredit = false;
          var creditPath = $this.find('.headline_content__credit');
          var logoPath = $this.find('.headline_content__logo');

          // If Re-Nutriv brand selected and logo included, append logo at the end
          if (logoPath.length !== 0 && $this.find('.module_block_Re-Nutriv').length !== 0) {
            logoPath.detach().appendTo($this.find('.headline_content_group'));
            // Avoid element jump
            logoPath.css('display', 'block');
            logoPath.addClass('transition');
          }

          // If IE, handle image sources
          // Check for IE.
          var isIE = false;
          if ($('body').hasClass('ie') || $('body').hasClass('ie-11')) {
            isIE = true;
          }

          // Store the initial and updated styles.
          var initialStyles = [];
          var newStyles = [];

          if (creditPath.attr('data-pos-mob-top')) {
            mobileCredit = true;
          }

          function handlePositioning() {
            creditPath.each(function() {
              var initalTopStyle = $(this).prop('style')['top'];
              var initalLeftStyle = $(this).prop('style')['left'];
              initialStyles.push(initalTopStyle, initalLeftStyle);

              var mobTopStyle = $(this).data('pos-mob-top');
              var mobLeftStyle = $(this).data('pos-mob-left');
              newStyles.push(mobTopStyle, mobLeftStyle);
            });
          }
          if (mobileCredit) {
            handlePositioning();
          }

          // Store pc/mobile sources
          function iesrc(eq_val) {
            var theSrc = $this.find('picture source').eq(eq_val);
            var ieSrc = $this.find('picture img');
            var imgSrc = theSrc.attr('srcset');
            ieSrc.attr('src', imgSrc);
          }

          // Switching positions for Template 5 & EstÃ©e Stories.
          var templateFiveParent = $this.find('.module_block__container_homepage-template-5 .headline_content_group');
          var storiesParent = $this.find('.module_block__container_homepage-estee-stories .headline_content_group');

          function handleChanges() {
            if ($(window).width() < 768) {
              if (isIE) {
                iesrc(0);
              }
              $this.addClass('homepage_module_wrapper_mobile');

              // Re-Nutriv not selected
              if ($this.find('.module_block_Re-Nutriv').length === 0) {
                $this.find('.headline_content__explore_link a').addClass('button cta cta__button');
              }
              if ($this.find('.module_block__container').hasClass('module_block__container_homepage-template-5')) {
                $this.find('.headline_content__sub_content').detach().appendTo(templateFiveParent);
              } else if ($this.find('.module_block__container').hasClass('module_block__container_homepage-estee-stories')) {
                $this.find('.headline_content__sub_content').detach().appendTo(storiesParent);
              }
              if (mobileCredit) {
                // Only update if it hasn't already been updated.
                creditPath.each(function() {
                  if ($(this).hasClass('size_mob')) {
                    return;
                  } else {
                    $(this).css('top', newStyles[0]);
                    $(this).css('left', newStyles[1]);
                    $(this).addClass('size_mob').removeClass('size_desktop');
                  }
                });
              } else {
                creditPath.addClass('hide_elem');
              }
              // Logo not appearing for mobile when Re-Nutriv brand selected and logo included
              if (logoPath.length !== 0 && $this.find('.module_block_Re-Nutriv').length !== 0) {
                logoPath.css('display', 'none');
              }
            } else {
              if (isIE) {
                iesrc(1);
              }

              $this.removeClass('homepage_module_wrapper_mobile');
              $this.find('.headline_content__explore_link a').removeClass('button cta cta__button');

              if ($this.find('.module_block__container').hasClass('module_block__container_homepage-template-5')) {
                $this.find('.headline_content__sub_content').detach().insertBefore(templateFiveParent);
              } else if ($this.find('.module_block__container').hasClass('module_block__container_homepage-estee-stories')) {
                $this.find('.headline_content__sub_content').detach().insertBefore(storiesParent);
              }
              if (mobileCredit) {
                // Only update if it hasn't already been updated.
                creditPath.each(function() {
                  if ($(this).hasClass('size_desktop')) {
                    return;
                  } else {
                    $(this).css('top', initialStyles[0]);
                    $(this).css('left', initialStyles[1]);
                    $(this).addClass('size_desktop').removeClass('size_mob');
                  }
                });
              } else {
                creditPath.removeClass('hide_elem');
              }

              // Logo appearing for mobile when Re-Nutriv brand selected and logo included
              if (logoPath.length !== 0 && $this.find('.module_block_Re-Nutriv').length !== 0) {
                logoPath.css('display', 'block');
              }
            }
          }

          // Listen for window resizing.
          $(window).on('resize', function() {
            // Throttle/ debounce resize event:
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
              // Resizing has "stopped"
              handleChanges();
            }, 10);
          });

          // On first load, without resizing event:
          handleChanges();
        });
      });
    }
  };
})(jQuery);

