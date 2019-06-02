
var generic = generic || {};
generic.rb = generic.rb || {};

var rb = rb || {};

/**
* This method provides access to resource bundle values that have been
* written to the HTML in JSON format. The file that outputs these values
* must be included in the .html as a script tag with the desired RB name
* as a query string paramter.
*
* @class ResourceBundle
* @namespace generic.rb
*
* @memberOf generic
* @methodOf generic
* @requires generic.Hash (minimal functional replication of Prototype Hash Class)
*
* @example Inline data
*
*    <script src="/js/shared/v2/internal/resource.tmpl?rb=account"></script>
*
* @example Script retrival of data values
*
*    var myBundle = generic.rb("account");
*    myBundle.get("err_please_sign_in");
*
*
* @param {String} rbGroupName name of resource bundle needed
*
* @returns An object that provides the main get method
*
*/
generic.rb = function(rbGroupName) {

    var findResourceBundle = function(groupName) {

        if (groupName && rb) {

            var rbName = groupName;
            var rbHash = generic.Hash(rb[rbName]);
            if (rbHash) {
                return rbHash;
            } else {
                return $H({});
            }
        } else {
            return $H({});
        }

    };

    var resourceBundle = findResourceBundle(rbGroupName);

    var returnObj = {
        /**
        * @public This method will return the value for the requested Resource Bundle key.
        * If the key is not found, the key name will be returned.
        *
        * @param {String} keyName key of desired Resource Bundle value
        */
        get: function(keyName) {
            if ( !generic.isString(keyName) ) {
                return null;
            }
            var val = resourceBundle.get(keyName);
            if (val) {
                return val;
            } else {
                return keyName;
            }
        }
    };

    return returnObj;

};