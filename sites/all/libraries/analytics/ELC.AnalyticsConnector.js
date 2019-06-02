
// This will contain generic, platform (jQuery) specific implementations that will affect all sites/brands
// Ultimately, this will be deprecated/replaced when everything is on the new platform.

(function(site, $) {
  $(function() {
    // Hook into all RPCs to determine if the data layer has been updated
    $(document).on('RPC:RESULT', function(event, responseObj, requestArgs, requestId) {
      // Skip if we're getting the datalayer itself
      if (requestArgs && requestArgs.method === 'analytics.getDataLayer') {
        return;
      }

      var responseData = JSON.parse(responseObj.responseText) || [];

      // Theoretically, we could be getting back multiple responses from one json rpc request, although that isn't currently in use anywhere on the PG sites.
      for (var i = 0; i < responseData.length; i++) {
        if (parseInt(responseData[i].id) === requestId && responseData[i].result && responseData[i].result.data) {
          var dataLayerUpdate = responseData[i].result.data.dataLayer;

          if (dataLayerUpdate) {
            site.elcEvents.dispatch('rpcResponseReceived', dataLayerUpdate);
          }
        }
      }
    });
    
    // TODO convert this to lodash, see SDFNDCR-619    
    function throttle(fn, wait) {
      var time = Date.now();
      return function() {
        if ((time + wait - Date.now()) < 0) {
          fn();
          time = Date.now();
        }
      }
    }

    // Global initialization listeners:

    // Required for Drupal as the data layer is loaded by JS, so tealium loading and event processing has to be defered.
    site.elcEvents.addListener('trackingDataLayer:loaded', window.loadTealium || function() {});
    site.elcEvents.addListener('tealium:loaded', function() {
      setTimeout(function() {
        site.elcEvents.dispatch('track:ready');
        site.trackingDataLayer.runEvents();
        if (site.trackingDataLayer.data['enable_scroll_tracking']) {
          site.elcEvents.dispatch('tealium:enableScrollTracking');
        }
      }, 500);
    });
    site.elcEvents.addListener('rpcResponseReceived', site.trackingDataLayer.update);

    // Event specific listeners:

    var analyticsBehavior = Drupal.behaviors.analyticsBehavior;
    var events = [
      'addToCart',
      'addToFavorites',
      'checkoutOPC',
      'checkoutSampleAdded',
      'emailSignup',
      'liveChatManualInitiated',
      'liveChatManualPreSurvey',
      'liveChatManualWaiting',
      'liveChatManualChatting',
      'liveChatProactiveDisplayed',
      'liveChatProactiveInitiated',
      'liveChatProactivePreSurvey',
      'liveChatProactiveWaiting',
      'liveChatProactiveChatting',
      'offerFailed',
      'offerSuccessful',
      'profileUpdate',
      'registration',
      'removeFromCart',
      'searchPageLoaded',
      'searchRedirect',
      'signin',
      'signinFailed'
    ];

    for (var i = 0; i < events.length; i++) {
      // Try brand function first
      //  - otherwise try the global function
      site.elcEvents.addListener('track:' + events[i], analyticsBehavior[events[i]] || site.track[events[i]]);
    }

    // Event listeners for other frontend features
    //  maps other frontend events into analytics specific events
    //  specifically useful for third parties, such as LivePerson

    // LivePerson Engage events

    // Define Engagement type (1 == proactive)
    var chatEngagementType = 0;

    if (window.hasOwnProperty('lpTag') && window.lpTag.hasOwnProperty('events')) {
      //Livechat Engagements are displayed on the page
      window.lpTag.events.bind({
        eventName: 'OFFER_DISPLAY',
        func: function(eventData, eventInfo) {
          if (eventData.engagementType === 1) {
            // engagementType === 1 indicates that this is a proactive invite
            site.elcEvents.dispatch('track:liveChatProactiveDisplayed');
          }
        }
      });

      // Livechat was clicked on the page
      window.lpTag.events.bind({
        eventName: 'OFFER_CLICK',
        func: function(eventData, eventInfo) {
          chatEngagementType = eventData.engagementType;
          if (eventData.engagementType === 1) {
            // engagementType === 1 indicates that this is a proactive invite
            site.elcEvents.dispatch('track:liveChatProactiveInitiated');
          } else {
            // otherwise it was manual
            site.elcEvents.dispatch('track:liveChatManualInitiated');
          }
        }
      });

      // Livechat state change.
      window.lpTag.events.bind({
        eventName: 'state',
        func: function(eventData, eventInfo) {
          var engagementType = '';
          if (chatEngagementType === 1) {
            engagementType = 'Proactive';
          } else {
            engagementType = 'Manual';
          }
          if (eventData.state === 'preChat') {
            // When the survey before the chat is shown
            site.elcEvents.dispatch('track:liveChat' + engagementType + 'PreSurvey');
          }
          if (eventData.state === 'waiting') {
            // When the user submits the survey
            site.elcEvents.dispatch('track:liveChat' + engagementType + 'Waiting');
          }
          if (eventData.state === 'chatting') {
            // When the chat starts
            site.elcEvents.dispatch('track:liveChat' + engagementType + 'Chatting');
          }
        }
      });
    }

    // END LivePerson Engage events

    // See requirements in GAPGLOBAL-1055
    site.elcEvents.addListener('tealium:enableScrollTracking', function() {
      //Global variable to keep track of which events we have already fired.
      window.tealiumScrollTracker = {
        '10': 0,
        '25': 0,
        '50': 0,
        '75': 0,
        '100': 0
      };

      var fireScrollEvent = function(args) {
        args = args || {
          nonInteraction: false
        };

        //Capture the full length of the page
        var windowHeight = jQuery(document).height();
        //Capture where the top of the page is after scroll
        var currentPosition = jQuery(document).scrollTop();
        //Capture how many pixels can be viewed by the user
        var windowViewingArea = jQuery(window).height();
        //Figure out the bottom of what the user has scrolled to
        var bottomScrollPosition = currentPosition + windowViewingArea;
        //Figure out the rounded percentage of how much was scrolled
        var percentScrolled = parseInt((bottomScrollPosition / windowHeight * 100).toFixed(0)) + 1;

        for (var scrollBucket in window.tealiumScrollTracker) {
          if (window.tealiumScrollTracker.hasOwnProperty(scrollBucket)) {
            if (window.tealiumScrollTracker[scrollBucket] === 0 && percentScrolled >= parseInt(scrollBucket)) {
              window.tealiumScrollTracker[scrollBucket] = 1;

              site.track.evtLink({
                event_name: 'user_scroll',
                event_category: 'Scroll Depth',
                event_action: document.location.href,
                event_noninteraction: args.nonInteraction ? 1 : 0,
                event_label: scrollBucket
              });
              
              if (scrollBucket === '100') {
                jQuery(window).off('scroll.tealium');
              }
            }
          }
        }
      };

      fireScrollEvent({ nonInteraction: true });

      jQuery(window).on('scroll.tealium', throttle(fireScrollEvent, 250));
    });

    // Load data layer (and, subsequently, tealium)
    site.trackingDataLayer.load(window.utag_data);
  });
}(window.site || {}, jQuery));
