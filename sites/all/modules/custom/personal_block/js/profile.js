
var site = site || {};
var generic = generic || {};

// Global variables
var profileRequests = new Array;

/**
    * Class used to handle site profiling, which involves the getting, the possible setting and the possible processing 
    *   of a user's attributes into tailored content or data for a page.
    * Public methods can be used then used to handle specific overall scenarios for a pages profiling. 
    *   Example: Setting touts on a page based on user defined skin type.
    * The profile_user config defines that rules that are ingested by this class on page load.
    * The class first looks for the config info in page_data and then will fire an rpc call if not found.
    * Arguments can be passed when initiating the class but not required.
    * @methodOf site
*/
site.profile = function( args ) {

    /**** Global vars ****/
    var options = jQuery.extend( args, {
        setStorage  : (args && args.setStorage) ? args.setStorage : true
    });

    var storage         = {};
    var hasStorage      = function() {
        return jQuery.isEmptyObject(storage) ? false : true;
    };

    /**** Global classes and functions ****/

    /**
        * Private class used to not only store the config data but also help with retrieving
        *   specific attributes and rules also.
        * @method load:
        *   - Grabs the profile config from the page and stores it when not available.
        *   - Also set the internal config obj to be used later by _getData.
        * @method attr:
        *   - Used to get specific attributes for the profile config.
        *   - An optional sub param can be set to return a value one level down of the attribute obj.
        * @method rule:
        *   - Same as the attr method except used to get specific attributes for the profile config.
        *   - An optional sub param can be set to return a value one level down of the rules obj.
        * @returns {Object} The individual config objects and helper functions.
        * @private
    */
    var _config = function() {

        var config = {};

        // Helper methods that get passed with the data obj being requested.
        var _helpers = {
            get : function(key) {
                return this[key];
            }
        };

        var _getData = function(type, key, sub) {
            var data = config[type];
            if (data) {
                // Return key config info based on sub or return {} if no key exists.
                var obj = data[key] ? sub ? data[key][sub] : data[key] : {};
                jQuery.extend(obj, _helpers);
                return obj;
            } else {
                return {};
            };
        };

        return {
            attr : function(key, sub) {
                return _getData('attributes', key, sub);
            },
            rule : function(key, sub) {
                return _getData('rules', key, sub);
            },
            load : function() {
                // Look for rules data object first in cached source, page data or cookie, or fire rpc call.
                if (jQuery.isEmptyObject(this.rules)) {
                    var personalBlock = Drupal.settings.personal_block;
                    var profileConfig = personalBlock ? personalBlock.profile_config : '';
                    if (profileConfig) {
                      config = jQuery.extend(this, profileConfig);
                    } else {
                      console.log('PERSONALIZATION PROFILE_CONFIG NOT AVAILABLE');
                    }
                } else {
                    // make rpc call to get rules if not in page source.
                };
            }
        };
    }();

    /**
        * Private function used to handle the storage class.
        * site.profile defaults to having storage set to true but if not, this will
        *   not set the global storage variable which stores the storage class.
        * If setStorage is set to true and the storage class isn't available, a
        *   console message is posted.
        * @private
    */
    var _setStorage = function() {
        if (!options.setStorage) {
            return false;
        };

        if (site.profile.storage) {
            storage = site.profile.storage({
                config : _config
            });
        } else {
            console.log('Profile storage class is not loading.');
        };
    };

    /**
        * Private function used to return an object from the API results to handle all the post API needs.
        * Each rules obj in the results array is wrapped with a set of default methods and any additional modifications.
        * Setter functions are also added to handle specific situations like 
        *   processing the rules output or map nodes to the rules obj.
        * All setter methods return the results array even if nothing is added to each rule obj.
        * @param {Array} results *REQUIRED* : Results array returned from the profile api.
        * @returns {Array} Array of results object from the api extended with helper functions.
        * @private
    */
    var _setResultModifications = function(results) {
        if (!results) {
            return null;
        };

        var origResults = results;

        // Define the default methods that will be added to the results obj.
        var defaultMethods = {
            getValue : function(key) {
                var value = (this[key] && this[key].value) ? this[key].value : '_';
                return value;
            }
        }

        // Mapping of the defaultMethods to the global resultsArray with additional obj modifications.
        var resultsArray = jQuery.map( results, function(obj) {
            // Add rule param to the results object.
            var ruleId = obj.rule_id;
            if (ruleId) {
                for (var i in profileRequests) {
                    if (ruleId === profileRequests[i].rule_id) {
                        obj['rule_name'] = profileRequests[i].rule;
                        break;
                    };
                };
            };
            // Extend the result object with the default methods.
            return jQuery.extend(obj, defaultMethods);
        });

        return resultsArray;
    };

    /**
        * Private class used for methods specific to calling the profile.process_rule rpc method.
        * @method call:
        *   - Handles the actual calling to the api.
        *   - Expects a set of params that can be used by calling this class and a callback.
        *   - Callback is to be used for anything that needs to happen after the rules results have been processed.
        *   - If the results from the filtering come back with rules that have all values stored, the json call is bypassed.
        * @method get:
        *   - Handles the collecting of the results data that is already stored in the cache.
        *   - Once the value is received from the cache, it is formatted to the correct obj format.
        * @method filter:
        *   - Handles the filtering of the rules that have values in the cache.
        *   - The rules that have all there values storage get pushed to the hasValues array and
        *       those that don't have all there values, including dependencies, get pushed to noValues.
        * @method format:
        *   - Handles the formatting of the params that will be passed to the API.
        *   - Expects an array of DOM nodes that have the specific rule and data attributes.
        *   - Returns a formatted obj that can be used for the profile API params.
        * @method analytics:
        *   - Handles the storage of the results data and sending of rule data to analytics.
        *   - During rule filtering and after the rpc call, each completed rule object gets pushed to analytics.data.
        *   - Once everything is collected, which is determined if an RPC call is required or not, analytics.send is fired.
        *   - @param {Array} data: The array containing all rule objects being pushed to the analytics engine.
        @   - @method send: Hook into the analytics engine which should pass the this.data object.
        * @private
    */
    var _API = {
        call : function(array) {
            var rulesConfig = _config.rules;

            if (!rulesConfig
                || !array
                || !array[0]) {
                return null;
            };

            var paramObj = {
                rules : array
            };

            // Set an array of all rule's out_params to be used to filter out the rpc results.
            var outParams = [];
            jQuery(array).each( function() {
              var ruleConfig    = this.name ? rulesConfig[this.name] : '';
              var ruleOutParams = ruleConfig ? ruleConfig.out_params : '';
              jQuery(ruleOutParams).each(function(i, param) {
                 var insert = ($.inArray(param, outParams) >= 0) ? false : true;
                 if (insert) {
                    outParams.push(param);
                 };
              });
            });

            generic.jsonrpc.fetch({
                method: 'profile.process_rule',
                params: [paramObj],
                onBoth: function(response) {
                    var results     = response.getValue();
                    var modResults  = _setResultModifications(results);
                    if (hasStorage() && modResults[0]) {
                        // Filter out results that are only set as out_params in a rule.
                        var filteredResultsObj = {};
                        jQuery(modResults).each( function(i, result) {
                            _API.analytics.data.push(result);
                            for (var key in result) {
                                var insert = ($.inArray(key, outParams) >= 0) ? true : false;
                                if (insert) {
                                  filteredResultsObj[key] = result[key];
                                };
                            };
                        });
                        storage.set(filteredResultsObj, true);
                    };

                    jQuery(modResults).each(function(index, result) {
                        jQuery(array).each( function(pIndex, param) {
                            if (param.rule_id == result.rule_id) {
                                if (param.callback) {
                                    param.callback(result);
                                };
                            };
                        });
                    });
                    _API.analytics.send();
                },
                onError: function () {  }
            });
        },
        setRequests : function() {
            if (!profileRequests || !profileRequests[0]) {
                return null;
            };

            // Format requests for filtering
            var params              = this.format(profileRequests);
            var filteredObj         = this.filter(params);

            // Grab stored values
            var valuesArray     = filteredObj.hasValues;
            var noValuesArray   = filteredObj.noValues;
            var storedResults   = valuesArray[0] ? this.get(valuesArray) : [];

            // If stored values exist, use the callback of each result.
            if (storedResults && storedResults[0]) {
                var modResults = _setResultModifications(storedResults);
                jQuery(modResults).each( function(index, result) {
                  _API.analytics.data.push(result);
                  if (result.callback) {
                    result.callback(result);
                  };
                });
            };

            // If stored values don't exist, fire this.call to fetch values
            if (noValuesArray && noValuesArray[0]) {
                this.call(noValuesArray);
            } else {
                _API.analytics.send();
            };
        },
        get : function(array) {

            if (!array && !array[0]) {
                return {};
            };

            var resultsArray = [];

            jQuery.each(array, function(index, rule) {
                var ruleName    = rule.name;
                var rulesConfig = _config.rules;
                if (!ruleName || !rulesConfig) {
                    return null;
                };

                var resultObj       = {};
                var ruleInfo        = rulesConfig[ruleName];
                var outParams       = ruleInfo ? ruleInfo.out_params : [];

                for (var param in rule) {
                    if (param != 'name') {
                        resultObj[param] = rule[param];
                    }
                };

                jQuery(outParams).each( function(index, param) {
                    var paramVal = ( hasStorage() && storage.hasValue(param) ) ? storage.get(param) : '';
                    if (paramVal) {
                        resultObj[param] = {
                            "value" : paramVal
                        };
                    };
                });

                resultsArray.push(resultObj);
            });

            return resultsArray;

        },
        filter : function(array) {

            if (!array && !array[0]) {
                return {};
            };

            var valueArray    = [];
            var filteredRules = [];
            jQuery(array).each(function(index, rule) {
                var ruleName    = rule.name;
                var rulesConfig = _config.rules;

                if (!ruleName || !rulesConfig) {
                    return null;
                };

                // Make sure rules exists
                var ruleInfo = rulesConfig[ruleName];
                if (!ruleInfo) {
                    return null;
                };

                var outParams       = ruleInfo.out_params;
                var outParamsTotal  = outParams.length;

                var valueCount = 0;
                if (!rule.force_call) {
                    jQuery(outParams).each( function(index, param) {
                        if (hasStorage() && storage.hasValue(param)) {
                            valueCount++;
                        };
                    });
                };

                if (valueCount != outParamsTotal) {
                    var in_params   = ruleInfo.in_params;
                    // Add params to the rule unless none are already included.
                    rule['params']  = rule['params'] ? jQuery.extend({}, rule['params']) : {};
                    jQuery(in_params).each(function(index, param) {
                        // If storage is available and the param has any value.
                        if (hasStorage() && storage.get(param)) {
                            var sendValue = true;
                            // If param has an expiration, check expiration otherwise send value.
                            if (storage.getExp(param)) {
                                // If param value has not expired, send value to rpc otherwise don't.
                                sendValue = storage.hasValue(param) ? true : false;
                            };
                            if (sendValue) {
                                rule['params'][param] = storage.get(param);
                            };
                        };
                    });
                    filteredRules.push(rule);
                } else {
                    valueArray.push(rule);
                }
            });

            return {
                hasValues : valueArray,
                noValues  : filteredRules
            };

        },
        format : function(array) {
            if (!array || !array[0]) {
                return null;
            };

            var rulesArray = [];
            jQuery(array).each( function(index, rule) {
                var name        = rule.rule;
                var params      = rule.params;
                var rule_id     = rule.rule_id;
                var callback    = rule.callback;
                var force_call  = rule.force_call;

                // set up default rule param.
                var ruleObj = {
                    'name' : name
                };

                // add data if available
                if (params) {
                    ruleObj['params'] = params;
                };

                // add id if available
                if (rule_id) {
                    ruleObj['rule_id'] = rule_id;
                };

                // add callback if available
                if (callback) {
                    ruleObj['callback'] = callback;
                };

                // add force_call if available
                if (force_call) {
                    ruleObj['force_call'] = force_call;
                };

                rulesArray.push(ruleObj);
            });

            return rulesArray;
        },
        analytics : {
          data : [],
          send : function() {
              // Spot to place analytics hook.
              tms_page_data['PSN'] = this.data;
          }
        }
    };


    /**
        * Private function used to return the output defined by the profile_rules config.
        * Maps any output defined in rules config to each rules obj by looking for the path_base and out params in the results.
        * The path_base is first applied to the output and then the optional out params are added if available.
        * Once the output is determined, if permutations are defined, the getPermutations function
        *   will return the permutation value from the profile_rules config, else it will return the original value.
        * @returns {String} The output set within the profile.config for the rule.
        * @private
    */
    var _getOutput = function(obj) {
        var objRule = obj.rule;
        if (!objRule) {
            return null;
        };

        var getPermutations = function(value) {
            var perm = permutations[value];
            if (perm && perm['path']) {
                return perm['path'];
            } else {
                return value;
            };
        };

        var output       = '';
        var permutations = objRule.permutations;

        // Build output
        var defaultBasePath = _config.default_path_base;
        if (defaultBasePath) {
            output += defaultBasePath;
        };

        var node = obj.node;
        if (node) {
            var nodeId = node.getAttribute('data-nid');
            output += '/' + nodeId;
        }

        var pathBase = objRule.path_base;
        if (pathBase) {
            output += pathBase + '/';
        };

        // Add params based on param seq order.
        var outParams = objRule.out_params;
        if (outParams) {
            var pOutput = '';
            jQuery(outParams).each(function(index, param) {
                var value = obj.getValue(param);
                if (value) {
                    pOutput += ( index == 0 ) ? value : ( '/' + value );
                };
            });
            var paramPath = permutations ? getPermutations(pOutput) : pOutput;
            output += paramPath;
        };
        return output ? output : '';
    }

    /**** Global initialization functions ****/
    _config.load();
    _setStorage();

    /** @scope site.profile */
    return {
        call : function(args) {
            return _API.call(args);
        },
        setRequests : function() {
            _API.setRequests();
        },
        getConfig : function() {
            return _config;
        },
        format : function(rulesArray) {
            return _API.format(rulesArray);
        },
        getOutput : function(obj) {
            return _getOutput(obj);
        },
        reset : function() {
            if (hasStorage()) {
                storage.reset();
            }
        }
    }
};
