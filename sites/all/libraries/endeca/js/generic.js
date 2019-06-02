


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
generic.endeca.generic.rb = function(rbGroupName) {
    
    var findResourceBundle = function(groupName) {
        
        if (groupName && rb) {
            
            var rbName = groupName;
            var rbObj = rb[rbName];
            if (rbObj) {
                return rbObj;
            } else {
                return {};
            }
        } else {
            return {};
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
            if ( typeof(keyName) != "string" ) {
                return null;
            }
            var val = resourceBundle[keyName];
            if (val) {
                return val;
            } else {
                return keyName;
            }
        }
    };
    
    return returnObj;

};


/**
 * Minimal Native Version of Prototype Class
 * 
 * @deprecated Jquery extend method has options for deep copy extensions
 * 
 * @class Class
 * @namespace generic.Class
 * 
 */

generic.endeca.generic.Class = { // Uppercase 'Class', avoid IE errors

    fn : function(src,props) {
    
        var tgt,prxy,z,fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    
            tgt = function(){ // New Constructor
            // Initialize Method is a Requirement of Class
                // With the inclusion of the _super method, initialize in the superclass should only be called on demand
                /*if(tgt.superclass&&tgt.superclass.hasOwnProperty("initialize")){
                    tgt.superclass.initialize.apply(this,arguments);
                }*/
                if(tgt.prototype.initialize){
                    tgt.prototype.initialize.apply(this,arguments);
                } 
            };
        
            // Preserve Classical Inheritance using Proxy Middle
            src = src || Object;
            prxy = function(){}; /* Potentially define "Class" here */
            prxy.prototype = src.prototype;
            tgt.prototype = new prxy();
            tgt.superclass = src.prototype;
            tgt.prototype.constructor = tgt;
    
            // give new class 'own' copies of props and add _super method to call superclass' corresponding method
            for(z in props){
                if ( typeof props[z] == "function" && typeof tgt.superclass[z] == "function" && fnTest.test(props[z]) ) {
                    tgt.prototype[z] = ( function( z, fn ) {
                        return function() {
                            this._super = tgt.superclass[z];
                            var ret = fn.apply( this, arguments );
                            return ret;
                        };
                    })( z, props[z] )
                } else {
                    tgt.prototype[z] = props[z];
                }
                /*if(props.hasOwnProperty(z)){tgt.prototype[z]=props[z];}*/
            }
    
        return tgt;
    
    }, 
    create : function(){

        var len = arguments.length, args = Array.prototype.slice.call(arguments), fn = generic.endeca.generic.Class.fn;
        
            if(len==2) {  tgt = generic.endeca.generic.Class.fn(args[0],args[1]); }
            else if(len==1) {  tgt = generic.endeca.generic.Class.fn(null,args[0]); } 
            else { tgt = function(){}; /* return empty constructor */ }

        return tgt; // return constructor that stacks named Class w/ object-literal, works with instanceof
    
    }, // End Create Method    
    mixin: function( baseClass, mixin ) {
        var newClass = baseClass;
        if ( mixin && mixin.length ) { 
            for ( var i=0; i < mixin.length; i++ ) {
                newClass = generic.endeca.generic.Class.mixin( newClass, mixin[i] );
            }
        } else {
            if ( mixin ) { newClass = generic.endeca.generic.Class.create( newClass, mixin ); }
        }
        return newClass;
    }  
};


generic.endeca.generic.env = { 
    isIE : !!(typeof(ActiveXObject) == 'function'),
    isIE6 : !!(!!(typeof(ActiveXObject) == 'function') && (/MSIE\s6\.0/.test(navigator.appVersion))),
    isFF : !!(typeof(navigator.product) != 'undefined' && navigator.product == 'Gecko' && !( (document.childNodes) && (!navigator.taintEnabled)) && /firefox/.test(navigator.userAgent.toLowerCase()) ),
    isFF2 : !!(typeof(navigator.product) != 'undefined' && navigator.product == 'Gecko' && !((document.childNodes) && (!navigator.taintEnabled)) && navigator.userAgent.toLowerCase().split(' firefox/')[1] && navigator.userAgent.toLowerCase().split(' firefox/')[1].split('.')[0] == '2'),
    isFF3 : !!(typeof(navigator.product) != 'undefined' && navigator.product == 'Gecko' && !((document.childNodes) && (!navigator.taintEnabled)) && navigator.userAgent.toLowerCase().split(' firefox/')[1] && navigator.userAgent.toLowerCase().split(' firefox/')[1].split('.')[0] == '3'),
    isMac    : !!(/macppc|macintel/.test(navigator.platform.toLowerCase())),
    isSafari : !!(/Safari/.test(navigator.userAgent)),
    
    domain : window.location.protocol + "//" + window.location.hostname,
    
    debug: true, //JSTest check subdomain

    parsedQuery : function () {

        var query = window.location.search.toString().split('?')[1] || "";
        var splitStr = query.split('&'); 
        var key, value, keyNameVar, tempObj, tempStr; 

        var a = {}; a.n = {};
    	
        var main = function() {

          var params = {};
          var returnArr = [];
          var arr = [];
    		
          if(!query) return;
          
          for(var i = 0; i < splitStr.length ; i++) {
            // just take the key
            key = splitStr[i].split('=')[0];
            if (key != "") {
              value = splitStr[i].split('=')[1];
              
              var rx = new RegExp(key);
              var c = splitStr[i].match(rx);
              
              if(eval('a.n.'+c)) { // if namespace already exists
                eval('a.n.'+c+'.e += 1');
                eval('a.n.'+c+'.v.push(value);');
              }
              else { // first-time penalty
                eval('keyNameVar = { v:[], key:"'+c+'" };');
                eval('a.n.'+c+' = keyNameVar;');
                eval('a.n.'+c+'.e = new Number(0); a.n.'+c+'.v.push(value);');
              }
            }
          }
          
          for(var namespace in a.n) {
            // if duplicate keys
            if(a.n[namespace].e>0) {
              for(var n = 0; n <= a.n[namespace].e; n++) {
                arr.push(a.n[namespace].v.pop());
              } // end for-loop
    				
              a.n[namespace].v = arr;	
            }

            tempObj = a.n[namespace].v;
            if(tempObj.length>1) { eval('params.'+namespace+'=tempObj'); } 
            else { tempStr = tempObj[0]; eval('params.'+namespace+'=tempStr'); }
          }
          return params;	
    	}

    	var parameters = main() || {};
    	return parameters;
    	
    },
    query: function(key) { 
        var result = generic.endeca.generic.env.parsedQuery()[key] || null;
        return result; 
    }
};


/**
 * Template.js
 * 
 * @memberOf generic
 * 
 * @class TemplateSingleton
 * @namespace generic.template
 * 
 * @requires object literal with parameters
 * 
 * @param path attribute as a literal key is required
 * @example "/templates/cart-overlay.tmpl",
 * 
 * @param {string} templateString takes first priority
 * @example templateString:'#{product.url} some-page-markup-with-#{product.url}'
 * 
 * @param {boolean} forceReload
 * 
 * @param {function} callback
 * @example
 * 
 * callback:function(html) {
 *    // Front-End Resolution
 *    jQuery('#container').html(html);
 * }
 * 
 * @param {object} query object hash with object-literals, array-literals that can be nested
 * @example example structure
 * query: {
 *    a:'',b:{},c:[],d:{[]} // keys rooted to named parent if object or array-objects are nested
 * }
 * 
 * @param {object} Hash of string-literals with string values that map to the template
 * @example
 * 
 * object: {
 *    'product.PROD_RGN_NAME':'replacement',
 *    SOME_VAR:'replacement'
 * }
 * 
 * @example Usage
 * 
 * generic.template.get({
 *    path:"/some/path/to/template.tmpl",
 *    ...
 * });
 * 
 * @param {HTML} (optional) Markup based inline template
 * @required The path attribute must match the path key passed to the get method.
 * 
 * @example Inline Template Example
 * 
 * <!-- -------------------------- Inline Template ------------------------------ -->
 * 
 * <script type="text/html" class="inline-template" path="templates/foo.tmpl">"
 *         <div>#{FIRST_NAME}</div>
 *         <div>#{SECOND_NAME}</div>
 * </script>
 * 
 * Inline Templates : Valid inline template via script tag in this format, aside
 * from the templateString parameter, will be the first candidate for the template,
 * then the cache, then ajax.
 * 
 * 
 * @returns {object} An object that refers to a singleton which provides
 * the primary get api method.
 * 
 */

generic.endeca.generic.template = ( function() {

    var that = {};
    var templateClassName = ".inline-template";
    var templates = {}; 
    
    // mustache stuff
    var translations;
    var partials;
    // end mustache stuff

    /**
     * This method loads a pre-interpolation template into the object's internal cache. This cache is checked before attempting to pull the template from the DOM or load it via Ajax.
     * @param (String) key The name that is used to retrieve the template from the internal cache. Typically mathces the path for Ajax-loaded templates.
     * @param (String) html The non-interpoltaed content of the template.
     * @returns (Strin) the HTML that was originally passed in
     * @private
     */
    var setInternalTemplate = function(key, html) {
        templates[key] = html;
        return html;
    };

    var getInternalTemplate = function(key) {
        var template = templates[key];
        
        if ( !template && site.templates && site.templates[key] ) {
            templates[key] = site.templates[key].content;
            template = templates[key];
        }
        
        return template;
    };
    
    var returnTemplate = function(args) {
        var html = args.template;
        
        html = interpolate({ template: html, recurseParams: { object: args.object, rb: args.rb }, Lre: /\[jsInclude\]/i, Rre: /\[\/jsInclude\]/i });
        
        if ( typeof args.rb === "object" ) { html = interpolate({ template: html, obj: args.rb, Lre: /\[rb\]/, Rre: /\[\/rb\]/ }); }
        
        //if ( typeof args.object === "object" ) { html = interpolate({ template: html, obj: args.object }); }
        
        if ( typeof args.object === "object" ) {
            try {
                if ( html.match(/\{\{.*\[/) && html.match(/\].*\}\}/)  ) {
                    throw "generic.template: template expects array notation, defaulting to non-mustache rendering";
                }
                
                translations = translations || {
                    globals: {
                        t: site.translations || {}
                    }
                };
                
                var obj = $.extend( {}, args.object, translations );
                
                html = Mustache.to_html( html, obj, templates );
            } catch (e) {
                console.log(e);
                html = interpolate({ template: html, obj: args.object });
            }
        }
        
        return html;
        
    };

    var interpolate = function( args ) {
        var args = args || {};
        // we have to split after {{{ first in case the template has a html render type
        // without it the js will break at eval("obj."{...)
        args.Lre = args.Lre || /\{\{\{|\{\{/;
        args.Rre = args.Rre || /\}\}\}|\}\}/;
        
        var obj = args.obj || args.rb || {};
        var tmpl = args.template || "", 
            recurseParams = args.recurseParams || null,
            Lre = new RegExp(args.Lre), 
            Rre = new RegExp(args.Rre), 
            tmplA = [], 
            temp, lft, rght;

        tmplA = tmpl.replace(/[\r\t\n]/g," ").split(Lre); // array of (.+?)} with '}' marking key vs rest of doc

        var returnString = "";
        for(var x = 0; x < tmplA.length; x++) {
            var chunk = tmplA[x];
            var splitChunk = chunk.split(Rre);

            if (typeof splitChunk[1] !== "undefined") { // close tag is found
                var valueToInsert = "";
                
                if ( recurseParams ) {
                    recurseParams['path'] = splitChunk[0];
                    valueToInsert = that.get(recurseParams);
                } else {
                
                    // First check array notation for property names with spaces
                    // Then check object notation for deep references
                    valueToInsert = eval("obj['" + splitChunk[0] +"']" ) || eval("obj." + splitChunk[0] );
                    if (typeof valueToInsert === "undefined" || valueToInsert === null) {
                        valueToInsert = '';
                    }
                }
                
                chunk = valueToInsert.toString() + splitChunk[1];
            }
            returnString += chunk;
        }
        return returnString;
    };

    that.get = function( args ) {
        var key = args.path;
        var callback = args.callback;
        var forceReload = !!args.forceReload;
        var objectParam = args.object;
        var rbParam = args.rb;
        var template = getInternalTemplate(key);
        
        var html;
      
        if (template && !forceReload) {  // internal template found and OK to use cache
            html = returnTemplate({
                template: template,
                object: objectParam,
                rb: rbParam,
                callback: args.callback
            })
        } else {  // no internal template found or not OK to use cache
            // attempt to retrieve from DOM
            var matchingTemplateNode = null;
            jQuery(templateClassName).each( function() {
                if ( jQuery(this).html() && ( jQuery(this).attr("path")==key) ) { 
                    matchingTemplateNode = this;
                }
            });
            if (matchingTemplateNode) { // inline template found in DOM
                template = setInternalTemplate( key, jQuery(matchingTemplateNode).html() );
                html = returnTemplate({
                    template: template,
                    object: args.object,
                    rb: rbParam,
                    callback: args.callback
                });
            }
        }
        
        if ( typeof args.callback === "function" ) { args.callback(html); }
        else { return html; }

    };
    
    that.loadMustacheMappings = function( args ) {
        var args = args || { mappings: {} };
        
        if ( args.mappings ) {
            for ( var key in args.mappings ) {
                if ( args.mappings.hasOwnProperty(key) && site.templates[ args.mappings[key] ] ) {
                    // These need to be mapped in both direction to handles partials
                    templates[ key ] = site.templates[ args.mappings[key] ].content;
                    templates[ args.mappings[key] ] = site.templates[ args.mappings[key] ].content;
                }
            }
        }
    }

    return that;

})();
