

generic.user = {};

/**
 * generic.user
 * - depends on: generic.jsonrpc
 */
generic.user = (function(){

    return {
        signed_id : false,

        initialize: function(args) {
            generic.updateProperties.apply(this, [args]);
        },

        getUser: function(args) {
            var self = this;

            if (args && args.pageDataKey) {
                var pageData = generic.page_data(args.pageDataKey);
                if (pageData.get("rpcdata")) {
                    console.log( "user page data found!");
                    self._updateUserData(pageData.get("rpcdata"));
                    return;
                }
            }

            var id = generic.jsonrpc.fetch({
                method : 'user.json',
                params: [],
                onSuccess: function(jsonRpcResponse) {
                    self._updateUserData(jsonRpcResponse.getValue());
                },
                onFailure: function(jsonRpcResponse) {
                    console.log('User JSON failed to load');
                }
            });
            return id;
        },

        // until we better parameterise this...
        _updateUserData: function(data) {
            var seld = this;
            if (data && !data[this.userinfo_rpc_key]) {
                $.extend( this, data[this.userinfo_rpc_key] );
            } else {
                $.extend( this, data );
            }
            //generic.events.fire({event:'user:updated'});
        },

        isSignedIn: function() {
            return ( this.signed_in ? true : false );
        }

    };
}() );

(function($) {
  clearTimeout(window.signOutTimer);
  $(function() {
    var site = window.site || {};
    // Don't do it if the user isn't signed in:
    var signed_in = typeof site.userInfoCookie === 'undefined' ? 0 : site.userInfoCookie.getValue('signed_in');
    signed_in = parseInt(signed_in, 10);
    if (signed_in) {
      window.signOutTimer = window.setTimeout(function() {
        $.cookie('showsignin', 1);
        document.location.href = '/account/signin.tmpl?_SUBMIT=signout&timeout=1';
      }, 15 * 60 * 1000);
    }
  });
})(jQuery);
