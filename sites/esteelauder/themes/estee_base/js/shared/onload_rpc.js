
var site = site || {};
site.onLoadRpc = site.onLoadRpc || {};
site.onLoadRpc.requests = site.onLoadRpc.requests || [];
site.analyticsUser = {};

site.onLoadRpc.init = function() {

  var signedIn = (site.userInfoCookie.getValue('signed_in') == 1 || site.userInfoCookie.getValue('csr_logged_in') == 1);

  // load anaytics user data
  if (signedIn || !site.onLoadRpc.defaults) {
    site.onLoadRpc.requests.push({
      "method":  "analytics.userinfo",
      "params":  [{}],
      "onSuccess" : function(data) {
        if ((data.result === undefined) || (data.result.value == null) || data.result.value.sorted == null) {
          return null;
        }

        // Set the cookie right away. Looked at combining it, but too many possible bugs this late before launch.
        // Also, Adobe libs load later than this JS does most of the time, so the s object is often undef at this point.
        generic.cookie('Auser', decodeURI(data.result.value.sorted + '-' + data.result.value.ident), { path: '/' });

        // still store in tms_page_data, will use the cookie only as a backup.
        if (typeof tms_page_data != 'undefined') {
          if (typeof tms_page_data.tms_page_info != 'undefined') {
            tms_page_data.tms_page_info.user_info = data.result.value;
          }
        }
      },
      "onFailure" : function() {}
    });
  }
  else {
    var defaults = site.onLoadRpc.defaults.analytics_userinfo || {};
    setTimeout(function() {
      generic.cookie('Auser', decodeURI(defaults.sorted + '-' + defaults.ident), { path: '/' });

      // still store in tms_page_data, will use the cookie only as a backup.
      if (typeof tms_page_data != 'undefined') {
        if (typeof tms_page_data.tms_page_info != 'undefined') {
          tms_page_data.tms_page_info.user_info = defaults;
        }
      }
    }, 500);
  }

  if (signedIn) {
    site.onLoadRpc.requests.push({
      "method":   "user.json",
      "params":   [{}],
      "onSuccess" : function(data) {
        // This is for the Phone Order app to recognize values on Drupal pages
        if ( data === undefined || (data.result === undefined) || (data.result.value == null)) {
          return null;
        }

        var val = data.result.value;

        if ((val['csr_email'] !== undefined) && (val['csr_email'] !== null)){
          $('#csr_header_holder').removeClass('hidden');
        }

        // Set a body class attribute based on user logged in status
        $('body').addClass( (val.signed_in === 1) ? 'elc-user-state-logged-in' : 'elc-user-state-anonymous' );

        // Populate user data
        $('[data-pg-object="user"] > [data-pg-prop], [data-pg-object="user"][data-pg-prop]').each(function() {
          var $me = $(this);
          $me.html(val[$me.attr('data-pg-prop').toLowerCase()]);
        });

        generic.user._updateUserData(val);

        $(document).trigger('user.loaded', val);
      },
      "onFailure" : function() {}
    });
  }
  else {
    generic.user._updateUserData({});
    $('body').addClass('elc-user-state-anonymous');
    $(document).trigger('user.loaded', {});
  }


  // collect product ID's from DOM
  var prodIds = [];
  $('[data-product-id], [data-productid], [data-product]').each( function() {
    $this = $(this);
    //since product attribute differs in Renutriv
    var prodId = !!$this.attr('data-product-id') ? $this.attr('data-product-id') : (!!$this.attr('data-productid') ? $this.attr('data-productid') : (!!$this.attr('data-product') ? $this.attr('data-product') : false));
    if (!prodId || _.isEmpty(prodId)) {
      return;
    }

    var insert = true;
    for (var i = prodIds.length - 1; i > -1; i--) {
      if (prodIds[i] == prodId) {
        insert = false;
        break;
      }
    }
    if (insert) {
      prodIds.push(prodId);
    }
    insert = true;
  });

  if (prodIds.length > 0) {
    site.onLoadRpc.requests.push({
      // "method":   "prodcat",
      // "params":   [{
      //     products: prodIds,
      //     category_fields: ['products'],
      //     product_fields: ['PRODUCT_ID', 'skus'],
      //     sku_fields: ['SKU_ID', 'INVENTORY_STATUS','DISPLAY_STATUS','SKU_BASE_ID','isOrderable','isShoppable']
      // }],
      "method":   "prodcat.querykey",
      "params":   [{
        products: prodIds,
        query_key: 'catalog-mpp-volatile'
      }],
      "onSuccess" : function (response) {
        // handle successful prodcat call
        var v = response.result.value;
        // console.dir("site.onLoadRpc onSuccess");
        // console.dir(v);
        $(document).trigger('prodcat.status', v);
      }
    });
  }
};


/*
 * site.onLoadRpc.requests - a global array of RPC request objects
 * must be initialized pre-DOM-load and formatted like this:
 * [
 *     {
 *         "method":   "user.json",
 *         "params":   [{}],
 *         "onSuccess" : function () { },
 *         "onFailure" : function () { }
 *     }
 * ]
 */
site.onLoadRpc.fetch = function() {
  var requests = site.onLoadRpc.requests || [];
  var queryVals = [];

  for (var i = 0, len = requests.length; i < len; i++) {
    var postMethod = requests[i].method || "rpc.form";
    queryVals[i] = {
      "method": postMethod,
      "params": requests[i].params,
      "id": i + 1
    };
  }

  if (queryVals.length < 1) {
    return null;
  }

  var successHandler = function(data, textStatus, response) {
    for (var i=0, len=requests.length; i<len; i++) {
      var fn = requests[i].onSuccess;
      if (typeof fn !== 'function') {
        continue;
      }
      fn( data[i] );
    }
  };

  var url = "/rpc/jsonrpc.tmpl";
  var options = {};

    // ELCTWO-571 requires that we pass brand, region, and locale ids to ensure proper responses
    // on the pg side for drupal sites.  To accomplish this we pass 'addl_url_params' within the arguments.
    // This snippets searches for such entries and adds 'em to the request url.
    var url_params = "";
    $(queryVals).each( function () {
        if (this.params[0].url_params) {
            if (this.params[0].url_params.charAt(0) === '&') {
                url_params += this.params[0].url_params;
            } else {
                url_params += '&' + this.params[0].url_params;
            }
        }
    });
    if (url_params !== "") {
        url += '?' + url_params.substring(1);
    }
    // console.log("queryVals");
    // console.log(queryVals);
    options.data = $.param({JSONRPC: JSON.stringify(queryVals)});

    options.type = "POST";
    options.success = function(data, textStatus, response) {
        // console.log("Ajax success :::::::::::::::::::::");
        // console.log(arguments);
        successHandler(data, textStatus, response);
    };
    options.error = function(jqXHR, textStatus, errorThrown) {
        // console.log("Ajax error :::::::::::::::::::::");
        // console.log(arguments);
    };
    $.ajax(url,options);

};

$( function() {
    site.onLoadRpc.init();
    site.onLoadRpc.fetch();
});
