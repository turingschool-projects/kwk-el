
var site = site || {};
var profileRequests = profileRequests || '';
site.profile = site.profile || {};

/* Analytics reporting to be read post page load */
if (typeof tms_page_data =='object'){
    tms_page_data['PSN'] = {};
}else{
    tms_page_data = {};
    tms_page_data['PSN'] = {};
}

site.profile.pc = function() {

  var _common = new site.profile.common;

  var _mpp = {
    data : {},
    init : function(data) {
      if (!data || !Drupal.ELB.hasPersonalization()) {
        return null;
      };
      this.data = _common.data.mpp(data);
      this.setPageView();
    },
    setPageView : function() {
      if (!jQuery.isEmptyObject(this.data)) {
        _common.setPageView.mpp(this.data.CAT_BASE_ID);
      };
    }
  };

  var _spp = {
    data : {},
    init : function(data) {
      if (!data || !Drupal.ELB.hasPersonalization()) {
        return null;
      };
      this.data = _common.data.spp(data);
      this.setPageView();
    },
    setPageView : function() {
      if (!jQuery.isEmptyObject(this.data)) {
        _common.setPageView.spp(this.data.PROD_BASE_ID);
      };
    }
  };

  return {
    MPP : function(data) {
      _mpp.init(data);
    },
    SPP : function(data) {
      _spp.init(data);
    }
  };
}();
