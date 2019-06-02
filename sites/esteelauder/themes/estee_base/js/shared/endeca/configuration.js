
/**
 * @file configuration.js
 * Sitewide Endeca configuration.
 * Anything set here will be used as the default for all settings used by the endeca instances
 * on the page. These can be overwritten in the instance configuration files for each
 * endeca instance.
*/

jQuery(document).ready(function() {
  site.endeca.configuration = {
    query: {
      MDEXHost: 'localhost',
      MDEXPort: Drupal.settings.endeca.ports ? Drupal.settings.endeca.ports.mdex : {
        'en_US': 26300,
        'en_CA': 26300,
        'fr_CA': 26305,
        'zh_TW': 26310,
        'en_AU': 26315,
        'en_GB': 26335,
        'de_AT': 26320,
        'de_DE': 26325,
        'fr_FR': 26330,
        'en_AU': 26315,
        'pl_PL': 26340,
        'de_CH': 26345,
        'fr_CH': 26350,
        'zh_CN': 26355,
        'ja_JP': 26360,
        'da_DK': 26365,
        'en_ZA': 26370,
        'es_MX': 26380,
        'ko_KR': 26385,
        'tr_TR': 26390,
        'en_MY': 26375,
        'it_IT': 26395,
        'he_IL': 16301,
        'ru_RU': 16395
      },
      logHost: generic.endeca.generic.env.domain.match(/www/) ? 'njlndca01' : 'localhost',
      logPort: Drupal.settings.endeca.ports ? Drupal.settings.endeca.ports.log : {
        'en_US': 26304,
        'en_CA': 26304,
        'fr_CA': 26309,
        'zh_TW': 26314,
        'en_AU': 26319,
        'en_GB': 26339,
        'de_AT': 26324,
        'de_DE': 26329,
        'fr_FR': 26334,
        'en_AU': 26319,
        'pl_PL': 26344,
        'de_CH': 26349,
        'fr_CH': 26354,
        'zh_CN': 26359,
        'ja_JP': 26364,
        'da_DK': 26369,
        'en_ZA': 26374,
        'es_MX': 26384,
        'ko_KR': 26389,
        'tr_TR': 26394,
        'en_MY': 26379,
        'it_IT': 26399,
        'he_IL': 16302,
        'ru_RU': 16399
      },

      defaultDimensionIds: [8061,8174,8063,8050,8089,8051],
      
      
      configuredRangeFilters: {
        skuShoppable: 's_shoppable|GT+0',
        skuPromotional: 's_promotional|GT+0',
        skuSearchable: 's_searchable|GT+0',
        productTrFlag: 'p_TR_FLAG|LT+1',
        productDisplayable: 'p_displayable|GT+0',
        productShoppable: 'p_shoppable|GT+0'
      },

      defaultRangeFilters: ['skuSearchable', 'productShoppable', 'productDisplayable'],

      configuredRecordFilters: {
        products: 'rec_type:product',
        content: 'rec_type:content',
        locale: 'locale:' + ( jQuery.cookie('LOCALE') || 'en_US' ),
        activeSkus: 'NOT(s_INVENTORY_STATUS:5)',
        discontinued: 'NOT(s_discontinued:1)',
        shoppableOrComingSoon: 'OR(s_shoppable:1,s_isComingSoon:1)'
      }

    },

    coremetricsEnabled: false,
    // @todo update when coremetrics is configured
//    coremetricsEnabled: true,
    omnitureEnabled: true,
    contentzones: {},
    mixins: {}

  };
});
