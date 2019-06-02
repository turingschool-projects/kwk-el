
var generic = generic || {};
generic.page_data = generic.page_data || {};
var page_data = page_data || {};

generic.page_data = function(pageDataKey) {
    var getPageDataValue = function(pageDataKey) {

        if (typeof pageDataKey != "string") {
            return $H({});
        }
        // avoid deep cloning of page_data
        if (pageDataKey && page_data) {
            var key = pageDataKey;
            var parts = key.split(".");
            var length = parts.length;
            var val = page_data;
            var k;
            while (k = parts.shift()) {
                if (val[k]) {
                    val = val[k];
                }
                else {
                    return $H({});
                }
            }
            var rh;
            // For scalars and arrays make a return hash where the key is the pageDataKey
            if (typeof val == "string"
                    || typeof val == "number"
                    || $.isArray(val)) {
                var t = new Object;
                t[pageDataKey] = val;
                rh = $H(t);
            }
            else {
                rh = $H(val);
            }

            if (rh) {
                return rh;
            }
            else {
                return $H({});
            }
        }
        else {
            return $H({});
        }
    };
    var pageDataValue = getPageDataValue(pageDataKey);
    var returnObj = {
        get: function(key) {
            if ( typeof key != "string") {
                return null;
            }
            var val = pageDataValue.get(key);
            return val;
        }
    };
    return returnObj;
};

