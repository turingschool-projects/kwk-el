
(function($) {

/**
 * Action links tweaks.
 */
Drupal.behaviors.elcActionLinks = {
  attach: function (context, settings) {
    $('.action-links li:first-child').addClass('first');
    $('.action-links, context').hover(function() {
      $(this).toggleClass('active');
    });
  }
}

/**
 * Collapsible menus.
 */
Drupal.behaviors.elcMenuToggle = {
  attach: function (context, settings) {
    $('.menu .menu-item').click(function () {
      $(this).parent().toggleClass('selected');
    });
  }
}

/**
 * IE Placeholder -- depends on js/jquery.placeholder.js.
 */
Drupal.behaviors.formPlaceholder = {
  attach: function (context, settings) {
    // $( "input.field, input.form-text" ).placeholder({
    //   tagName:  "div",
    //   polyClass:  "placeholder",
    //   wrapClass:  "placeholder-wrap",
    //   callback: function () {}
    // });
  }
}

/**
 * Position and fade out console messages
 */
Drupal.behaviors.pageMessages = {
  attach: function(context, settings) {
    var $console = $('#console');

    // Don't do anything further if there are no console message
    if ($console.length == 0) {
      // Estee of course has to be difficult and use different dom.
      $console = $('.main-console');
      if ($console.length == 0) {
        return;
      }
    }

    var docHeight = $(window).height();
    var height = $console.outerHeight(true);
    var topPosition = Math.round((docHeight - height) / 2);

    // Vertically center the console messages
    $console.css('top', topPosition + 'px');
    $('<span id="error-close">x</span>').prependTo( $console.children('.messages') )
        .click(function() {
             $(this).parent().remove();
        });


    // Fade out console messages after 5 seconds
    /*setTimeout(function() {
      $console.fadeOut('fast');
    }, 6000);*/
  }
};

})(jQuery);
