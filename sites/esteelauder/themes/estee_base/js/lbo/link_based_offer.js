
(function($) {
  Drupal.behaviors.LBO = {
    attach: function(context, settings) {

      //
      // On cart update, align the banner content while panel reloads
      //
      $(window).on("checkout:panel:displayed", function() {
        decodeHtmlEntities($(".js-lbo-confirm-message", context));
        alignCartLBOBanner();
      });
      //
      // Format LBO message
      //
      var decodeHtmlEntities = function(elem) {
        if (elem.length) {
          var formattedMessage = elem.html().replace(/&nbsp;/g, " ");
          elem.html(formattedMessage);
        }
      };
      //
      // Insert LBO offer message into promotions page 
      //
      function insertLboIntoPromotions(templateResult, $body) {
        $(templateResult).appendTo($body);
        var $lboPCHeaderCont = $(".js-lbo-header-container", context);
        decodeHtmlEntities($(".js-lbo-confirm-message", context));
        var $lboSpecialOfferRow = $('.js-lbo-special-offer', context);
        var $lboSpecialOfferContainer = $('.js-special-offer-container', $lboPCHeaderCont);
        var lboTitleMsg = $lboSpecialOfferContainer.find('.js-lbo-confirm-message h1').html();
        var lboTitleSubMsg = $lboSpecialOfferContainer.find('.js-lbo-confirm-message h2').html();
        var lboImg = $lboSpecialOfferContainer.find('.js-special-offer-img').attr('src');
        $lboSpecialOfferRow.find('.special-offer-headline').html(lboTitleMsg);
        $lboSpecialOfferRow.find('.special-offer-image').attr('src', lboImg);
        if (!site.client.isMobile) {
          $lboSpecialOfferRow.find('.special-offer-copy-block').html(lboTitleSubMsg);
        } else {
          $lboSpecialOfferRow.find('.special-offer-copy').html(lboTitleSubMsg);
        }
        $lboSpecialOfferRow.removeClass('hidden');
      }
      //
      // LBO message has to be aligned with image
      //
      function alignCartLBOBanner() {
        var $cartLbo = $(".js-lbo-message-container.js-cart", context),
            $lboImg = $cartLbo.find(".js-special-offer-img"),
            $lboMsgContainer = $cartLbo.find(".js-special-offer-container"),
            maxHeightVal = 0;
        if ($cartLbo.length) {
          var msgHeight = $lboMsgContainer.outerHeight(),
              imgHeight = $lboImg.height();
          maxHeightVal = Math.max(msgHeight, imgHeight);
          $cartLbo.find(".js-lbo").css("min-height", maxHeightVal+"px");
        }
      }
      //
      // Show LBO banner and messages when landing with URL
      // Cookie based manipulation 
      //
      if ($.cookie("offer_info") !== "" && $.cookie("offer_info") !== null) {
        var offer_code = $.cookie("offer_info").split(":")[1];
        generic.jsonrpc.fetch({
          method: "offer.linkedOfferState",
          params: [offer_code],
          onSuccess: function(r) {
            var offer = r.getValue();
            var isActive = (offer.linked_offer !== null && offer.linked_offer.length !== 0),
                templateResult = null;
            if (isActive) {
              var htmlStr = offer.linked_offer.cms_content,
                  $body = $("body");
              $(htmlStr).appendTo($body);
              var $confirmMessage = $(".js-lbo-confirm-message", context),
                  $lboPCHeaderCont = $(".js-lbo-header-container", context);
              $confirmMessage.html(offer.linked_offer.offer_message);
              decodeHtmlEntities($confirmMessage);
              templateResult = $lboPCHeaderCont.html();

              // If offer was not configured in offer manager/CMS
              // then skip further processing
              if (typeof templateResult === "undefined") {
                return false;
              }
              if ($body.hasClass("section-promotions")) {
                // promotions page
                insertLboIntoPromotions(templateResult, $body);
              }
              if (!site.client.isMobile) {
                var $stickyContainer = $(".page-sticky-footer .my-feed-tray__dual-col-inner", context);
                $stickyContainer.append(templateResult);
                // Add LBO message to sticky footer
                $stickyContainer
                  .children(".my-feed-tray__col.special-offer").remove()
                  .end()
                  .find(".special-offer").addClass("my-feed-tray__col lbo");
                // When LBO is active then open the offer drawer
                $(window).scroll();
                $(".page-sticky-footer__special_offers__link", context).trigger("mouseenter");
                site.drawers.drawerOpen = false;
              } else {
                // Mobile DOM manipulation
                var $pageFooter = $body.find(".page-footer");
                var lboWrapper = $("<div/>", {class:"mobile-footer-lbo"});
                lboWrapper.append(templateResult);
                $pageFooter.before(lboWrapper);
                lboWrapper.find(".js-lbo .js-lbo-btn-close").on("click", function() {
                  $(this).closest(".js-lbo").addClass("hidden");
                });
              }
              $(".checkout.viewcart", context).addClass("lbo-active");
            }
          },
          onFailure: function() {}
        });
      } else {
        // Visit promotions page without landing URL
        var $body = $("body");
        if ($body.hasClass("section-promotions")) {
          generic.jsonrpc.fetch({
            method: "offer.getLinkedOffer",
            onSuccess: function(r) {
              var lboMsg = r.getValue();
              if (lboMsg && typeof lboMsg === "object" && typeof lboMsg.cms_content !== "undefined") {
                insertLboIntoPromotions(lboMsg.cms_content, $body);
              }
            }
          });
        } 
        if (!site.client.isMobile) {
          alignCartLBOBanner();
        }
      }
    }
  };
})(jQuery);
