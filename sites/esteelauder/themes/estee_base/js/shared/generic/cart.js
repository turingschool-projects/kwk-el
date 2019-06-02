
var generic = generic || {};
generic.checkout = {};

/**
 * The cart is a singleton.  Multicart functionality needs to be extended,
 * where this singleton can provide a single reference to manage n carts.
 *
 * @class Cart
 * @namespace generic.checkout.cart
 *
 * @requires generic.cookie, generic.jsonrpc, generic.Hash
 *
 * @returns singleton cart object
 *
 */
generic.checkout.Cart = (function() {

    /**
     * @private declared dependencies of other js modules
     */
    var Hash = generic.Hash, JsonRpc = generic.jsonrpc, Cookie = generic.cookie;

    /**
     * @private singleton
     */
    var cart;

    /**
     * @private    private classes for mixin to service final api {}
     */
    var Properties = {

        setCookie: false

    },
    Containers = {
        order: new Hash(),
        payments: new Array(),
        carts: new Hash(),
        items: new Array(),
        samples: new Array()
    },
    CartData = {
        totalShoppedItems: 0,
        totalItems: 0
    },
    /**
     * @constant
     */
    CartConstants = {

        transactionParams: {
            transactionFields: {
                "trans_fields" : ["TRANS_ID", "payments"]
            },
            paymentFields: {
                "payment_fields" : ["address", "PAYMENT_TYPE", "PAYMENT_AMOUNT", "TRANS_PAYMENT_ID"]
            },
            orderFields: {
                "order_fields" : ["items", "samples", "address", "TRANS_ORDER_ID"]
            }
        },
        itemTypes: {
            "cart" : {
                 "id": "SKU_BASE_ID",
                 "_SUBMIT" : "cart"
             },
             "GiftCard" : {
                 "id": "GiftCard",
                 "_SUBMIT" : "giftcard"
             },
             "collection" : {
                 "id": "SKU_BASE_ID",
                 "_SUBMIT" : "collection.items"
             },
             "kit" : {
                 "id": "COLLECTION_ID",
                 "_SUBMIT" : "alter_collection"
             },
             "replenishment" : {
                 "id": "SKU_BASE_ID",
                 "_SUBMIT" : "alter_replenishment"
             },
             "favorites" : {
                 "id": "SKU_BASE_ID",
                 "_SUBMIT" : "alter_collection"
             }
        }
    },
    Ops = {
        /**
         * @private update cart state
         */
        _updateCartData: function(data){
            // console.log("generic.checkout.cart._updateCartData");
            var self = this;
            this.data = data;
            this.totalItems = data.items_count;
            this.defaultCartId = data.default_cart_id;
            this.payments = (data.trans && data.trans.payments) ? $.makeArray(data.trans.payments) : null;
            this.order = data.order;

            // contents and sample_contents mirror the sku by qty hashes
            this.order.contents = new Hash();
            this.order.sample_contents = new Hash();

            if (this.order.items != null) {
				this.order.items = $.map(this.order.items,
					function (ele) { // filter out nulls
						return (ele == null ? null : ele)
					}
				);
            }

            var items = this.order.items || null;
            var totalShoppedItems = 0;
            if (items != null) {
                $.each(items, function(){
                    if (!this) { return; }
                    totalShoppedItems+=this.ITEM_QUANTITY;

                    // set up contents by cart hashes
                    var cartID = this.CART_ID;
                    var cart = self.carts.get(cartID);
                    if (!cart) {
                        self.carts.set(cartID, new Hash());
                        cart = self.carts.get(cartID);
                        cart.set('contents', new Hash());
                    }
                    var id = this['sku.SKU_BASE_ID'] ? this['sku.SKU_BASE_ID'] : this.COLLECTION_ID;
                    cart.get('contents').set(id, this.ITEM_QUANTITY);

                    // compute per-unit tax (replace this with field from JSONRPC result when available)
                    var unitTax = this.APPLIED_TAX/this.ITEM_QUANTITY;
                    this.UNIT_TAX = unitTax;

                    // set up order contents hash (spans carts)
                    if (this.itemType.toLowerCase() == 'skuitem') {
                        var key = this['sku.SKU_BASE_ID'];
                        var qty = this.ITEM_QUANTITY;
                        //error self.order.contents.set(key, qty);
                        self.order.contents[key] = qty;
                    } else if (this.itemType.toLowerCase() == 'kititem') {
                        var key = this.COLLECTION_ID;
                        var qty = this.ITEM_QUANTITY;
                        self.order.contents.set(key,qty);
                    } else {
                        // FUTURE: other cart item types (e.g. kits)
                    }

                });
            }

            this.totalShoppedItems = totalShoppedItems;

            var samples = this.order.samples;
            if (samples != null) {
                $.each(samples,  function(){
                    // set up contents by cart hashes
                    var cartID = this.CART_ID;
                    var cart = self.carts.get(cartID);

                    if (!cart) {
                        self.carts.set(cartID, new Hash());
                        cart = self.carts.get(cartID);
                        cart.set('contents', new Hash());
                    }

                    var id = this['sku.SKU_BASE_ID'] ? this['sku.SKU_BASE_ID'] : this.COLLECTION_ID;
                    cart.get('contents').set(id, this.ITEM_QUANTITY);

                    // set up order contents hash (spans carts)
                    if (this.itemType.toLowerCase() == 'sampleitem') {
                        var key = this['sku.SKU_BASE_ID'];
                        var qty = this.ITEM_QUANTITY;
                        self.order.sample_contents.set(key,qty);
                    } else {
                        // other item types (are likely errors)
                    }
                });
            }

            // original:
            // if (self.setCookie) self.setCookie();
            // generic.events.fire({event:'cart:countsUpdated'});
            // generic.events.fire({event:'cart:updated'});

            //if (self.setCookie) self.setCookie();
            /**
             * @event cart:countsUpdated
             */
            //generic.events.fire({event:'cart:countsUpdated'});

        }
    },
    /**
     * @inner Api class with all the methods to handle cart
     */
    API = {
        initialize: function(args) {
             $.extend(this, args);
        },
        /**
         * @public getCartTotals
         */
        getCartTotals: function() {

            var cookie = Cookie("cart");
            if (cookie && cookie!==null) {
               // console.log("generic.cart.getCartTotals cookie: "+Object.toJSON(cookie));
               $.extend(this, cookie);

               /**
                * @events cart:countsUpdated
                */
               // generic.events.fire({event:'cart:countsUpdated'});
            } else {
               // console.log("generic.cart.getCartTotals !cookie");
               this.getCart();
            }

        },
        /**
         * @public setCookie
         */
        setCookie: function() {
            // console.log("generic.cart.setCookie "+this.totalItems);
            var s  = {
                totalItems: this.totalItems
            }
            s = JSON.stringify(s);
            Cookie("cart",s, {path:"/"});
        },
        /**
         * @public getCart
         * @returns id of updated cart
         */
        getCart: function(args) {

            //console.log("generic.cart.getCart");
            var self = this;

            if (args != null && args.pageDataKey) {
                var pageData = generic.page_data(args.pageDataKey);
                if (pageData.get("rpcdata")) {
                    // console.log( "cart page data found!" );
                    self._updateCartData(pageData.get("rpcdata"));
                    return;
                }
            }

            var params = {};
            $.extend ( params, self.transactionParams.transactionFields );
            $.extend ( params, self.transactionParams.paymentFields);
            $.extend ( params, self.transactionParams.orderFields);

             var id = generic.jsonrpc.fetch({
                method : 'trans.get',
                params: [params],
                onSuccess:function(jsonRpcResponse) {
                    self._updateCartData(jsonRpcResponse.getValue());
                },
                onFailure: function(jsonRpcResponse){
                    //jsonRpcResponse.getError();
                    console.log('Transaction JSON failed to load');
                }
            });
            return id;

        },
        /**
         * @public updateCart
         *
         * @param {object} onSuccess, onFailure callbacks
         *
         * @returns {number} incremented id uniquely identifying internal operations
         */
        updateCart: function(args){

            // console.log("cart.updateCart: "+Object.toJSON(args.params));
            if (!args.params) return null;

            var self = this;
            var onSuccess = args.onSuccess || new (function(){})(); // native empty function
            var onFailure = args.onFailure || new (function(){})(); // prev: prototype.emptyFunction

            var itemType = args.params.itemType || "cart"; //e.g. cart, collection, giftcard etc
            var id = self.itemTypes[itemType].id;
            var method = 'rpc.form';

            var params = {
                '_SUBMIT': self.itemTypes[itemType]["_SUBMIT"]
            };  // not-yet args.params

            //id // single id or collection id based on sku array from params
            if (id == 'SKU_BASE_ID') {
                params[id] = (args.params.skus.length == 1) ? args.params.skus[0] : args.params.collectionId; //MK collections array syntax correct?
            } else if (id == 'COLLECTION_ID') {
                params[id] = args.params.collectionId;
            }

            params["INCREMENT"] = args.params.INCREMENT;
            params["QTY"] = args.params.QTY;

            //offer code
            if (args.params.OFFER_CODE && args.params.OFFER_CODE.length>0) {
                params['OFFER_CODE'] = args.params.OFFER_CODE;
            }

            //favorites
            if (args.params.action && args.params.action.length > 0) {
                params['action'] = 'add';
            }

            //kit
            if (args.params.action && args.params.action == 'save') {
                params['action'] = 'save';
            }

            //replenishment
            if (args.params.REPLENISHMENT_FREQ && args.params.REPLENISHMENT_FREQ >= 0) {
                params['REPLENISHMENT_FREQ'] = args.params.REPLENISHMENT_FREQ;
            }
            if (args.params.add_to_cart && args.params.add_to_cart != 0) {
                params['add_to_cart'] = args.params.add_to_cart;
            }

            //giftcard
            if (args.params.ITEM_TYPE && args.params.ITEM_TYPE == 'GiftCard') {
                $.extend(params, args.params);
            }

            // targeting of the correct cart is still missing (and important to get right)
            // cart id if we are adding to something other than the default cart
            if (args.params.cart_id && (args.params.cart_id != self.defaultCartId)) {
                params['CART_ID'] = args.params.cart_id;
            }

            //method
            if (args.params.method && args.params.method.length > 0 ) {
                method = args.params.method;
            }

            // Save which catId the prod was displayed in
            if (args.params.CAT_BASE_ID && args.params.CAT_BASE_ID.length > 0) {
                params["CAT_BASE_ID"] = args.params.CAT_BASE_ID;
            }

          //CSRF Token
          if ($.cookie('csrftoken')) {
            params['_TOKEN'] = $.cookie('csrftoken');
          }

            var id = JsonRpc.fetch({
                "method" : method,
                "params" : [params], // [{}]
                "onSuccess": function(jsonRpcResponse){

                    var data = jsonRpcResponse.getData();
                      var cartResultObj = jsonRpcResponse.getCartResults();
                    //load data
                    if (data && data["trans_data"]) {
                        self._updateCartData(data["trans_data"]);
                    }
                    if (args.params.itemType == 'cart') {
                         // $(document).trigger("cart.updated", [cartResultObj]);
                    };
                    if (args.params.itemType == 'favorites') {
                        /**
                         * @event favorites:updated
                         */

                        $(document).trigger("favorites.updated", [jsonRpcResponse]);
                    };
                    if (args.params.itemType == 'kit') {
                        /**
                         * @event kit:updated
                         */

                        $(document).trigger("kit.updated", [jsonRpcResponse]);
                    };
                    if (args.params.itemType == 'replenishment') {
                      	$(document).trigger("cart.updated", [cartResultObj]);
                    };
                    onSuccess(jsonRpcResponse);

                },
                "onFailure": function(jsonRpcResponse){
                    onFailure(jsonRpcResponse);
                }
            });

            return id;

        },
        /**
         * @public getItemQty
         * @returns {number}
         */
        getItemQty : function(baseSkuId) {
            if (!this.order.items) return 0;
            /* prototype js code:
            var lineItem = this.order.items.find( function (line) {
                return line['sku.SKU_BASE_ID'] ==  baseSkuId;
              });
            if (!lineItem) {
                return 0;
            }
            return lineItem.ITEM_QUANTITY;
            */
            for(i in this.order.items) {

                if( i['sku.SKU_BASE_ID'] == baseSkuId ) {

                    var lineItem = i;
                    break;
                }

            }
            if(!lineItem) return 0;
            return lineItem.ITEM_QUANTITY;
        },
        /**
         * @public getBaseSkuIds
         * @returns {array}
         */
        getBaseSkuIds: function() {  //MK: what is this used for?
            //console.log("generic.cart.getBaseSkuIds: "+this.order.items);
            /* prototype js code:
            if (!this.order.items) return new Hash();
            var baseSkuIds = this.order.items.pluck( 'sku.SKU_BASE_ID' ); //MK what about giftcards/collections?
            return baseSkuIds;
            */
            if (!this.order.items) return new Hash();
            var baseSkuIds = [];
            for(i in this.order.items) {
                baseSkuIds.push(i['sku.SKU_BASE_ID']);
            }
            return baseSkuIds;
        },
        /**
         * @public getSubtotal
         * @returns {number}
         */
        getSubtotal: function() {
            var lineItems = this.order.items;
            if (!this.order.items) return 0;
            var subtotal = 0;
            for (var i=0, len = lineItems.length; i<len; i++) {
                var lineItem = lineItems[i];
                subtotal += (lineItem.UNIT_PRICE + lineItem.UNIT_TAX) * lineItem.ITEM_QUANTITY;
            }
            return subtotal;
        },
        /**
         * @public getTotalShoppedItems
         * @returns {number}
         */
        getTotalShoppedItems: function(){ //products and gift cards
           /** var ttl = 0;
            var items = this.order.items;
            if (items != null) {
                items.each(function(item){
                    if (item && item.ITEM_QUANTITY) {
                        ttl += item.ITEM_QUANTITY;
                    }
                });
            }
            return ttl;**/
            return this.totalShoppedItems;
        },
        /**
         * @public getTotalSamples
         * @returns {number}
         */
        getTotalSamples: function() {
             var ttl = 0;
             var samples = this.order.samples;
                if (samples != null) {
                    samples.each(function(item){
                        ttl += item.ITEM_QUANTITY;
                    });
            }
            return ttl;
        },
        /**
         * @public getTotalItems
         * @returns {number}
         */
        getTotalItems: function(){
           // return this.getTotalShoppedItems() + this.getTotalSamples();
           return this.totalItems;
         }

    };

    cart = $.extend(cart,API,Ops,CartConstants,CartData,Containers,Properties);

    var extra = {
        sample : function(){alert('sample');}
    }

    return function(){

        if(cart) { return cart; }

        // initial and only-time singleton reference
        cart = $.extend(this,cart);
        cart.api = extra.sample;

    };

}() ) ;

generic.checkout.cart = new generic.checkout.Cart();
