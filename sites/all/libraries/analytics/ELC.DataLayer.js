
/*global generic*/
(function(site) {
  var trackingDataLayer = {
    data: {},
    runEvents: function(obj) {
      // function can be called in an event context, so "this" may not be correct
      var that = site.trackingDataLayer;

      // allow data that has "changed" during the RPC to be included
      var obj = obj || {};
      var events = obj.datalayer_events || that.data.datalayer_events;

      if (events) {
        /*
          events is an object with event name as the key
          values can be either:
            a) {}, indicating that the event has no data or has been defered.
              or
            b) another object contained event_data, which should be passed via the dispatch
          tag
        */

        for (var eventName in events) {
          if (!events.hasOwnProperty(eventName)) continue;

          if (events[eventName].event_data) {
            // Assign event_data onto the higher level data object to make sure all required data is present
            // For example, add to cart event_data contains product_ variables for the product modified
            // but the RPC contains the full cart data, so this will create an object with both
            // the product modified and the full cart
            site.elcEvents.dispatch('track:' + eventName, Object.assign({}, obj, events[eventName].event_data));
          } else {
            site.elcEvents.dispatch('track:' + eventName);
          }
        }

        that.clearEvents();
      }
    },
    clearEvents: function() {
      if (generic && generic.cookie && generic.cookie('datalayer_events')) {
        generic.cookie('datalayer_events', 0, { exp: 0, path: '/' });
      } else if (generic && generic.jsonrpc) {
        // RPC to server to delete all session events
        generic.jsonrpc.fetch({
          method : 'analytics.deleteEvents',
        });
      }

      // Maybe clear from utag_data?
    },
    load: function(utag_data) {
      if (typeof utag_data === 'undefined') {
        if (generic && generic.jsonrpc) {
          generic.jsonrpc.fetch({
            method: 'analytics.getDataLayer',
            onSuccess: function(jsonRpcResponse) {
              var dataLayer = jsonRpcResponse.getValue() || {};

              // Check for product data in page_data
              if (window.page_data && window.page_data['analytics-datalayer']) {
                Object.assign(dataLayer, window.page_data['analytics-datalayer']);
              }

              if (generic && generic.cookie && generic.cookie('datalayer_events')) {
                var datalayer_events = generic.cookie('datalayer_events').split(',');
                dataLayer.datalayer_events = dataLayer.datalayer_events || {};
                for (var i = 0; i < datalayer_events.length; i++) {
                  if (dataLayer.datalayer_events[datalayer_events[i]]) continue;
                  dataLayer.datalayer_events[datalayer_events[i]] = {};
                }
              }

              if (dataLayer) {
                window.utag_data = dataLayer;
                site.trackingDataLayer.load(dataLayer);
              }
            }
          });
        }
      } else {
        this.data = utag_data;
        site.trackingDataLayer.fixupProductData(this.data);
        site.elcEvents.dispatch('trackingDataLayer:loaded');
      }
    },
    update: function(obj) {
      // function can be called in an event context, so "this" may not be correct
      var that = site.trackingDataLayer;

      obj && Object.assign(that.data, obj);
      that.runEvents(obj);
    },
    fixupProductData: function(obj) {
      var that = site.trackingDataLayer;

      var dataLayer = obj || that.data || {};

      if(dataLayer.hasOwnProperty('product_impression_id')) {
        dataLayer['product_impression_list'] = [];
        dataLayer['product_impression_position'] = [];
        for ( var i = 0; i < dataLayer['product_impression_id'].length; i++ ) {
          dataLayer['product_impression_list'].push(document.location.pathname);
          dataLayer['product_impression_position'].push(i+1);
        }
      }
      if(dataLayer.hasOwnProperty('cart_product_id') && typeof dataLayer['cart_product_id'] === "object") {
        dataLayer['cart_product_brand'] = dataLayer['cart_product_id'].map(function () {
          return dataLayer['brand'];
        });
      }
    }
  };

  site.trackingDataLayer = trackingDataLayer;
}(window.site || {}));
