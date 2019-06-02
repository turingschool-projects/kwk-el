
(function($) {

Drupal.behaviors.csfrRpc = {
  attach: function(context, settings) {
    if (typeof $.cookie === 'function') {
      if (!$.cookie('csrftoken')) {
        if (typeof generic === 'object' &&
            typeof generic.jsonrpc === 'object' &&
            typeof generic.jsonrpc.fetch === 'function') {
          generic.jsonrpc.fetch({
            method: 'csrf.getToken',
            params: [{}],
            onSuccess: function(jsonRpcResponse) {
              // Cookie was successfully set
              $(document).trigger('csrf.success', [jsonRpcResponse]);
            },
            onFailure: function(jsonRpcResponse) {
              // Some sort of error with the rpc request, so trigger error handlers
              $(document).trigger('csrf.error', [jsonRpcResponse]);
            }
          });
        }
        else {
          // User doesn't have cookie and generic.jsonrpc.fetch is undefined
          $(document).trigger('csrf.error', [{}]);
        }
      }
      else {
        // User has csrf cookie, so we'll assume it's valid
        $(document).trigger('csrf.success', [{}]);
      }
    }
    else {
      // Add handling for sites w/o the jquery cookie library?
      // If so, add it here.
    }
  }
};

})(jQuery);
