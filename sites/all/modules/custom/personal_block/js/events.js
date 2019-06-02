
var site = site || {};
var generic = generic || {};
site.profile = site.profile || {};

/**
    * Class used to handle event setting for a rule attribute.
    * After an event, say a page view or quiz completion, this class allows you to pass an
    *   attribute to the profile cache for future processing.
    * Once a value is stored, it will be sent for processing if a rule that uses that attribute is called.
    *  @method store:
    *   - The store method is the public method available to pass that attribute value.
    *   - You can send either a value obj or an array of value objects in the following format:
    *      { 'SKIN_TYPE' : 3 }
    *   - Once the value is sent, it will be formatted as per the site.profile class requirements and sent
    *       for validation and processing.
    *   - @param {Object} obj *REQUIRED* : Either an object or array of data objects that follows the format described above.
    * @methodOf site.profile
*/
site.profile.events = function( args ) {

    /**** Global vars ****/
    var options         = jQuery.extend(args, {});
    var profile         = site.profile();
    var config          = {};
    var storage         = {};

    /**
        * Load function used to store the config and storage object.
        * If either aren't loaded, they will load there respective classes.
        * The config object will either call the profile class or the global profile_config variable.
        * If the storage object isn't loaded, the site.profile.storage will be called.
        * @private
    */
    var _load = function() {
        if (jQuery.isEmptyObject(config)) {
            config = profile.getConfig() || profile_config;
        };

        if (jQuery.isEmptyObject(storage)) {
            storage = site.profile.storage ? site.profile.storage({
                config : config
            }) : {};
        };
    };

    /**
        * Function used to format and return the object passed to the public method following
        *   the requirements of the site.profile class.
        * Example:
        *   Converts:
        *       {
        *           'SKIN_TYPE' : 3
        *       }
        *   to:
        *       {
        *           'SKIN_TYPE' : {
        *               'value' : 3
        *           }
        *       }
        * @returns {Object} Newly formatted object.
        * @private
    */
    var _format = function(obj) {
        if (!obj) {
            return null;
        };

        var newObj = {};
        for (var key in obj) {
            newObj[key] = {
                value : obj[key]
            };
        };
        
        return newObj;
    };

    /**
        * Function used to check if the data value obj passed is not empty and then
        *   call the storage set method if storage is available.
        * @private
    */
    var _callStorage = function(obj) {
        if (jQuery.isEmptyObject(obj)) {
            return null;
        };

        if (!jQuery.isEmptyObject(storage)) {
            storage.set(obj);
        };
    };

    /**
        * Function used to check if the data obj passed is an array or object and
        *   then call the _callStorage function to store the attribute value.
        * _load is called before to make sure the storage is set properly.
        * @private
    */
    var _store = function(obj) {
        if (!obj) {
            return null;
        };

        _load();

        if (jQuery.isArray(obj)) {
            jQuery(obj).each(function(index, obj) {
                _callStorage(_format(obj));
            });
        } else {
            _callStorage(_format(obj));
        };
    };

    /**
        * Function used to remove the stored attribute value by calling the storage.deleteValues method.
        * Deleting an attribute clears the value and expiration so when a rule is called,
        *   the attribute will processed on the backend.
        * _load is called before to make sure the storage is set properly.
        * @private
    */
    var _delete = function(keys) {
        if (!keys) {
            return null;
        };
        _load();
        storage.deleteValues(keys);
    };

    /**
        * Function used to expire an attribute Value by calling the storage.expireValues method.
        * Resetting an attribute timestamp clears the expiration so when a rule is called,
        *   the stored attribute will processed on the backend.
        * _load is called before to make sure the storage is set properly.
        * @private
    */
    var _expire = function(keys) {
        if (!keys) {
            return null;
        };
        _load();
        storage.expireValues(keys);
    };

    // Init classes needed for events.
    _load();

    /** @scope site.profile.events */
    return {
        store : function(obj) {
            _store(obj);
        },
        expire : function(keys) {
            _expire(keys);
        },
        del : function(keys) {
            _delete(keys);
        }
    }

};