
var site = site || {};
var profileRequests = profileRequests || '';
site.profile = site.profile || {};

/**
  * Function that stores any common functionality between PC and Mobile.
  * Any common helper functionality, variables, etc should be added here using the private this object.
  *
*/
site.profile.common = function() {

  // Method to get the profile events class from /personal_block/js/events.js if available.
  var _getEventClass = function() {
    return (site.profile && site.profile.events) ? site.profile.events() : {};
  };

  // Class to handle setting the individual pageview events.
  this.setPageView = {
    mpp : function(id) {
      if (!id) {
        return null;
      };
      this.set({ 'VIEWED_MPP' : id });
    },
    spp : function(id) {
      if (!id) {
        return null;
      };
      this.set({ 'VIEWED_SPP' : id });
    },
    set : function(event) {
      if (!event) {
        return null;
      };

      var eventClass = _getEventClass();
      if (jQuery.isEmptyObject(eventClass)) {
        return null;
      };

      eventClass.store(event);
    }
  };

  // Method to handle the gathering and storing of the page_data for mpp and spp pages.
  this.data = {
    mpp : function(data) {
      if (!data) {
        return null;
      };
      var that      = this;
      var catInfo   = data['categories'] || '';

      return catInfo ? catInfo[0] : {};
    },
    spp : function(data) {
      if (!data) {
        return null;
      };
      var products  = data.products;

      return products ? products[0] : {};
    }
  };

};