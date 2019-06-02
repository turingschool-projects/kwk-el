
(function($) {
  Drupal.behaviors.video_content_v1 = {
    attach: function($this, settings) {
      $('.main-content', $this).once(function() {
        /*
         * --------------------------------------------------------------------------
         * VIDEO CONTENT V1.1
         * --------------------------------------------------------------------------
         * Functionality for a embedded video content with the following features:
         * Play/pause, scrubbing, volume control, fullscreen and sharing.
         * Option to play inline to a module or as an overlay.
         * Option of a dark and light theme.
         * Multiple videos may be embedded on the one page.
         * Carousel functionality is handled from here (basic_infinite_carousel_v1 template).
         */

        /*
        /--------------------------------------------------------------------------
        / Add classes for mobile and ipad.
        /--------------------------------------------------------------------------
        */
        function addClasses() {
          // Check for Safari.
          if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
            $('body').addClass('isSafari');
          }

          // Check for Firefox.
          if (navigator.userAgent.search("Firefox") >= 0) {
            $('body').addClass('isFF');
          }
        }
        addClasses();

        /*
        /--------------------------------------------------------------------------
        / Global vars (for this behaviour).
        /--------------------------------------------------------------------------
        */
        var videoElem = $('.video_content_v1');
        var videoWrapper = videoElem.find('.video_content_player');
        var video = videoElem.find('video.video_content');
        var playElem = videoElem.find('.video_content_cta, .video_content_cta_link__underline');
        var pauseUntil = false;
        var closingFromNav = false;
        var looping_vidContent = videoElem.siblings('.autoplay_video').find('.auto_vid_vol_icon_src');

        /*
        /--------------------------------------------------------------------------
        / Detect if landscape/portrait for mobile.
        /--------------------------------------------------------------------------
        */
        var iosCheck = false;
        if (navigator.userAgent.match(/iPhone|iPod/i) != null) {
          iosCheck = true;
        }

        // Initial orientation on page load.
        function detectInitialOrientation() {
          if (iosCheck === true) {
            if ($(window).height() < $(window).width()) {
              $('body').not(".device-pc").addClass('isLandscape');
            } else if ($(window).height() < $(window).width()) {
              if ($('body').not(".device-pc").hasClass('isLandscape')) {
                $('body').not(".device-pc").removeClass('isLandscape');
              }
            }
          } else if (iosCheck === false) {
            if ($(window).height() < $(window).width()) {
              $('body').not(".device-pc").addClass('isLandscape');

            } else if ($(window).height() > $(window).width()) {
              if ($('body').not(".device-pc").hasClass('isLandscape')) {
                $('body').not(".device-pc").removeClass('isLandscape');
              }
            }
          }
        }
        detectInitialOrientation();

        // Track orientation changes.
        function detectOrientationChange() {
          if (iosCheck === true) {
            if (window.innerHeight < window.innerWidth) {
              $('body').not(".device-pc").addClass('isLandscape');
            } else if (window.innerHeight > window.innerWidth) {
              if ($('body').not(".device-pc").hasClass('isLandscape')) {
                $('body').not(".device-pc").removeClass('isLandscape');
              }
            }
          } else if (iosCheck === false) {
            if (window.innerHeight > window.innerWidth) {
              $('body').not(".device-pc").addClass('isLandscape');
            } else if (window.innerHeight < window.innerWidth) {
              if ($('body').not(".device-pc").hasClass('isLandscape')) {
                $('body').not(".device-pc").removeClass('isLandscape');
              }
            }
          }
        }
        $(window).bind('orientationchange', function(event) {
          detectOrientationChange();
        });

        /*
        /--------------------------------------------------------------------------
        / Handle functionality for each video element.
        /--------------------------------------------------------------------------
        / Handle volume setup.
        / Handle metadata, scrubbing and video auto-close.
        / Handle muting, fullscreen and sharing functionality.
        / Handle carousel functionality.
        / Handle play icon/ CTA position for desktop & mobile.
        / Switching between the inline/overlay options for desktop/mobile.
        */
        videoElem.each(function() {
          var $this = $(this);
          var thisVid = $this.find(video),
            wrapper = $this.find('.el_vcv1_wrapper'),
            controls = wrapper.find('.el_vcv1_controls'),
            closeBtn = $this.find('.el_vcv1_close'),
            playBtn = controls.find('button.el_vcv1_play'),
            pauseBtn = controls.find('button.el_vcv1_pause'),
            seekBar = controls.find(".el_vcv1_seek_bar"),
            seekBarClick = controls.find(".el_vcv1_seek.el_vcv1_controls_elem"),
            volBar = controls.find(".el_vcv1_vol_bar"),
            muteBtn = controls.find(".el_vcv1_vol_icon button"),
            fullscreenBtn = controls.find(".el_vcv1_fullscreen button"),
            shareBtn = controls.find(".el_vcv1_share_links button"),
            shareView = $this.find('.el_vcv1_share'),
            closeShare = shareView.find('.el_vcv1_share_close'),
            vidEnd = false,
            videoCTAPos = $this.find('.video_content_cta_outer'),
            mob_differs_overlay,
            mob_differs_inline;

          // Set the initial volume to be 70%
          function handleVol(arg) {
            volBar.prop('value', arg);
            volBar.siblings(".el_vcv1_vol_pos").css("width", arg * 100 + "%");
          }
          var initVol = 0.7;
          thisVid.get(0).volume = initVol;
          handleVol(initVol);

          // Need to wait until the metadata is loaded
          var hasLoaded = false;
          var readyState = setInterval(function() {
            if (thisVid.get(0).readyState > 0) {
              hasLoaded = true;
              clearInterval(readyState);

              // Event listener for the seek bar
              seekBarClick.on("change", function() {
                var width = seekBar.val();
                var time = thisVid.get(0).duration * (width / 100);

                thisVid.get(0).currentTime = time;
              });

              // Update the seek bar as the video plays
              thisVid.on("timeupdate", function() {
                var value = (100 / thisVid.get(0).duration) * thisVid.get(0).currentTime;

                seekBar.prop("value", value);
                seekBar.siblings(".el_vcv1_seek_pos").css("width", value + "%");
              });

              // Close the player when the video is complete
              thisVid.on("ended", function() {
                vidEnd = true;
                closeBtn.trigger('click');
              });
            } else {
              return;
            }
          }, 10);

          // Update the video volume
          volBar.on("change", function() {
            var theVolVal = volBar.prop('value');

            thisVid.get(0).volume = theVolVal;
            $(this).siblings(".el_vcv1_vol_pos").css("width", theVolVal * 100 + "%");
          });

          // Mute/unmute volume, store init vol
          var previousVol;
          muteBtn.on("click", function() {
            if (thisVid.get(0).muted == false) {
              thisVid.get(0).muted = true;

              previousVol = volBar.prop('value');

              var muteVol = 0;
              handleVol(muteVol);
            } else {
              thisVid.get(0).muted = false;
              handleVol(previousVol);
            }
          });

          // Full-screen functionality.
          function openFS() {
            if (thisVid.get(0).requestFullscreen) {
              thisVid.get(0).requestFullscreen();
            } else if (thisVid.get(0).mozRequestFullScreen) {
              thisVid.get(0).mozRequestFullScreen();
            } else if (thisVid.get(0).webkitRequestFullscreen) {
              thisVid.get(0).webkitRequestFullscreen();
            } else if (thisVid.get(0).msRequestFullscreen) {
              thisVid.get(0).msRequestFullscreen();
            } else {
              thisVid.get(0).webkitEnterFullscreen();
            }
          }

          function closeFS() {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            }
          }

          function addAttr() {
            thisVid.attr({
              "controls": '',
              "controlsList": 'nodownload'
            });
          }

          function removeAttr() {
            $('body').removeClass('fullscreen');
            thisVid.removeAttr('controls controlsList');
          }

          function handlerFS() {
            $(document).on("fullscreenchange", function() {
              if (document.fullscreenElement) {
                addAttr();
              } else {
                removeAttr();
              }
            });
            $(document).on("webkitfullscreenchange", function() {
              if (document.webkitFullscreenElement) {
                addAttr();
              } else {
                removeAttr();
              }
            });
            $(document).on("mozfullscreenchange", function() {
              if (document.mozFullScreenElement) {
                addAttr();
              } else {
                removeAttr();
              }
            });
            $(document).on("MSFullscreenChange", function() {
              if (document.msFullscreenElement) {
                addAttr();
              } else {
                removeAttr();
              }
            });

            function iosEndFullscreen() {
              removeAttr();
            }
            thisVid.get(0).addEventListener('webkitendfullscreen', iosEndFullscreen, false);
          }
          handlerFS();

          // Fullscreen button event.
          fullscreenBtn.on("click", function() {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitDisplayingFullscreen) {
              closeFS();
            } else {
              $('body').addClass('fullscreen');
              openFS();
            }
          });

          // Share link button.
          shareBtn.on("click", function() {
            thisVid.get(0).pause();
            playBtn.removeClass("hidden");
            pauseBtn.addClass("hidden");
            controls.fadeOut();
            closeBtn.fadeOut();
            shareView.fadeIn(300);
          });

          // Closing the share overlay.
          closeShare.on("click", function() {
            shareView.fadeOut(300).promise().done(function() {
              controls.fadeIn();
              closeBtn.fadeIn();
            });
          });

          // Play/pause functionality
          thisVid.on("click", function() {
            if (this.paused == false && !pauseUntil) {
              this.pause();
              playBtn.removeClass("hidden");
              pauseBtn.addClass("hidden");
            } else if (!pauseUntil) {
              this.play();
              playBtn.addClass("hidden");
              pauseBtn.removeClass("hidden");
            } else if (pauseUntil) {
              this.pause();
              playBtn.removeClass("hidden");
              pauseBtn.addClass("hidden");
              pauseUntil = false;
            }
          });

          // Closing the video.
          closeBtn.on("click", function() {
            // Handle closing anim according to action.
            if (vidEnd) {
              fade = 500;
              vidEnd = false;
            } else {
              fade = 250;
            }
            thisVid.get(0).pause();
            closeFS();
            $('.play_btn_click').fadeIn(200).removeClass('play_btn_click');
            $('.mpp_hidden').removeClass('mpp_hidden').animate({
              opacity: 1
            }, 200);
            $(this).closest(videoWrapper).fadeOut(fade).promise().done(function() {
              thisVid.get(0).currentTime = 0;
              playBtn.addClass("hidden");
              pauseBtn.removeClass("hidden");
              $this.removeClass('pos video_active');

              // Reset the timer for the carousel.
              if (closingFromNav) {
                closingFromNav = false;
                return;
              } else {
                $(this).closest('.basic_infinite_carouselWrapper').siblings('.basic_infinite_carousel_reset').trigger('click');
              }
            });
          });

          // Clicking the play/pause button.
          playBtn.on("click", function() {
            thisVid.trigger('click');
          });
          pauseBtn.on("click", function() {
            thisVid.trigger('click');
          });

          // Handle the positioning values
          // Store the initial and updated styles.
          var initialStyles = [];
          var newStyles = [];

          videoCTAPos.each(function(index) {
            var initalTopStyle = $(this).data('pos-top');
            var initalLeftStyle = $(this).data('pos-left');
            initialStyles.push(initalTopStyle, initalLeftStyle);

            var mobTopStyle = $(this).data('pos-mob-top');
            var mobLeftStyle = $(this).data('pos-mob-left');
            newStyles.push(mobTopStyle, mobLeftStyle);
            $(this).css('top', initialStyles[0]);
            $(this).css('left', initialStyles[1]);
          });

          // Check if mobile video location differs from desktop.
          if (($this.hasClass('inline') && $this.hasClass('mob_overlay'))) {
            mob_differs_overlay = true;
          } else if (($this.hasClass('overlay') && $this.hasClass('mob_inline'))) {
            mob_differs_inline = true;
          }

          function handleChanges() {
            if ($(window).width() < 768) {
              // Only update if it hasn't already been updated.
              videoCTAPos.each(function() {
                if ($(this).hasClass('vcv1_size_mob')) {
                  return;
                } else {
                  $(this).css('top', newStyles[0]);
                  $(this).css('left', newStyles[1]);
                  $(this).addClass('vcv1_size_mob').removeClass('vcv1_size_desktop');
                }
              });
              // Mobile/desktop video location.
              if (mob_differs_overlay) {
                $this.removeClass('inline').addClass('overlay');
              } else if (mob_differs_inline) {
                $this.removeClass('overlay').addClass('inline');
              } else {
                return;
              }
            } else {
              // Only update if it hasn't already been updated.
              videoCTAPos.each(function() {
                if ($(this).hasClass('vcv1_size_desktop')) {
                  return;
                } else {
                  $(this).css('top', initialStyles[0]);
                  $(this).css('left', initialStyles[1]);
                  $(this).addClass('vcv1_size_desktop').removeClass('vcv1_size_mob');
                }
              });
              // Mobile/desktop video location.
              if (mob_differs_overlay) {
                $this.removeClass('overlay').addClass('inline');
              } else if (mob_differs_inline) {
                $this.removeClass('inline').addClass('overlay');
              } else {
                return;
              }
            }
          }
          // On first load, without resizing event:
          handleChanges();

          // Listen for window resizing.
          var resizeTimer;
          $(window).on('resize', function() {
            // Throttle/ debounce resize event:
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
              // Resizing has "stopped"
              handleChanges();
            }, 10);
          });
        });

        /*
        /--------------------------------------------------------------------------
        / Carousel Handling.
        /--------------------------------------------------------------------------
        */
        var navVidTarget;

        // Chevrons/ swiping.
        $('.basic_infinite_carouselnav_1').on('click', function() {
          navVidTarget = $(this).siblings('.basic_infinite_carouselWrapper').find('.video_content_v1.video_active');
          carouselVids();
        });
        $('.basic_infinite_carouselnav_2').on('click', function() {
          navVidTarget = $(this).siblings('.basic_infinite_carouselWrapper').find('.video_content_v1.video_active');
          carouselVids();
        });

        // Pagination.
        var checkPagsExist = setInterval(function() {
          if ($('.basic_infinite_carousel_pagination_complete').length) {
            clearInterval(checkPagsExist);
            $('.basic_infinite_carousel_pagination_dot').on('click', function() {
              navVidTarget = $(this).parent().siblings('.basic_infinite_carouselContainer').find('.basic_infinite_carouselWrapper').find('.video_content_v1.video_active');
              carouselVids();
            });
          }
        }, 100);

        function carouselVids() {
          if (navVidTarget.length) {
            closingFromNav = true;
            navVidTarget.find('.el_vcv1_close').trigger('click');
          } else {
            return;
          }
        }

        /*
        /--------------------------------------------------------------------------
        / Playing the videos from the play icon/ CTA.
        /--------------------------------------------------------------------------
        */
        playElem.each(function() {
          var $this = $(this);
          var thisVidElem = $this.closest('.video_content_cta_outer').siblings(videoWrapper);

          $this.on('click', function() {
            var thisPlayElem = $(this);
            thisPlayElem.closest('.video_content_cta_outer').addClass('play_btn_click').fadeOut(200);
            var thisVid = thisVidElem.find(video);
            thisPlayElem.closest('.video_content_v1').addClass('video_active');

            // Handle z-index issues with other template elements.
            thisPlayElem.closest('.video_content_v1.inline').addClass('pos');

            // Functions for inline MPP players on desktop.
            var fadeContentsTime = 180;

            function fadeMppPicture(eq) {
              thisPlayElem.parents().eq(eq).siblings('picture').animate({
                opacity: 0
              }, fadeContentsTime, function() {
                $(this).addClass('mpp_hidden');
              });
            }

            function fadeMppContent(eq) {
              thisPlayElem.parents().eq(eq).siblings('.module_block__content').animate({
                opacity: 0
              }, fadeContentsTime, function() {
                $(this).addClass('mpp_hidden');
              });
            }

            function fadeMppAutoVid(eq) {
              thisPlayElem.parents().eq(eq).siblings('.autoplay_video').animate({
                opacity: 0
              }, fadeContentsTime, function() {
                $(this).addClass('mpp_hidden');
              });
            }

            // Check if it's an inline MPP player on desktop.
            if ($(window).width() >= 768) {
              if (thisPlayElem.parents().eq(5).hasClass('multi_use_mpp_v1') || thisPlayElem.parents().eq(8).hasClass('multi_use_mpp_v1')) {
                if (thisPlayElem.parents().eq(1).hasClass('inline') || thisPlayElem.parents().eq(4).hasClass('inline')) {
                  if (thisPlayElem.hasClass('video_content_cta')) {
                    fadeMppPicture(1);
                    fadeMppContent(2);
                    fadeMppAutoVid(1);
                  } else if (thisPlayElem.hasClass('video_content_cta_link__underline')) {
                    fadeMppPicture(4);
                    fadeMppContent(5);
                    fadeMppAutoVid(4);
                  }
                }
              }
            }
            thisVid.trigger('click');
            thisVidElem.fadeIn(250);

            // If it's in the Basic Infinite Carousel template, clear the auto-scroll.
            thisPlayElem.closest('.basic_infinite_carouselWrapper').siblings('.basic_infinite_carousel_clear').trigger('click');

            // Pause other videos when $this is clicked.
            video.not(thisVid).each(function() {
              pauseUntil = true;
              $(this).trigger('click');
            });
            // Mute looping inline video if audible.
            if (looping_vidContent.hasClass('muteBtnActive')) {
              looping_vidContent.trigger('click');
            }
          });
        });
      });
    }
  };
})(jQuery);

