
generic.endeca.mixins.powerReviews = {
    initialize: function( args ) {
        this._super(args);
        this.prProducts = [];
    },

    show: function ( args ) {
        var args = args || {};
        this._super( args );

        if ( typeof POWERREVIEWS != 'undefined' && typeof Drupal.settings.power_reviews != 'undefined' && this.prProducts.length ) {
            POWERREVIEWS.display.render( this.prProducts );
        }
    },

    createResult: function( args ) {
        this._super( args );

        if ( typeof POWERREVIEWS != 'undefined' && typeof Drupal.settings.power_reviews != 'undefined' ) {
            var pr_reviewsnippet_id = 'pr-reviewsnippet-' + args.result.PROD_BASE_ID + '-endeca';

            var page_id = Drupal.settings.power_reviews.page_id || args.result.PROD_BASE_ID;
            var review_wrapper_url = ( Drupal.settings.power_reviews.review_wrapper_url || '/review/create' ) + '?page_id=' + page_id;

            this.prProducts.push({
                api_key: Drupal.settings.power_reviews.api_key,
                locale: Drupal.settings.power_reviews.locale,
                merchant_group_id: Drupal.settings.power_reviews.merchant_group_id,
                merchant_id: Drupal.settings.power_reviews.merchant_id,
                page_id: page_id,
                review_wrapper_url: review_wrapper_url,
                components: {
                    ReviewSnippet: pr_reviewsnippet_id
                }
            });
        }
    },

    reset: function() {
        var args = args || {};
        this._super( args );
        this.prProducts = [];
    }
};

site.endeca.mixins.powerReviews = generic.endeca.mixins.powerReviews;
