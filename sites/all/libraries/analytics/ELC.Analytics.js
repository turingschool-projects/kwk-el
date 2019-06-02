
/*global utag*/
(function(site, utag_data) {
  var tealium = {
    evtAction: function(action, obj, callback) {
      tealiumAPI(
        actionMethodLookup[action],
        Object.assign({}, tealiumBaseObjs[action], obj),
        callback
      );
    },

    evtLink: function(obj, callback) {
      tealiumAPI('link', obj, callback);
    },

    evtView: function(obj, callback) {
      tealiumAPI('view', obj, callback);
    },

    refreshData: function() {
      utag_data = window.utag_data;
      return utag_data;
    },

    disableDefaultPageView: function() {
      window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};
      window.utag_cfg_ovrd.noview = true;
    },

    addToCart: addToCart,
    addToFavorites: addToFavorites,
    checkoutOPC: checkoutOPC,
    checkoutSampleAdded: checkoutSampleAdded,
    checkoutPaymentSelected: checkoutPaymentSelected,
    emailSignup: emailSignup,
    liveChatManualInitiated: liveChatManualInitiated,
    liveChatManualPreSurvey: liveChatManualPreSurvey,
    liveChatManualWaiting: liveChatManualWaiting,
    liveChatManualChatting: liveChatManualChatting,
    liveChatProactiveDisplayed: liveChatProactiveDisplayed,
    liveChatProactiveInitiated: liveChatProactiveInitiated,
    liveChatProactivePreSurvey: liveChatProactivePreSurvey,
    liveChatProactiveWaiting: liveChatProactiveWaiting,
    liveChatProactiveChatting: liveChatProactiveChatting,
    navigationClick: navigationClick,
    offerFailed: offerFailed,
    offerSuccessful: offerSuccessful,
    productClick: productClick,
    profileUpdate: profileUpdate,
    questionAnswer: questionAnswer,
    questionAsk: questionAsk,
    quickView: quickView,
    removeFromCart: removeFromCart,
    registration: registration,
    reviewRead: reviewRead,
    reviewWriteStart: reviewWriteStart,
    reviewWriteEnd: reviewWriteEnd,
    searchPageLoaded: searchPageLoaded,
    searchRedirect: searchRedirect,
    signin: signin,
    signinFailed: signinFailed

  };

  var actionMethodLookup = {
    addToCart: 'link',
    addToFavorites: 'link',
    checkoutGuestUser: 'link',
    checkoutSampleAdded: 'link',
    checkoutPaymentSelected: 'link',
    checkoutOPC: 'view',
    checkoutReturnUser: 'link',
    emailSignup: 'link',
    filterProducts: 'link',
    liveChatManualInitiated: 'link',
    liveChatManualPreSurvey: 'link',
    liveChatManualWaiting: 'link',
    liveChatManualChatting: 'link',
    liveChatProactiveDisplayed: 'link',
    liveChatProactiveInitiated: 'link',
    liveChatProactivePreSurvey: 'link',
    liveChatProactiveWaiting: 'link',
    liveChatProactiveChatting: 'link',
    navigationClick: 'link',
    offerFailed: 'link',
    offerSuccessful: 'link',
    productClick: 'link',
    profileUpdate: 'link',
    questionAnswer: 'link',
    questionAsk: 'link',
    quickView: 'link',
    removeFromCart: 'link',
    registration: 'link',
    reviewRead: 'link',
    reviewWriteStart: 'link',
    reviewWriteEnd: 'link',
    searchAllResultsSelected: 'link',
    searchOneResultSelected: 'link',
    searchResultsRedirect: 'link',
    searchPageLoaded: 'view',
    searchRedirect: 'view',
    signin: 'link',
    signinFailed: 'link',
    socialLink: 'link'
  };

  var tealiumBaseObjs = {
    addToCart: {
      'enh_action': 'add',
      'event_name': 'add_to_bag',
      'event_category': 'ecommerce',
      'event_action': 'add to bag',
      'event_label': null, // '<product name> - <product ID>'
      //'add_to_bag_module': null, // '<add to bag module>'
      'Add_to_Bag_Module': 'Add_to_Bag_Module', // test rail has this hard coded
      'product_id': null, // '<product id>'
      'product_shade': null, // '<product shade>'
      'product_size': null, // '<product size>'
      'product_sku': null // '<sku id>'
    },

    addToFavorites: {
      'event_name': 'add_to_favorites',
      'event_category': 'ecommerce',
      'event_action': 'add to favorites',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    checkoutSampleAdded: {
      'event_name': 'samples',
      'event_category': 'samples',
      'event_action': 'samples added',
      'event_value': '0',
      'page_name': 'checkout | samples',
      'event_label': null // <sample name - SKU ID - sample category>
    },

    checkoutPaymentSelected: {
      'event_name': 'payment_selected',
      'page_name': 'checkout | payment',
      'enh_action': 'checkout',
      'event_category': 'ecommerce',
      'event_action': 'checkout option',
      'event_label': null, // 'creditcard of paypal'
      'event_value': '0'
    },

    checkoutGuestUser: {
      'enh_action': 'checkout_option',
      'event_name': 'guest_checkout',
      'event_category': 'ecommerce',
      'event_action': 'checkout option',
      'event_value': '0',
      'event_label': 'guest checkout'
    },

    checkoutOPC: {
      'enh_action': 'checkout',
      'event_label': null, // <panel name>
      'page_name': null, // <panel name>
      'page_type': null // <page_type>
    },

    checkoutReturnUser: {
      'enh_action': 'checkout_option',
      'event_name': 'return_user_checkout',
      'event_category': 'ecommerce',
      'event_action': 'checkout option',
      'event_value': '0',
      'event_label': 'return checkout'
    },

    filterProducts: {
      'event_category': 'filter & sort selection',
      'event_action': 'filter',
      'event_name': 'filter'
    },

    emailSignup: {
      'event_name': 'signup',
      'event_category': 'signup',
      'event_action': null, // signups: email,sms
      'event_label': null, // location of email signup
      'event_value': '0',
      'event_noninteraction': 'false'
    },

    liveChatManualInitiated: {
      'event_name': 'live_chat_user_initiated',
      'event_category': 'live chat interaction',
      'event_action': 'user initiated',
      'event_label': null, // <page_name>
      'event_value': '0',
      'event_noninteraction': 'false',
      'live_chat_initiation_type': 'user initiated'
    },

    liveChatManualPreSurvey: {
      'event_name': 'live_chat_manual_prechat_survey',
      'event_category': 'live chat interaction',
      'event_action': 'prechat survey',
      'event_label': 'shown',
      'live_chat_initiation_type': 'user initiated'
    },

    liveChatManualWaiting: {
      'event_name': 'live_chat_manual_prechat_accepted',
      'event_category': 'live chat interaction',
      'event_action': 'prechat survey',
      'event_label': 'accepted',
      'live_chat_initiation_type': 'user initiated',
      'live_chat_type': 'order assistance'
    },

    liveChatManualChatting: {
      'event_name': 'live_chat_manual_chatting',
      'event_category': 'live chat interaction',
      'event_action': 'chat start',
      'event_label': 'order assistance',
      'live_chat_initiation_type': 'user initiated',
      'live_chat_type': 'order assistance'
    },

    liveChatProactiveDisplayed: {
      'event_name': 'live_chat_proactive_shown',
      'event_category': 'live chat interaction',
      'event_action': 'proactive chat',
      'event_label': 'shown',
      'event_value': '0',
      'event_noninteraction': 'false'
    },

    liveChatProactiveInitiated: {
      'event_name': 'live_chat_proactive_accepted',
      'event_category': 'live chat interaction',
      'event_action': 'proactive chat',
      'event_label': 'accepted',
      'event_value': '0',
      'event_noninteraction': 'false',
      'live_chat_initiation_type': 'proactive'
    },

    liveChatProactivePreSurvey: {
      'event_name': 'live_chat_proactive_prechat_survey',
      'event_category': 'live chat interaction',
      'event_label': 'shown',
      'event_action': 'prechat survey',
      'live_chat': 'Pre Survey Chat',
      'live_chat_initiation_type': 'proactive'
    },

    liveChatProactiveWaiting: {
      'event_name': 'live_chat_proactive_prechat_accepted',
      'event_category': 'live chat interaction',
      'event_action': 'prechat survey',
      'event_label': 'accepted',
      'live_chat_initiation_type': 'proactive',
      'live_chat_type': 'order assistance'
    },

    liveChatProactiveChatting: {
      'event_name': 'live_chat_proactive_chatting',
      'event_category': 'live chat interaction',
      'event_action': 'chat start',
      'event_label': 'order assistance',
      'live_chat_initiation_type': 'proactive',
      'live_chat_type': 'order assistance'
    },

    navigationClick: {
      'event_name': 'navigation_click',
      'event_category': 'global',
      'event_action': 'navigation click',
      'event_label' : 'navigation click',
      'enh_action': 'promo_click',
      'promo_pos': ['gnav'],
      'promo_creative': ['link'],
      'promo_name': [], // '<navigation name> - <navigation link>'
      'promo_id': [] // '<promo_pos> - <promo_creative> - <navigation name> - <navigation link>'
    },

    offerFailed: {
      'event_name': 'offers_failed',
      'event_category': 'offers',
      'event_action': 'fail',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': null // <offerCode> - <offerMessage>
    },

    offerSuccessful: {
      'event_name': 'offers_success',
      'event_category': 'offers',
      'event_action': 'success',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': null // <offerCode>
    },

    quickView: {
      'enh_action': 'detail',
      'event_name': 'mpp_qv',
      'event_category': 'ecommerce',
      'event_action': 'product detail view',
      'event_noninteraction': 'true',
      'sc_event_name': 'Product Quick View',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product ID>'
      'product_base_id': null, // '<prod> - <product ID>'
      'product_catagory_name': null, // '<prod category>'
      'product_price': null // <prod price>
    },

    productClick: {
      'enh_action': 'product_click',
      'event_category': 'ecommerce',
      'event_action': 'product click',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product ID>'
      'product_position': null // <product position>
    },

    profileUpdate: {
      'event_name': 'profile_update',
      'event_category': 'account',
      'event_action': 'profile update',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard' // '<type of signin: standard or facebook'>
    },

    questionAnswer: {
      'event_name': 'ask_and_answer',
      'event_category': 'ask and answer',
      'event_action': 'answer',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    questionAsk: {
      'event_name': 'ask_and_answer',
      'event_category': 'ask and answer',
      'event_action': 'ask',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    registration: {
      'event_name': 'registration',
      'event_category': 'account',
      'event_action': 'create success',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard' // '<type of signin: standard or facebook'>
    },

    reviewRead: {
      'event_name': 'read_write_review',
      'event_category': 'review',
      'event_action': 'read',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    reviewWriteStart: {
      'event_name': 'read_write_review',
      'event_category': 'review',
      'event_action': 'write_start',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    reviewWriteEnd: {
      'event_name': 'read_write_review',
      'event_category': 'review',
      'event_action': 'write_end',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    removeFromCart: {
      'enh_action': 'remove',
      'event_name': 'remove_from_bag',
      'event_category': 'ecommerce',
      'event_action': 'remove from bag',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product id>'
      'product_shade': null, // '<product shade>'
      'product_size': null, // '<product size>'
      'product_sku': null // '<sku id>'
    },

    searchAllResultsSelected: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_action': 'standard search',
      'event_label': null, // '<search term>'
      'event_value': null, // '<number of returned results>'
      'event_noninteraction': false,
      'search_keyword': null, // '<search term>'
      'search_type': 'standard search',
      'number_of_on_site_search_results': null, // '<number of returned results>'
      'number_of_on_site_searches': 1
    },

    searchOneResultSelected: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_action': 'type ahead',
      'event_label': null, // '<search term>'
      'event_noninteraction': false,
      'search_keyword': null, // '<search term>'
      'product_sku': null, // '<product sku'>
      'product_id': null, // '<product id'>
      'product_name': null, // '<prodcut name>'
      'search_type': 'standard search'
    },

    searchResultsRedirect: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_action': 'redirect',
      'event_label': null, // '<search term>'
      'event_noninteraction': false,
      'search_keyword': null, // '<search term>'
      'search_type': 'redirect',
      'number_of_on_site_searches': 1
    },

    searchPageLoaded: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_label': 'standard search',
      'event_noninteraction': 'false',
      'page_name': 'Search',
      'page_type': 'search',
      'event_value': null, // '<number of results>'
      'event_action': null, // '<search term>'
      'search_keyword': null, // '<search term>'
      'search_type': 'standard search',
      'Number_of_On_Site_Search_Results': null, // '<number of results>',
      'Number_of_On_Site_Searchs': 1
    },

    signin: {
      'event_name': 'signin',
      'event_category': 'account',
      'event_action': 'login success',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard' // '<type of signin: standard or facebook'>
    },

    signinFailed: {
      'event_name': 'signin',
      'event_category': 'account',
      'event_action': 'login fail',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard' // '<type of signin: standard or facebook'>
    },

    socialLink: {
      'enh_action': 'social',
      'event_name': 'outbound_link',
      'event_category': 'outbound link click',
      'event_action': null, // '<click url>'
      'event_label': null // '<page url>'
    }

  };

  function tealiumAPI(type, obj, callback) {
    if (typeof utag !== 'undefined') {
      if (callback) {
        utag[type](obj, callback);
      } else {
        utag[type](obj);
      }
    }
  }

  function addToCart(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_label = stripOutMarkup(eventData.product_name[0]) + ' - ' + eventData.product_id[0];
      site.track.evtAction('addToCart', Object.assign({}, eventData, obj));
    }
  }

  function addToFavorites(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_label = stripOutMarkup(eventData.product_name[0]) + ' - ' + eventData.product_id[0];
      site.track.evtAction('addToFavorites', Object.assign({}, eventData, obj));
    }
  }

  // OPC will pass two active_panels for each event: 'review' and the current panel
  // So pop the first panel, if not review, use it. Otherwise check the second.
  function checkoutOPC(eventData) {
    var obj = {};
    var data = site.track.refreshData();
    if (eventData && !isEmpty(eventData)) {
      if (typeof eventData.active_panel === 'object') {
        obj.event_label = eventData.active_panel[0] === 'review' ? eventData.active_panel[1] : eventData.active_panel[0];
      } else {
        obj.event_label = eventData.active_panel;
      }
      obj.page_name = 'checkout | ' + obj.event_label;
      obj.page_type = data.page_type;

      site.track.evtAction('checkoutOPC', Object.assign({}, eventData, obj));
    }
  }

  function checkoutSampleAdded(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      for (var i = 0; i < eventData.product_name.length; i++) {
        obj.event_label = eventData.product_name[i] + ' - ' + eventData.product_sku[i] + ' - ' + eventData.product_category_id[i];
        site.track.evtAction('checkoutSampleAdded', Object.assign({}, obj));
      }
    }
  }

  function checkoutPaymentSelected(eventData) {
    var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData)) {
      site.track.evtAction('checkoutPaymentSelected', Object.assign({}, data, eventData));
    }
  }

  function emailSignup(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData) && eventData['last_source']) {
      obj['event_label'] = eventData['last_source'];
      obj['event_action'] = eventData['opt_in_state'];
    }
    Object.assign(site.trackingDataLayer.data, eventData);
    site.track.evtAction('emailSignup', Object.assign({}, eventData, obj));
  }

  function liveChatManualInitiated() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data)) {
      obj.event_label = data.page_name;
      site.track.evtAction('liveChatManualInitiated', Object.assign({}, obj));
    }
  }

  function liveChatManualPreSurvey() {
    site.track.evtAction('liveChatManualPreSurvey');
  }

  function liveChatManualWaiting() {
    site.track.evtAction('liveChatManualWaiting');
  }

  function liveChatManualChatting() {
    site.track.evtAction('liveChatManualChatting');
  }

  function liveChatProactiveDisplayed() {
    site.track.evtAction('liveChatProactiveDisplayed');
  }

  function liveChatProactiveInitiated() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data)) {
      obj.event_label = data.page_name;
      site.track.evtAction('liveChatProactiveInitiated', Object.assign({}, obj));
    }
  }

  function liveChatProactivePreSurvey() {
    site.track.evtAction('liveChatProactivePreSurvey');
  }

  function liveChatProactiveWaiting() {
    site.track.evtAction('liveChatProactiveWaiting');
  }

  function liveChatProactiveChatting() {
    site.track.evtAction('liveChatProactiveChatting');
  }

  function navigationClick(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData) && eventData.promo_name) {
      obj.promo_name = eventData.promo_name.indexOf('>') === 0 ? eventData.promo_name.replace(/[>]+/, '') : eventData.promo_name;
      obj.promo_id = ['gnav' + '-' + 'link' + '-' + obj.promo_name];
      site.track.evtAction('navigationClick', Object.assign({}, eventData, obj));
    }
  }

  function offerFailed(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      for (var i = 0; i < eventData.offer_code.length; i++) {
        obj.event_label = eventData.offer_code[i] + ' - ' + eventData.offer_message[i];
        site.track.evtAction('offerFailed', Object.assign({}, eventData, obj));
      }
    }
  }

  function quickView(eventData) {
    //var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData)) {
      site.track.evtAction('quickView', eventData);
    }
  }

  function productClick(eventData) {
    var obj = {};
    var data = site.track.refreshData();
    if (eventData && !isEmpty(eventData) && data && !isEmpty(data)) {
      if (!data.product_impression_id || !eventData.product_id) {
        return;
      }
      var product_index = data.product_impression_id.indexOf(eventData.product_id[0]);
      if (product_index >= 0) {
        obj.event_label = stripOutMarkup(data.product_impression_name[product_index]) + ' - ' + eventData.product_id[0];
        obj.product_position = product_index + 1;
        site.track.evtAction('productClick', Object.assign({}, eventData, obj));
      }
    }
  }

  function profileUpdate(eventData) {
    site.track.evtAction('profileUpdate');
  }

  function offerSuccessful(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      for (var i = 0; i < eventData.offer_code.length; i++) {
        obj.event_label = eventData.offer_code[0];
        site.track.evtAction('offerSuccessful', Object.assign({}, eventData, obj));
      }
    }
  }

  function questionAnswer() {
    return; //disabled for release
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('questionAnswer', obj);
    }
  }

  function questionAsk() {
    return; //disabled for release
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('questionAsk', obj);
    }
  }

  function registration(eventData) {
    eventData = eventData || {};
    if (eventData['login_source']) {
      eventData.event_label = eventData['login_source'].toLowerCase();
    }
    var data = site.track.refreshData() || {};
    site.track.evtAction('registration', Object.assign({}, data, eventData));
  }

  function reviewRead() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('reviewRead', obj);
    }
  }

  function reviewWriteStart() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('reviewWriteStart', obj);
    }
  }

  function reviewWriteEnd(eventData) {
    //returns due to disabling of reviewWriteEnd at this time 2/6/2019
    return;
    var obj = {};
    if (eventData && !isEmpty(eventData) && eventData.product_impression_id && eventData.product_impression_name) {
      obj.event_label = stripOutMarkup(eventData.product_impression_name) + ' - ' + eventData.product_impression_id;
    } else {
      var data = site.track.refreshData();
      if (data && !isEmpty(data) && data.product_impression_id && data.product_impression_id.length) {
        obj.event_label = stripOutMarkup(data.product_impression_name[0]) + ' - ' + data.product_impression_id[0];
      }
    }
    if (obj.event_label) {
      site.track.evtAction('reviewWriteEnd', obj);
    }
  }

  function removeFromCart(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_label = stripOutMarkup(eventData.product_name[0]) + ' - ' + eventData.product_id[0];
      site.track.evtAction('removeFromCart', Object.assign({}, eventData, obj));
    }
  }

  // eventData here is an instance of the Endeca JS
  function searchPageLoaded(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData)) {
      var searchTerm = eventData.meta.searchInfo.correctedTerms && eventData.meta.searchInfo.correctedTerms.length ? eventData.meta.searchInfo.correctedTerms[0] : eventData.queries.product.parsedSearchTerm();

      obj.event_value = eventData.meta.searchInfo.totalProductRecords.toString();
      obj.event_action = searchTerm;
      obj.search_keyword = searchTerm;
      obj.Number_of_On_Site_Search_Results = eventData.meta.searchInfo.totalProductRecords.toString();

      site.track.evtAction('searchPageLoaded', Object.assign({}, data, obj));
    }
  }

  function searchRedirect() {

  }

  function signin(eventData) {
    eventData = eventData || {};
    if (eventData['login_source']) {
      eventData.event_label = eventData['login_source'].toLowerCase();
    }
    var data = site.track.refreshData() || {};
    site.track.evtAction('signin', Object.assign({}, data, eventData));
  }

  function signinFailed(eventData) {
    eventData = eventData || {};
    if (eventData['login_source']) {
      eventData.event_label = eventData['login_source'].toLowerCase();
    }
    var data = site.track.refreshData() || {};
    site.track.evtAction('signinFailed', Object.assign({}, data, eventData));
  }

  function stripOutMarkup(str) {
    return str.replace(/(<([^>]+)>)/ig, '');
  }

  function isEmpty(obj) {
    for (var x in obj) {
      return false;
    }
    return true;
  }

  function getProductPosition(productIds) {
    if (!productIds) {
      return [];
    }
    if (typeof Drupal.behaviors.analyticsBehavior !== 'undefined') {
      return Drupal.behaviors.analyticsBehavior.getProductPositions(productIds);
    } else {
      return [];
    }
  }

  site.track = tealium;
}(window.site || {}, window.utag_data || {}));
