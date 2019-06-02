
/*
  Endeca control class for the typeahead endeca instance.
*/
//var global = global || {};
var site = site || {};
site.endeca = site.endeca || {};
site.endeca.instances = site.endeca.instances || {};
site.endeca.instances.typeahead = site.endeca.instances.typeahead || {};

site.endeca.instances.typeahead.control = site.endeca.generic.Class.create(site.endeca.control, {
  initialize: function (args) {
    this.timer = 0;
    this._super(args);

    if (this.nodes.wrapper.length && this.nodes.inputElement.length) {
      var that = this;
      var bind_name = 'input';
      if (navigator.userAgent.indexOf("MSIE") != -1){
        bind_name = 'propertychange';
      }
      this.nodes.inputElement.bind(bind_name, that, that.onKeyUp);
      //this.nodes.inputElement.bind('keyup', that, that.onKeyUp);
      this._watchToClose();
    }
  },

  onKeyUp: function (event) {
    var that = event.data;
    clearTimeout(that.timer);
    that.timer = setTimeout(function () {
      var searchTerm = jQuery.trim(that.nodes.inputElement[0].value)/* + "*"*/;
      if (searchTerm != that.searchTerm && searchTerm.length >= that.configuration.minSearchLength) {
        that.searchTerm = searchTerm;
        that.search({
          searchTerm: searchTerm
        });
      }
    }, 175);
  },

  _watchToClose: function () {
    var that = this;

    // making they typeahead consistant with main-pc.js
    // jQuery(document).bind('click', that, function (event) {
    //   var tgt = event.target;
    //   var that = event.data;

    //   if (!jQuery(tgt).parents(that.nodes.wrapper.selector).length &&
    //     tgt != that.nodes.inputElement[0] &&
    //     tgt != that.nodes.wrapper[0]) {
    //     that.nodes.wrapper.hide();
    //     return;
    //   }

    //   that.nodes.wrapper.hide();
    // });
  },

  searchCompleted: function () {
    if (!this._super()) {
      return;
    }
    this.results.products.resultData = this.catalogs.product.resultList;

    if (this.results.products.resultData.length) {
      this.results.products.displayResults();
      this.results.products.show();
      this.hasResults = true;
      jQuery('.el-search-block__links').hide();
    } else {
      this.results.products.hide();
      jQuery('.el-search-block__links').show();
    }

    if ( ( this.hasResults || this.wildcardSearch ) && !( !this.hasResults && this.meta.hasRedirects ) ) {
        /* summary */
        this.results.summary.resultData = jQuery.extend( this.meta.searchInfo, { breadcrumbs: this.meta.dimensions.breadcrumbs } );
        this.results.summary.hasResults = this.hasResults;
        this.results.summary.displayResult();
    }

    // mobile close
    var that = this;
    jQuery('.typeahead__close').unbind('click');
    jQuery('.typeahead__close').bind('click', that, function (event) {
      that.nodes.wrapper.hide();

      //remove header class
      jQuery('body.device-mobile .page-header').removeClass(Drupal.ELB.ui.search_class);
    });
    if ( this.hasResults ) {
      /* view results */
      this.results.seeResults.resultData = [{
        'url': this.configuration.fullSearchBaseUrl + this.searchTerm
      }];

      jQuery('.el-mobile-search-block__btn-submit').click(function(event) {
          event.preventDefault();
          window.location.href = that.configuration.fullSearchBaseUrl + that.searchTerm;
      });

      this.results.seeResults.displayResults();
      this.results.seeResults.displayResultNodes();
      this.results.seeResults.show();
    } // if ( this.hasResults ) 

    //add header class
    jQuery('body.device-mobile .page-header').addClass(Drupal.ELB.ui.search_class);
    
    this.nodes.wrapper.show();
    this.displayResults();
    // warning: no code runs after above line
    
    // var me = this.nodes;
    // this.nodes.wrapper.find('.result a').bind('click', function (e) {
    //   //e.preventDefault();
    //   if (this.parentElement.parentNode.className = "term-results") {
    //     //  site.endeca.coremetrics.termClick();
    //   } else {
    //     site.endeca.coremetrics.productClick();
    //   }
    //   //me.inputElement.val(this.text);
    //   //me.formSubmit.submit();
    //   //console.log( 'this.nodes: ' + me );
    //   return true;
    // });

    var $searchSummary = $('.js-search-summary, .js-search-summary-dym, .js-search-summary-ac', '.js-summary');
    $searchSummary.each( function() {
      if($(this).length && $(this).html()){
        $(this).html(_.unescape($(this).html()));
      } else {
        $(this).next().removeClass('hidden');
      }
    });
  }
});
