
/*
  Endeca configuration for the typeahead endeca instance.

  See comments in site.endeca.instances.search.configuration
*/

var site = site || {};
site.endeca = site.endeca || {};
site.endeca.instances = site.endeca.instances || {};
site.endeca.instances.typeahead = site.endeca.instances.typeahead || {};

jQuery(document).ready(function(){
  var predictiveLimit = ($('body').hasClass('device-pc')) ? 4 : 3;
  var pathPrefix = Drupal.settings.pathPrefix ? Drupal.settings.pathPrefix : "";
  site.endeca.instances.typeahead.configuration = jQuery.extend( true, {}, site.endeca.configuration, {
    searchType: "typeahead",
    followRedirects: false,
    minSearchLength: 3,
    fullSearchBaseUrl: "/" + pathPrefix + "esearch?search=",

    nodes: {
      wrapper: jQuery('#typeahead-wrapper'),
      inputElement: jQuery('#perlgem-search-form #search'),
      loading: jQuery('.loading', '#typeahead-wrapper'),
      formSubmit: jQuery('.form-submit', '#perlgem-search-form')
    },

    queries: {
      product: {
        /*searchKey: 'typeahead',*/
        recordsPerPage: predictiveLimit,
        recordFilters: ['discontinued', 'activeSkus', 'products'],
      }
    },

    results: {
      products: {
        baseClass: 'site.endeca.results',
        instanceArgs: {
          parentNode: jQuery('.typeahead-product-results', '#typeahead-wrapper'),
          childTemplatePath: '/templates/endeca/typeahead/product-result.tmpl'
          //childTemplatePathSku: '/templates/endeca/typeahead/product-sku-result.tmpl'
        },
        configuration: {
          limit: predictiveLimit
        }
      },
      summary: {
        baseClass: 'site.endeca.result',
        instanceArgs: {
          parentNode: jQuery('.typeahead-summary')
        },
        configuration: {
          templatePaths: {
            results: '/templates/endeca/typeahead/results.tmpl',
            noResults: '/templates/endeca/typeahead/no-results.tmpl'
          }
        }
      },
      seeResults: {
        baseClass: 'site.endeca.results',
        instanceArgs: {
          parentNode: jQuery('.typeahead-see-results', '#typeahead-wrapper'),
          templatePath: '/templates/endeca/typeahead/term-result.tmpl'
        }
      }
    }
  });

  new site.endeca.instances.typeahead.control( site.endeca.instances.typeahead.configuration );
});
