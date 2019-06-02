
(function($) {
window.site = site || {};
site.drawers = site.drawers || {};

site.drawers.$formatters = $();
site.drawers.$closeButtons = $();

site.drawers.animationSpeed = 300;
site.drawers.mouseOutDelay = 800;
site.drawers.drawerOpen = false;
site.drawers.waited = false;
site.drawers.waiting = false;
site.drawers.isOver = false;
site.drawers.keepOpen = false;

var initialized = false;

site.drawers.init = function(context) {
  // Only run once
  if (initialized) {
    return;
  }
  initialized = true;
  site.drawers.$formatters = $('.drawer-formatter', context);
  site.drawers.$closeButtons = $('.drawer-formatter__close', site.drawers.$formatters);
  site.drawers.$container = $('.drawer-container', context);

  function _mouseMove(event, over) {
    site.drawers.isOver = over === true || false;
    // Don't bother with any of this if the drawer is closed
    if (!site.drawers.drawerOpen || site.drawers.keepOpen) return;

    if (event) {
      site.drawers.isOver = !!$(event.target).closest('.drawer-container').length;
    }

    if (!site.drawers.waiting && !site.drawers.waited) {
      // Set a delay before we check the cursor again
      site.drawers.waiting = true;
      setTimeout(function() {
        site.drawers.waited = true;
        site.drawers.waiting = false;
        _mouseMove(false, site.drawers.isOver);
      }, site.drawers.mouseOutDelay);
    } else if (site.drawers.waited) {
      if (!site.drawers.isOver) { // If we're still not over the container, close it
        _close();
      }
      site.drawers.waited = false;
    }
  }

  function _close(event) {
    if (typeof event != 'undefined') event.preventDefault();

    site.drawers.close();
  }

  site.drawers.$formatters.each(function() {
    var $formatter = $(this);
    var $pane = $('.drawer-formatter__content', $formatter);
    var $trigger = $('.drawer-formatter__trigger', $formatter);
    var hidePane = $pane.is(':hidden');
    var paneHeight = $pane.show().height();
    
    $pane.data('paneHeight', paneHeight);

    function _mouseOver(event) {
      var speed = site.drawers.drawerOpen ? 0 : site.drawers.animationSpeed;
      site.drawers.open($(this), $pane, speed);
    }

    $trigger.on('mouseover', _mouseOver);

    if (hidePane) {
      $pane.hide();
    } else {
      site.drawers.drawerOpen = true;
    }

    if (site.drawers.$container.length) {
      site.drawers.$container.append($pane);
    } else {
      site.drawers.$container = $formatter.addClass('drawer-container');
    }

  });

  $('body', context).on('mousemove', _mouseMove);
  site.drawers.$closeButtons.on('click', _close);
};

site.drawers.open = function($trigger, $pane, speed, keepOpen) {
  if (site.drawers.drawerOpen) {
    $pane.siblings('.drawer-formatter__content').hide().css('top', 0);
  }
  site.drawers.drawerOpen = true;
  $pane.stop().show().data('paneHeight', $pane.find('> div').height());
  $pane.stop().show().animate({ top: -$pane.data('paneHeight') }, speed);
  $('.drawer-formatter__trigger', site.drawers.$container).removeClass('active');
  $trigger.addClass('active');
  this.keepOpen = !!keepOpen;
  site.drawers.lastPaneOpen = $pane;
  site.drawers.lastSpeed = speed;
};

$(window).on("orientationchange",function(){
    if(site.drawers.drawerOpen) {
        site.drawers.lastPaneOpen.stop().show().data('paneHeight', site.drawers.lastPaneOpen.find('> div').height());
        site.drawers.lastPaneOpen.stop().show().animate({ top: -site.drawers.lastPaneOpen.data('paneHeight') }, site.drawers.lastSpeed);
    }
});

site.drawers.close = function($pane) {
  if (typeof $pane == 'undefined') $pane = $('.drawer-formatter__content:visible');
  if (!$pane.is(':visible')) return;
  site.drawers.drawerOpen = false;
  site.drawers.keepOpen = false;
  $pane.stop().animate({ top: 0 }, site.drawers.animationSpeed, function() {
    $pane.hide();
  });
  $('.drawer-formatter__trigger').removeClass('active');
};

  /**
   * Generic behaviors for footer drawers
   */
  Drupal.behaviors.ELB_Drawers = {
    attach: function(context, settings) {
      site.drawers.init(context);
    }
  };

})(jQuery);
