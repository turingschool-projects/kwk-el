
var site = site || {};
var generic = generic || {};
site.profile = site.profile || {};

/**
    * Class used to handle the population of profile touts.
    *  @method set:
    *   - Handles populating specific DOM nodes with touts based on the rule set in the 'data-profile-rule' attribute.
    *   - Uses site.profile to gather the specific data of a user based on that 
    *       attribute and then process the results to determine the correct touts.
    *   - @param {String} data-profile-rule *REQUIRED* : Rule used for that tout. Rules are set in the profile.tmpl config.
    *   - @param {Object} data-profile-options : Used to override the results for testing or if that rule info is 
    *       already determined before firing site.profile.  Needs to be JSON formatted. Example '{ "SKIN_TYPE" : 3 }'
    * @methodOf site.profile
*/
site.profile.touts = function( args ) {

    /**** Global vars ****/
    var options     = args || {};
    var profile     = site.profile();
    var config      = profile.getConfig();

    /**
        * Private class used for methods specific to handling DOM nodes.
        * @method get:
        *   - Gets all the DOM nodes that use the attribute defined on method load and returns the array.
        *   - Uses global options.ruleAttr and if nothing is matched, will return an empty array.
        *   - @param {String} ruleAttr *REQUIRED* : Unique DOM node id used to collect rule specific nodes. 
        * @method parse:
        *   - Handles the extracting of the rules and rules data from the DOM nodes.
        *   - Iterates through each node and creates an array of rules obj to use where needed.
        *   - Returns an array unless an array of DOM nodes or a ruleAttr is not defined in options.
        *   - @param {Array}  nodes     *REQUIRED* : Array of DOM nodes that will be used to generate the rules object array.
        *   - @param {String} ruleAttr  *REQUIRED* : Unique DOM node id used to collect rule specific nodes.
        *   - @param {String} dataAttr             : Optional attribute added to each rule node that can be used to override values.
        *   - @returns {Array} Array of dom node objects that contain rules.
        * @method set:
        *   - Used by the public method 'set' to handle the setting of DOM nodes.
        *   - The profile DOM nodes are first collected then a params obj is created to submit to site.profile assigned to profile.
        *   - Once the results are returned, the DOM info is mapped back to the data.
        *   - Next, the DOM is then populated with the correct touts based on the rules used to define the output.
        *   - @param {Obj} args *REQUIRED* : Object arguments used by this.get to determine which DOM nodes to capture.
        * @private
    */
    var _nodes = {
        get : function() {
            var ruleAttr = options.ruleAttr;
            if (!ruleAttr) {
                return null;
            };
            var nodes = jQuery('[' + ruleAttr + ']');
            return nodes;
        },
        parse : function(nodes) {
            var ruleAttr    = options.ruleAttr;
            var dataAttr    = options.dataAttr;

            if ( !nodes
                 || !nodes[0]
                 || !ruleAttr ) {
                return null;
            };

            var rulesArray = [];
            jQuery(nodes).each( function(index, node) {
                var ruleId   = node.getAttribute('data-rule-id');
                var rulesObj = {
                    'node'     : node,
                    'rule'     : node.getAttribute(ruleAttr),
                    'rule_id'  : ruleId,
                    'callback' : function(result) {
                        var resultsMatch = _addNodeInfo(nodes, result);
                        _populateDOM(resultsMatch);
                    }
                };
                if (dataAttr) {
                    // expects json formatting
                    var attr = dataAttr.replace("data-","");
                    rulesObj['data'] = jQuery(node).data(attr);
                };
                rulesArray.push(rulesObj);
            });

            return jQuery(rulesArray);
        },
        set : function(args) {
            if (!args) {
                return null;
            };
    
            jQuery.extend(options, args);

            var nodes       = this.get(args);
            var rulesArray  = this.parse(nodes);

            jQuery(rulesArray).each( function(index, rule) {
                profileRequests.push(rule);
            });

            profile.setRequests();
        }
    };

    /**
        * Private function used to map each DOM node with a rule to the rules results.
        * Does the mapping by matching the node id of the nodes passed into the function with
        *   the id in the obj returned from the API.
        * If a match is made, the node and rule are added to the original obj result obj.
        * If no object is matched, the original object is just passed back.
        * @param {Array} nodes *REQUIRED* : Set of DOM nodes in an array used to match with the API results.
        * @param {Array} results *REQUIRED* : Global results array containing the rules returned from the API.
        * @returns {Object} A result object passed from the API extended with the node info for mapping.
        * @private
    */
    var _addNodeInfo = function(nodes, results) {

        if (!nodes || !results) {
            return null;
        };

        // Add results to an array if it's a single obj.
        var results = jQuery.isArray(results) ? results : [results];

        return jQuery.map(results, function(obj) {
            // Assign result object to a node if available
            if (nodes && nodes[0]) {
                jQuery(nodes).each(function(index, node) {
                    var ruleId = node.getAttribute('data-rule-id');
                    if (ruleId == obj.rule_id) {
                        var attr = options.ruleAttr.replace("data-","");
                        obj['node']     = this;
                        obj['rule']     = config.rule(jQuery(node).data(attr));
                        obj['output']   = profile.getOutput(obj);
                    };
                });
            };

            return obj;
        });
    }

    /**
        * Private function that ties into generic.templatefactory.
        * Returns a template that is then passed into a callback param.
        * @param {String} args.path *REQUIRED* : Path of the template to be retrieved.
        * @param {Function} args.callback *REQUIRED* : Functionality to be done after the template is fetched.
        * @param {Object} args.params : Optional params that can be passed into the template being fetched.
        * @private
    */
    var _getTemplate = function(args) {
        var path     = args.path;
        var callback = args.callback;
        var params   = args.params || {};

        if (!path || !callback) {
            return null;
        };

        generic.template.get({
            path     : path,
            callback : callback
        });
    };

    /**
        * Private function specific to populating the DOM using the output defined each rules object.
        * Need to pass each rules object with the output defined, which assumes is a path.
        * The callback is set to replace the node defined in the result obj with the fetched template.
        * @param {String} args.output *REQUIRED* : Path of the template to be retrieved.
        * @private
    */
    var _populateDOM = function(results) {
        if (!results) {
            return null;
        };

        jQuery(results).each( function(index, result) {
            _getTemplate({
                path     : result.output,
                callback : function(json) {

                    var jsonObj = '';
                    try {
                        jsonObj = JSON.parse(json);
                    } catch (e) {
                        //console.log('PERSONAL_BLOCK::JSON is not valid');
                        return false;
                    };
                    var html    = jsonObj.html;
                    var js      = jsonObj.js;

                    var node = result.node;
                    if (node) {
                        if (html) {
                            jQuery(node).html(html);
                        };
                    };
                    if (js) {
                       // When js is available, append it to the body to re-initialize module js.
                       var script = document.createElement("script");
                       script.type = "text/javascript";
                       try {
                         jQuery(script).append(js);
                       } catch (e) {
                         //console.log('PERSONAL_BLOCK::JSON Block js not available.');
                         return false;
                       };
                       document.body.appendChild(script);

                       Drupal.attachBehaviors();
                    };

                    // Fix for carousel bug with attachBehaviors.
                    var slideShowNodes = jQuery(node).find('.cycle-slideshow');
                    if (slideShowNodes[0]) {
                        slideShowNodes.cycle();
                    };
                }
            });
        });
    };

    /** @scope site.profile.touts */
    return {
        set : function(args) {
            _nodes.set(args);
        }
    }
};

