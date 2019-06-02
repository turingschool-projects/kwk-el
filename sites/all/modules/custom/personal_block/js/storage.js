
var site = site || {};
var generic = generic || {};
site.profile = site.profile || {};

/**
    * Class used to handle profile caching.
    * When available, site.profile will use this to store the attributes returned when a rule is processed or
    *   check the cache for a specific attribute value when needed.
    * This class is using cookie storage but other types of storage will be explored (i.e. html5 storage).
    *  @method get:
    *   - Returns the value of a specific attribute set in the profile.config when available.
    *   - Only returns values that are in the cache and not expired.
    *   - If the value is expired or not set, it will return null.
    *   - @param {String} key *REQUIRED* : Attribute name defined in profile.config
    *  @method hasValue:
    *   - Similar to get except returns a boolean instead of the value.
    *   - @param {String} key *REQUIRED* : Attribute name defined in profile.config
    *  @method set:
    *   - Method used to set a data obj or array of data objects to storage.
    *   - Does not take the expiration into account so this is a hard set.
    *   - Once a value is passed, it will format that value into a scalar or array based on the attribute config.
    *   - After the value is set, it is then sent to the cache.
    *   - Example data object format:
    *   {
    *       'SKIN_TYPE' : {
    *           value : 3
    *       }
    *   }
    *   If a value obj isn't set to the attribute, it will not be passed to the cache storage.
    *   - @param {Object} obj *REQUIRED* : Either an object or array of data objects that follows the format described.
    * @methodOf site.profile
*/
site.profile.storage = function( args ) {
    if (!args || !args.config) {
        return {};
    };

    /**** Global vars ****/
    var config = args.config;

    /**
        * Class used to handle the data handling within a cookie.
        * Once the cookie is initialized, helper functions are used to set values stored
        *   within the cookie.
        * The cookie is formatted in JSON after the value obj has been set using JSON.stringify.
        * In order to read or set a value or expiration in the cookie, JSON.parse is used to
        *   convert the string value into a javascript obj.
        * Double quotes are also removed so the value size can be kept at a minimum.
        * @private
    */
    var _cookie = {
        name  : 'PSN',
        value : {},
        attr  : {
            path    : "/",
            expires : 365
        },
        init : function() {
            if (!this.name) {
                return null;
            };
            var userCookie = generic.cookie ? generic.cookie(this.name) : null;
            if (userCookie) {
                this.value = userCookie;
            } else {
                this.set();
            };
        },
        currentTime : function() {
            var date = new Date();
            // convert milliseconds to seconds
            return Math.floor(date.getTime() / 1000);
        },
        hasExpired : function(key) {
            var expiration = this.getExpiration(key);
            return (this.currentTime() > expiration ) ? true : false;
        },
        check : function() {
            // Makes sure cookie value is obj.
            var modVal = this.value;
            if (typeof modVal == 'string') {
                var cVal = modVal.replace(/\'/g, '"');
                modVal = JSON.parse(cVal);
                this.value = modVal;
            };
            return modVal;
        },
        set : function(val) {
            var cookieVal = val || JSON.stringify(this.value);

            // Remove array escaping, spaces and double quotes.
            var match = cookieVal.replace(/\"\[/g, '[');
            match = match.replace(/\]\"/g, ']');
            match = match.replace(/\\\"/g, '"');
            match = match.replace(/^\s/g, '');
            match = match.replace(/\"/g, "'");

            if (generic.cookie) {
              generic.cookie(this.name, match, this.attr);
            }
        },
        setKey : function(key, val, exp) {
            var keyAbbr = _getKeyAbbr(key);
            if (!key && !keyAbbr) {
                return null;
            };
            this.init();
            this.check();
            this.value[keyAbbr] = {};
            this.setValue(key, val);
            this.setExpiration(key, exp);
            this.set();
        },
        setValue : function(key, val) {
            var keyAbbr = _getKeyAbbr(key);
            if (!keyAbbr || !this.value[keyAbbr]) {
                return null;
            };
            this.check();
            this.value[keyAbbr]['v'] = val;
            this.set();
        },
        setExpiration : function(key, exp) {
            var keyAbbr = _getKeyAbbr(key);
            if (!keyAbbr || !this.value[keyAbbr]) {
                return null;
            };
            this.check();
            var newExp = exp ? (this.currentTime() + exp) : '';
            this.value[keyAbbr]['t'] = newExp;
            this.set();
        },
        getValue : function(key) {
            this.check();
            var keyObj = this.value[_getKeyAbbr(key)] || {};
            return keyObj.v ? keyObj.v : null;
        },
        getExpiration : function(key) {
            this.check();
            var keyObj = this.value[_getKeyAbbr(key)] || {};
            return keyObj.t ? keyObj.t : null;
        }
    };

    /**
        * Private function used to return an attributes abbreviation (abbr) from the attribute config.
        * Passing the full key name will return the abbreviation or null.
        * @param {String} key *REQUIRED* : Name of the attribute set in profile.config.
        * @returns {String} The abbreviation of the attribute passed.
        * @private
    */
    var _getKeyAbbr = function(key) {
        var attrConfig = config.attributes;
        if (!key || !attrConfig) {
            return null;
        };

        return ( attrConfig[key] && attrConfig[key].abbr ) ? attrConfig[key].abbr : null;
    };

    /**
        * Private function used to return a bolean value when an attribute value is set and not expired.
        * If either of those requirements are not set, false is returned.
        * The cache method getValue is first called to see if a value is set.
        * If a value is returned, the cache method hasExpired is then called to see if it needs to reset.
        * If the value has not expired, true is returned.
        * @param {String} key *REQUIRED* : Name of the attribute set in profile.config.
        * @returns {Boolean} Whether a value is available in the cache.
        * @private
    */
    var _checkValue = function(key) {
        if (!key) {
            return false;
        };

        var keyValue = _cookie.getValue(key);
        if (keyValue) {
            var expired = false;
            if (_cookie.hasExpired(key)) {
                expired = true;
            };
            return expired ? false : true;
        } else {
            return false;
        };
    };

    /**
        * Private function used to set an attribute and reset any of it's dependent attributes.
        * The attribute key and value is passed along with an optional expiration when needed.
        * Once the key, value and optional expiration are sent to the cache obj, any dependencies
        *   are checked for and if any are returned there expirations are voided.
        * This is done to make sure the rules are properly set with the most recent information.
        * @param {String} key *REQUIRED* : Name of the attribute set in profile.config.
        * @param {String} val : Value of the attribute to be set.
        * @param {Number} exp : Optional expiration value to be sent to the cache obj.
        * @private
    */
    var _setKey = function(key, val, exp) {
        if (!key) {
            return null;
        };

        _cookie.setKey(key, val, exp);

        var cacheConfig  = config.attr(key, 'data').get('cache');
        var dependencies = cacheConfig.dependencies;
        if (dependencies && dependencies[0]) {
            jQuery(dependencies).each( function(index, dKey) {
                if (_checkValue(dKey)) {
                    _cookie.setExpiration(dKey, '');
                };
            });
        };
    };

    /**
        * Private function that returns the attribute value if available.
        * After making sure a key is passed, it goes straight to the cache obj to retrieve the value else it returns null.
        * @param {String} key *REQUIRED* : Name of the attribute set in profile.config.
        * @returns {String/Number} The value of an attribute if available.
        * @private
    */
    var _getValue = function(key) {
        if (!key) {
            return null;
        };
        return _cookie.getValue(key);
    };

    /**
        * Private function that returns the attribute expiration if available.
        * After making sure a key is passed, it goes straight to the cache obj to retrieve the expiration else it returns null.
        * @param {String} key *REQUIRED* : Name of the attribute set in profile.config.
        * @returns {String/Number} The expiration of an attribute if available.
        * @private
    */
    var _getExpiration = function(key) {
        if (!key) {
            return null;
        };
        return _cookie.getExpiration(key);
    };

    /**
        * Private function used to filter the data object(s) passed to the public set method.
        * If the obj passed is not an array, the obj is placed within one to keep the interface flexible.
        * As each method is iterated through, it makes sure each obj attribute is an object and follows the format:
        *   {
        *       'SKIN_TYPE' : {
        *           value : 3
        *       }
        *   }
        * This is done since some attributes of the obj might not be related to the actual value; example being a DOM node id.
        * If the object does, it with then check the attribute config to set the value formatting and then
        *   pass that to the _setKey function to set the attribute and any attributes.
        * @param {Object} obj *REQUIRED* : Either an object or array of data objects that follows the format described.
        * @param {Boolean} isOutParam : Boolean passed to know when a call is fired from the JSON-RPC call.
        * @private
    */
    var _setValues = function(obj, isOutParam) {
        if (!obj) {
            return null;
        };

        var array = jQuery.isArray(obj) ? obj : [obj];

        jQuery(array).each(function(index, resultObj) {
            for (var key in resultObj) {
                var result = resultObj[key];
                if (typeof result == 'object' && result.value) {
                    var attrConfig   = config ? config.attr(key, 'data') : '';
                    var cacheConfig  = jQuery.isEmptyObject(attrConfig) ? '' : attrConfig.get('cache');
                    if (cacheConfig && !jQuery.isEmptyObject(cacheConfig)) {
                        var formattedVal = _formatValue(key, result.value, isOutParam);
                        var expiration   = isOutParam ? cacheConfig.expire : '';
                        _setKey(key, formattedVal, expiration);
                    };
                };
            };
        });
    };

    /**
        * Function used to format an attribute value by using the attribute data config.
        * Once an attribute key and value is passed, the attribute config is queried to see
        *   if the attribute data config is set.
        * If the config is set and the config contains a type not a scalar, a switch is called to 
        *   handle the other types to get the formatting information.
        * A switch is used so other format types can be added without too much issue.
        * Here is an explanation of each type:
        * @type scalar (default):
        *   - The easiest form of storage.
        *   - It just sets that value to what is passed.
        *   - No rules are applied at this point.
        * @type array:
        *   - The array format type is used for attributes with multiple values, such as a list of category ids.
        *   - The config data limit sets the size of the array while the data stack determines how the array is populated.
        *   - An array limit is needed to be set in the config or a value will not be added to the array.
        *   - Once the array is populated with the new value, it is then returned.
        * @returns {String/Number/Array} Newly formatted value.
        * @private
    */
    var _formatValue = function(key, val, isOutParam) {
        if (!key || !val) {
            return null;
        };

        var defaultVal  = '_';
        var dataConfig  = config.attr(key, 'data');
        var type        = dataConfig.type;
        if (type && type != 'SCALAR') {
            var newVal = '';
            switch(type) {
                case 'ARRAY':
                    var keyVal      = _cookie.getValue(key);
                    var cacheInfo   = dataConfig.get('cache');
                    var replaceVal  = (cacheInfo.replace_on_out_param && isOutParam) ? true : false;
                    if (keyVal && !replaceVal) {
                        var insert  = true;
                        var modVal  = (typeof keyVal == 'string') ? JSON.parse(keyVal) : keyVal;
                        if (dataConfig.unique) {
                            // If unique is set, add new value to array only if it's not there already.
                            insert = ($.inArray(val, keyVal) >= 0) ? false : true;
                        };
                        if (insert) {
                            var arrayLimit  = dataConfig.limit;
                            // Replace initial value if it's default.
                            modVal = ( modVal[0] == defaultVal ) ? [] : modVal;
                            if ( jQuery.isArray(val) ) {
                              // Merge the arrays if the val is also an array.
                              jQuery.merge(modVal, val);
                            } else {
                              // Unshift the val when it is a string or int.
                              modVal.unshift(val);
                            }
                            // Check the for the array limit if it is set in the config.
                            if ( arrayLimit && (modVal.length > arrayLimit) ) {
                                var stack = dataConfig.stack;
                                if (!stack || stack == 'FIFO') {
                                    modVal = modVal.splice(0, arrayLimit);
                                };                            
                            };
                        };
                        newVal = modVal;
                    } else {
                        if (jQuery.isArray(val)) {
                            newVal = val;
                        } else {
                            var array = new Array();
                            array.push(val);
                            newVal = array;
                        };
                    };
                    break;
            };
            return newVal;
        } else {
            return val;
        };
    };

    /**
        * Function used to reset the entire storage cache and not a single attribute.
        * Used for scenarios when the cache needs to be reset for maybe a new user at a
        *   kiosk or a scenario involving sign-in/sign-out that requires a storage reset.
        * After instantiating site.profile, you can call this when needed.
        * @private
    */
    var _reset = function() {
        // Just pass a single space to reset the cache.
        _cookie.set(' ');
    };

    /**
        * Function to remove an attribute value and timestamp stored in the PSN front-end storage.
        * Used to force the backend to reprocess an attribute by looking at the backend storage when a rule is called.
        * Calls _setKey() and passes only the attribute name, to reset the attribute.
        * @param {keys} array or string *REQUIRED* : Either a string or array of attributes values to remove.
    */
    var _deleteValues = function(keys) {
        if (!keys) {
            return null;
        };
        var array = jQuery.isArray(keys) ? keys : [keys];
        jQuery(array).each(function(index, key) {
          // If attribute exists in cookie, reset it.
          if (_getValue(key)) {
              // Reset the value and expiration to force reprocessing.
              _setKey(key, '', '');
          };
        });
    };

    /**
        * Function to reset the timestamp of an attribute stored in the PSN front-end storage.
        * Used to resend the stored attribute value to the backend for reprocessing.
        * Calls _setKey() and passes the attribute name and value if exists in storage already to reset the attribute.
        * @param {keys} array or string *REQUIRED* : Either a string or array of attributes to reset.
    */
    var _expireValues = function(keys) {
        if (!keys) {
            return null;
        };
        var array = jQuery.isArray(keys) ? keys : [keys];
        jQuery(array).each(function(index, key) {
          var val = _getValue(key);
          // If attribute exists in cookie, reset it.
          if (val) {
              // Reset the value and expiration to force reprocessing.
              _setKey(key, val, '');
          };
        });
    };

    // Init cookie class.
    _cookie.init();

    /** @scope site.profile.storage */
    return {
        get : function(key) {
            return _getValue(key);
        },
        getExp : function(key) {
            return _getExpiration(key);
        },
        hasValue : function(key) {
            return _checkValue(key);
        },
        deleteValues : function(keys) {
            _deleteValues(keys);
        },
        expireValues : function(keys) {
            _expireValues(keys);
        },
        set : function(obj, isOutParam) {
            _setValues(obj, isOutParam);
        },
        reset : function() {
            _reset();
        }
    }

};
