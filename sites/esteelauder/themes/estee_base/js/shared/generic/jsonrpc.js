
var generic = generic || {};

/**
 * This singleton class provides an interface to the Perl Gem JSON-RPC methods via AJAX.
 * @memberOf generic
 *
 * @class JsonRpc
 * @namespace generic.jsonrpc
 * @returns public object that provides the main api method - "fetch"
 */

generic.jsonrpc = ( function() {

    /**
     * @description Object literal that gets returned to provide the public api
     * @requires generic.env (dependency)
     */
    var jsonRpcObj = {

        id: 0,
        //url: generic.env.domain + "/rpc/jsonrpc.tmpl",
        url: "/rpc/jsonrpc.tmpl",
        /**
         * @constant error codes describe scenarios for post onSuccess
         * errorHandling that points to onFailure
         */
        errorCodes: {
            101: "The data type of this method is not supported.",
            102: "The data type of the request parameters is not supported.",
            103: "Your request did not return any results.",
            104: "Response is not in the expected format."
        },

        /**
         * @function main public api
         *
         * @param {object} Object literal with list of callbacks, onBoth for single callback regardless of
         * ajax response, and onSuccess && onFailure together to switch depending on the condition
         * of the asynchronous response.
         *
         * @returns incremented id to mark unique fetch
         */
        fetch: function(/* Object*/args) {

            var self = this;
            this.id++;
            
            var bustBrowserCache = false;
            if (typeof args.bustBrowserCache === "boolean" && !!args.bustBrowserCache ) {
                bustBrowserCache = true;
            }

            /**
             * @default
             */
            var options = {method:'post'};
            if (args.sync){
                options.async = false;
            }


            if (args.onBoth) {
                options.onSuccess = args.onBoth;
                options.onFailure = args.onBoth;
            } else {
                options.onSuccess = args.onSuccess || function (response) {
                    //console.log('JSON-RPC success');
                    //console.log(JSON.parse(response.getValue()));
                };
                options.onFailure = args.onFailure || function (response) {
                    //console.log('JSON-RPC failure');
                    //console.log(JSON.parse(response.getMessages()));
                };
            }
            var requestRpcId = this.id; // A local copy of id for the onSuccess callback
            options.onSuccess = options.onSuccess.wrap( function(response) {
                if (!response||!response.responseText) { // empty response
                    errorHandler(self.createErrorResponse(103));
                        return false;
                    }

                    /**
                     * @event RPC:RESULT is fired during the wrapping callback
                     * that front-runs the site-level callbacks (which were parameters to fetch)
                     */
                    //generic.events.fire({event:'RPC:RESULT',msg:response});
                    $(document).trigger("RPC:RESULT", [response, args, requestRpcId]);

                    var responseArray = $.parseJSON(response.responseText);

                    if ($.isArray(responseArray)) {

                        var resultObj = responseArray[0];
                        if (resultObj) {

                            var jsonRpcResponse = generic.jsonRpcResponse(resultObj);
                            if (resultObj.error) { // server returns an error, pass to onFailure
                                errorHandler(jsonRpcResponse); return false;

                            } else if (resultObj.result) { // successful response in expected format
                                //console.log("generic.jsonrpc.onSuccess");

                                return jsonRpcResponse; /* Move on to the wrapped function */

                            }
                        } else { // top-level response array is empty
                            errorHandler(self.createErrorResponse(103)); return false;
                        }
                    } else { // response is not in expected format (array)
                        errorHandler(self.createErrorResponse(104)); return false;
                    }

            });

            options.onFailure = options.onFailure.wrap( function(jqXHR) {

                var resp = jqXHR;
                //server returned failure, i.e. onFailure was not triggered by this class
                if (typeof resp.responseText != "undefined") {
                    //console.log("generic.jsonRPC onFailure: server error");
                    try { //server returns an error in json
                        var responseArray = JSON.parse(resp.responseText);
                        var resultObj = responseArray[0];
                        resp = generic.jsonRpcResponse(resultObj);
                    } catch(e) { //server response is not json
                        //console.log("generic.jsonRPC onFailure: server error, result is not json");
                        resp = self.createErrorResponse(resp.status,resp.responseText);
                    }
                }
                return resp;
            });

            /**
             * @function errorHandler takes over when the generic level onSuccess concludes that
             * the rpc response fails to qualify
             *
             * @see onFailure callback
             */
            var errorHandler = options.onFailure;
            var method = args.method || 'rpc.form';
            var params = args.params || [];

            // make sure a method was passed
            if ( typeof method !== "string" || method.length <= 0 ) {
                errorHandler(self.createErrorResponse(101));
                return null;
            }

            //make sure that the params type is an obj
            if (typeof params === 'string') {
                params = JSON.parse(params);
            }
            if (typeof params !== 'object') {
                errorHandler(self.createErrorResponse(102));
                return null;
            }
            
            var postMethod = args.method || "rpc.form";
            var postArray = [{
                   "method": postMethod,
                   "id": self.id,
                   "params": params
               }];
             options.data = $.param({JSONRPC: JSON.stringify(postArray)});


            var url = this.url + '?dbgmethod=' + method;
            if (bustBrowserCache) {
                url += "&cachebuster=" + Date.parse( new Date() );
            }

            //url = 'jsonrpc-response-example.html'; // debug, force success example

            /* Mapping Functions */

            /**
             * @private map jquery's responses to a single, relevant param
             */
            var jqSuccess = function(data, textStatus, response) {
                return options.onSuccess.call(options,response);
            };
            var jqError = function(jqXHR, textStatus, errorThrown) {
                return options.onFailure.call(options,jqXHR);
            };

            /*
             * Jquery success property of options (object)
             *
             * success(data, textStatus, jqXHR)Function, Array
             *
             * A function to be called if the request succeeds. The function gets passed three arguments:
             * The data returned from the server, formatted according to the dataType parameter;
             * a string describing the status; and the jqXHR (in jQuery 1.4.x, XMLHttpRequest) object.
             * As of jQuery 1.5, the success setting can accept an array of functions.
             * Each function will be called in turn. This is an Ajax Event.
             *
             */
            options.success = jqSuccess;

            /*
             * Jquery error property of options (object)
             *
             * error(jqXHR, textStatus, errorThrown) Function
             *
             * A function to be called if the request fails.
             * The function receives three arguments: The jqXHR (in jQuery 1.4.x, XMLHttpRequest)
             * object, a string describing the type of error that occurred and an optional
             * exception object, if one occurred. Possible values for the second argument (besides null)
             * are "timeout", "error", "abort", and "parsererror". This is an Ajax Event.
             * As of jQuery 1.5, the error setting can accept an array of functions.
             * Each function will be called in turn.
             *
             * Note: This handler is not called for cross-domain script and JSONP requests.
             */


            options.type = "POST";
            options.error = jqError;

            // console.log("==================");
            // console.log("===options.data===");
            // console.log(options.data);

            $.ajax(url, options);
            return this.id;
        },
        /**
         * @public Exposed api method to generate a jsonRpcResponse object with
         * "error" as the primary key.
         *
         * @param {integer} The integer value maps to a set of class constants
         * that describes the type of error.
         *
         * @param {integer, string} Overloaded method takes precedence
         * over single param.  Error code and error message passed
         * explicitly.
         *
         * @returns {object} An "error" keyed jsonRpcResponse object
         */
        createErrorResponse: function(errorCode, errorMsg) {
            errorMsg = errorMsg || this.errorCodes[errorCode];
            var errorObj = new generic.jsonRpcResponse({
                "error" : {
                    "code": errorCode,
                    "data": {
                    "messages" : [{
                        "text" : errorMsg,
                        "display_locations" : [],
                        "severity" : "MESSAGE",
                        "tags" : [],
                        "key" : ""
                         }]
                    }
                },
                "id" : this.id
            });
            return errorObj;
        }

    };

    return jsonRpcObj;
})();


/**
 * A JsonRpcResponse object is of the expected type as parameters to the onSuccess,
 * onFailure, or onBoth callback functions.
 *
 * @memberOf generic
 *
 * @class JsonRpcResponse
 * @namespace generic.jsonRpcResponse
 * @param {object} resultObj - PerlGem RPC response formatted object
 *
 */
generic.jsonRpcResponse = function (resultObj) {
    var jsonRpcResponseObj = {};
    var rawResponse = resultObj; // raw response data is kept in a private variable

    /**
     * @inner Constructor
     * @constructs CartItem
     */
    var CartItem = function(itemData) {
        this.product = {
            sku: {}
        };
        var prodRegEx = /^prod\.(.+)$/;
        var skuRegEx = /sku\.(.+)$/;
        var prodObj = { sku: {} };
        for (var prop in itemData) {
            var newPropName = null;
            var prodResult = prop.match(prodRegEx);
            if (prodResult && prodResult[1]) {
                newPropName = prodResult[1];
                this.product[newPropName] = itemData[prop];
            }
            if (!newPropName) {
                var skuResult = prop.match(skuRegEx);
                if (skuResult && skuResult[1]) {
                    newPropName = skuResult[1];
                    this.product.sku[newPropName] = itemData[prop];
                }
            }
            if (!newPropName) {
                this[prop] = itemData[prop];
            }
        }
    }

    /**
     * @inner Constructor
     * @constructs CartResult
     */
    var CartResult = function(responseData) {
        var data = responseData;
		var cartItemCount = "";
        var cartItem = {
            product: {
                sku: {}
            }
        };
        var cartMethod;
        var allItems = [];
        var transData;

        if (data.ac_results &&
                $.isArray(data.ac_results) &&
                    data.ac_results[0]) {

            if (data.ac_results[0].result &&
                    data.ac_results[0].result.CARTITEM) {
                cartItem = new CartItem(data.ac_results[0].result.CARTITEM);
            }
            if (data.ac_results[0].action) {
                cartMethod = data.ac_results[0].action;
            }
        }

        if (data.trans_data &&
                data.trans_data.order &&
                    $.isArray(data.trans_data.order.items) ) {
            cartItemCount = data.trans_data.items_count;
            transData = data.trans_data;
            $.each(data.trans_data.order.items, function() {
                var tempItem = new CartItem(this);
                allItems.push(this);
            });

        }
        //------------------
        // PUBLIC METHODS
        //------------------
        /**
         * @public CartResult.getAllItems
         */
        this.getAllItems = function() {
            return allItems;
        }
        /**
         * @public CartResult.getItem
         */
        this.getItem = function() {
            return cartItem;
        };
        /**
         * @public CartResult.getMethod
         */
        this.getMethod = function() {
            return cartMethod;
        }
        /**
         * @public CartResult.getCount
         */
        this.getCount = function() {
            return cartItemCount;
        }
        /**
         * @public CartResult.getTransData
         */
        this.getTransData = function() {
            return transData;
        }
    };

    /* Debug Method + Prop *
    jsonRpcResponseObj.getTest = function() { alert('test')} ; // temporary
    jsonRpcResponseObj.testValue = 'test val'; // temporary
    */

    /**
     * @public JsonRpcReponse.getId
     */
    jsonRpcResponseObj.getId = function() {
        if (rawResponse) {
            return rawResponse.id;
        }
        return null;
    };
    /**
     * @public JsonRpcReponse.getError
     */
    jsonRpcResponseObj.getError = function() {
        if (rawResponse &&
            rawResponse.error) {
            return rawResponse.error;
        }
        return null;
    };
    /**
     * @public JsonRpcReponse.getData
     */
    jsonRpcResponseObj.getData = function() {
        if (rawResponse &&
            rawResponse.result &&
            rawResponse.result.data) {
            return rawResponse.result.data;
        }
        return null;
    };
    /**
     * @public JsonRpcReponse.getValue
     */
    jsonRpcResponseObj.getValue = function() {
        if (rawResponse &&
            rawResponse.result &&
            typeof rawResponse.result.value != "undefined") {
            return rawResponse.result.value;
        }
        return null;
    };
    /**
     * @public JsonRpcReponse.getMessages
     *
     * @description This method returns the contents of the response's error property.
     * It first checks the result property, then checks the error property.
     */
    jsonRpcResponseObj.getMessages = function() {
        if (rawResponse) {
            if (rawResponse.result &&
                rawResponse.result.data &&
                rawResponse.result.data.messages) {
                return rawResponse.result.data.messages;
            } else if (rawResponse.error &&
                       rawResponse.error.data &&
                       rawResponse.error.data.messages) {
                return rawResponse.error.data.messages;
            }
        }
        return null;
    };
    /**
     * @public JsonRpcReponse.getCartResults
     */
    jsonRpcResponseObj.getCartResults = function() {
        var data = this.getData();
        if (!data) {
            return null;
        }
        var returnObj = new CartResult(data);
        return returnObj;
    };

    return jsonRpcResponseObj;
};




/*
 * generic.onLoadRpcRequests a global array of RPC request objects
 * must be initialized pre-DOM-load and formatted like this:
 * [
 *     {
 *         "method":   "user.json",
 *         "params":   [{}],
 *         "onSuccess" : function () { },
 *         "onFailure" : function () { }
 *     }
 * ]
 *
 */
$( function() {
    // TODO Modify generic.jsonrpc to allow multiple methods
    // on one request, then use it for this Ajax call. 
    var requests = generic.onLoadRpcRequests || [];
    var queryVals = [];

    for (var i=0, len=requests.length; i<len; i++) {
        var postMethod = requests[i]["method"] || "rpc.form";
        queryVals[i] = {
            "method": postMethod,
            "params": requests[i].params,
            "id": i + 1
        };
    }
    
    if (queryVals.length < 1) {
        return null;
    }

    var successHandler = function(data, textStatus, response) {
        for (var i=0, len=requests.length; i<len; i++) {
            var fn = requests[i].onSuccess;
            if (typeof fn !== 'function') {
                continue;
            }
            fn( data[i] );
        }
    }

    var url = "/rpc/jsonrpc.tmpl";
    var options = {};
    
    // ELCTWO-571 requires that we pass brand, region, and locale ids to ensure proper responses 
    // on the pg side for drupal sites.  To accomplish this we pass 'addl_url_params' within the arguments.
    // This snippets searches for such entries and adds 'em to the request url.
    var url_params = "";
    $(queryVals).each( function () {
      if (this.params[0].url_params) {
        if (this.params[0].url_params.charAt(0) === '&') {
          url_params += this.params[0].url_params;
        } else {
          url_params += '&' + this.params[0].url_params;
        }
      }
    });
    if (url_params !== "") {
      url += '?' + url_params.substring(1);
    } 

    options.data = $.param({JSONRPC: JSON.stringify(queryVals)});

    options.type = "POST";
    options.success = function(data, textStatus, response) {
        // console.log("Ajax success :::::::::::::::::::::");
        // console.log(arguments);
    
        successHandler(data, textStatus, response);
    };
    options.error = function(jqXHR, textStatus, errorThrown) {
        // console.log("Ajax error :::::::::::::::::::::");
        // console.log(arguments);
    };

    $.ajax(url,options);


});
