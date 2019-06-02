
//
// TODO: check that all fields exist before returning/fetching data
// TODO: accept product & category ID args as arrays
//
/**
 * @namespace
 */
var generic = generic || {};

/**
 * @namespace
 */
generic.productData = generic.productData || {};


// document.observe('dom:loaded', function (evt) {
    // check pagedata for product data
// });


/**
 * This constructor method creates and returns a productCatalog singleton object.
 * The method executes immediately on load.
 * object that executes
 * @return {Object} product catalog object
 * @namespace
 * @methodOf generic
 */
generic.productData = ( function() {
    // var data = {
    //     categories : [{
    //         CATEGORY_ID : "",
    //         products: [{
    //             PRODUCT_ID : "",
    //             skus: [{
    //                 SKU_ID : ""
    //             }]
    //         }]
    //     }]
    // };
    // var data = {};
    var data = {
        categories : []
    };
    var defaultCategoryFields = ["CATEGORY_ID", "CAT_BASE_ID", "CATEGORY_NAME"];
    var defaultProductFields = ["PRODUCT_ID", "DEFAULT_CAT_ID", "PARENT_CAT_ID", "PROD_RGN_NAME", "PROD_RGN_SUBHEADING", "SUB_LINE", "DESCRIPTION", "SHORT_DESC", "PROD_SKIN_TYPE", "PROD_SKIN_TYPE_TEXT", "PROD_CAT_IMAGE_NAME", "PROD_CAT_DISPLAY_ORDER", "SMALL_IMAGE", "LARGE_IMAGE", "THUMBNAIL_IMAGE", "PRODUCT_USAGE", "FORMULA", "ATTRIBUTE_COVERAGE", "ATTRIBUTE_BENEFIT", "SKIN_CONCERN_LABEL", "SKIN_CONCERN_1", "SKIN_CONCERN_2", "SKIN_CONCERN_3", "skus", "shaded", "sized", "worksWith"];
	var defaultSkuFields = ["SKU_ID", "SKU_BASE_ID", "PRODUCT_ID", "SHADENAME", "SHADE_DESCRIPTION", "SKIN_TYPE", "SKIN_TYPE_TEXT", "PRODUCT_SIZE", "DISPLAY_ORDER", "STRENGTH", "PRICE", "formattedPrice", "formattedTaxedPrice", "SMOOSH_DESIGN", "SMOOSH_PATH_STRING", "INVENTORY_STATUS", "REFILLABLE", "HEX_VALUE", "HEX_VALUE_STRING", "FINISH", "ATTRIBUTE_COLOR_FAMILY", "UNDERTONE", "SKIN_TONE", "SKIN_TONE_TEXT" ];

    var fetchData = function(args) {
        // check for relevant page_data
        /********* COMMENTED OUT UNTIL page_data and Analytics are converted ************/
        if (args.pageDataKey) {
            var catalogPageData = generic.page_data(args.pageDataKey);
            if (catalogPageData.get("rpcdata")) {
                 //Notify analytics.js that this exists instead of RPC data
                // document.fire("PAGEDATA:RESULT",args.pageDataKey);
                $(document).trigger("PAGEDATA:RESULT", [args.pageDataKey]);
                args.callback(catalogPageData.get("rpcdata"));
                return;
            }
        }

        var jsonRpcParams = {};
        if (args.categoryId) {
            jsonRpcParams.categories = [args.categoryId];
        }
        if (args.productId) {
            jsonRpcParams.products = [args.productId];
        } else if (args.productIds && $.isArray(args.productIds)) {
            jsonRpcParams.products = args.productIds;
        }
        if (args.categoryFields) {
            jsonRpcParams.category_fields = args.categoryFields;
        }
        if (args.productFields) {
            jsonRpcParams.product_fields = args.productFields;
        }
        if (args.skuFields) {
            jsonRpcParams.sku_fields = args.skuFields;
        }
        generic.jsonrpc.fetch({
            method: "prodcat",
            params: [jsonRpcParams],
            onSuccess: function(jsonRpcResponse) {
                args.callback(jsonRpcResponse.getValue());
            },
            onFailure: function (jsonRpcResponse) {}
        });
    };
    var getInternalCategoryData = function(args) {
        if (!( args.categoryId && data && $.isArray(data.categories) )) {
            return null;
        }
        var categoryMatch = null;
        for (var i=0, len=data.categories.length; i<len; i++) {
            var c = data.categories[i];
            if (c.CATEGORY_ID == args.categoryId) {
                categoryMatch = c;
                break;
            }
        }
        return categoryMatch;
    };
    var getInternalProductData = function(args) {
        if (!( args.productId && data && $.isArray(data.categories) )) {
            return null;
        }
        var productMatch = null;
        var categoryMatch = null;
        if (args.categoryId) {
            categoryMatch = getInternalCategoryData({categoryId : args.categoryId});
            if (categoryMatch && $.isArray(categoryMatch.products)) {
                for (var i=0, len=categoryMatch.products.length; i<len; i++) {
                    var p = categoryMatch.products[i];
                    if (p.PRODUCT_ID == args.productId) {
                        productMatch = p;
                        break;
                    }
                }
            }
        } else {
            for (var i=0, len=data.categories.length; i<len; i++) {
                var category = data.categories[i];
                if ($.isArray(category.products)) {
                    for (var j=0, jlen=categoryMatch.products.length; j<jlen; j++) {
                        var p = categoryMatch.products[j];
                        if (p.PRODUCT_ID == args.productId) {
                            productMatch = p;
                            break;
                        }
                    }
                }
                if (productMatch) {
                    break;
                }
            }
        }
        return productMatch;
    };

    /** @scope generic.productCatalog */
    return {
        /**
         * Returns product data for a given product ID.
         * @method getProductData
         * @public
         */
        getProductData : function (args) {

            if (!( args.productId)) {
                return null;
            }


            var productMatch = getInternalProductData({
                productId: args.productId,
                categoryId: args.categoryId
            });
            if (productMatch) {
                args.callback(productMatch);
            } else {
                var self = this;
                // to get the correct product data, we have to concatenate the Cat ID
                // and Prod ID with a ~ character and pass the resulting value as the product ID.
                var compoundProductId = args.productId;
                if (args.categoryId) {
                    compoundProductId = args.categoryId + '~' + args.productId;
                }

                fetchData({
                    pageDataKey: args.pageDataKey,
                    productId: compoundProductId,
                    categoryFields: args.categoryFields,
                    productFields: args.productFields,
                    skuFields: args.skuFields,
                    callback: function(responseData) {
                        self.setProductData(responseData);
                        var returnData = getInternalProductData({
                            productId: args.productId,
                            categoryId: args.categoryId
                        });
                        args.callback(returnData);
                    }
                });
            }
        },
        getProductsData : function (args) {
            if (!( args.productIds && $.isArray(args.productIds) )) {
                return null;
            }
            var productsDataArray = [];
            var productIdsToFetch = [];

            for (var i=0, len=args.productIds; i<len; i++) {
                var prodId = args.productIds[i];
                var productMatch = getInternalProductData({
                    productId: prodId
                });
                if (productMatch) {
                    productsDataArray.push(productMatch);
                } else {
                    productIdsToFetch.push(prodId);
                }
            }

            fetchData({
                pageDataKey: args.pageDataKey,
                productIds: productIdsToFetch,
                categoryFields : args.categoryFields || defaultCategoryFields,
                productFields : args.productFields || defaultProductFields,
                skuFields : args.skuFields || defaultSkuFields,
                callback: function(responseData) {
                    // self.setProductData(responseData);
                    // var returnData = getInternalProductData({
                    //     productId: args.productId,
                    //     categoryId: args.categoryId
                    // });
                    args.callback(responseData);
                }
            });
        },
        getCategoryData : function (args) {
            if ( !args.categoryId ) {
                return null;
            }
            var categoryMatch = getInternalCategoryData({
                categoryId: args.categoryId
            });
            if (categoryMatch) {
                args.callback(categoryMatch);
            } else {
                var self = this;
                fetchData({
                    pageDataKey: args.pageDataKey,
                    categoryId: args.categoryId,
                    productFields: args.productFields,
                    categoryFields: args.categoryFields,
                    skuFields: args.skuFields,
                    callback: function(responseData) {
                        self.setCategoryData(responseData);
                        args.callback(getInternalCategoryData({categoryId: args.categoryId}));
                    }
                });
            }
        },
        addCategory : function (newCategoryData) {
            if (!newCategoryData.CATEGORY_ID) {
                return null;
            }
            data.categories = data.categories || [];
            data.categories.push(newCategoryData);
            return newCategoryData;
        },
        addProduct : function (newProductData) {
            var categoryID = newProductData.PARENT_CAT_ID;
            var category = getInternalCategoryData({categoryId: categoryID});
            if (!category) {
                category = this.addCategory({
                    CATEGORY_ID: categoryID,
                    products: []
                });
            }
            category.products.push(newProductData);
        },
        setCategoryData: function(args) {
            if ( args.categories && $.isArray(args.categories) ) {
                for (var i=0, len=args.categories.length; i<len; i++) {
                    var newCategory = args.categories[i];
                    if ( !newCategory.CATEGORY_ID ) {
                        return null;
                    }
                    var oldCategory = getInternalCategoryData({
                        categoryId : newCategory.CATEGORY_ID
                    });
                    if (oldCategory) {
                        $.extend(oldCategory, newCategory);
                    } else {
                        this.addCategory(newCategory);
                    }
                }
            }

        },
        setProductData : function (args) {
            if ( args.products && $.isArray(args.products) ) {
                for (var i=0, len=args.products.length; i<len; i++) {
                    var newProduct = args.products[i];

                    if ( !(newProduct.PARENT_CAT_ID && newProduct.PRODUCT_ID) ) {
                        return null;
                    }
                    var oldProduct = getInternalProductData({
                        productId : newProduct.PRODUCT_ID,
                        categoryId : newProduct.PARENT_CAT_ID
                    });
                    if (oldProduct) {
                        $.extend(oldProduct, newProduct);
                    } else {
                        this.addProduct(newProduct);
                    }
                };
            }
        },
        clearAllData : function () {
            data = {};
        },

        validateSkusArray : function(skus) {
        	return (skus && $.isArray(skus) && skus.length > 0);
        },

        /**
         * This method returns a string that displays both post and pre-tax prices for a given SKU.
         * Locale-specific characters and format are hard-coded in the method.
         * @return {String} formatted string with pre- & post-tax prices
         * @param {Object} sku JSON-formatted SKU data. Must include formattedTaxedPrice and formattedPrice properties.
         * @param {String} separator Optional string that gets placed between both prices. Default is a space.
         * @methodOf generic.productData
         */
        getPriceDisplay : function (sku, separator) {
            if (sku && sku.formattedTaxedPrice && sku.formattedPrice) {
                var preTaxLabel  = '&#26412;&#20307;';
                var postTaxLabel = '&#31246;&#36796;';
                var openBracket = '( ';
                var closeBracket = ')';
                if (!separator) separator = ' ';
                var price_string = '';
                price_string = postTaxLabel + sku.formattedTaxedPrice + separator + openBracket + preTaxLabel + sku.formattedPrice + closeBracket;
                return price_string;
            } else {
                return '';
            }
        }

     };
} )();


