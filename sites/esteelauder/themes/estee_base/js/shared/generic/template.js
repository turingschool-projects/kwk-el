
var generic = generic || {};

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
 *    $('#container').html(html);
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


generic.template  = ( function() {

    var that = {};
    var templateClassName = ".inline-template";
    var templates = {};

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
        return templates[key];
    };

    var returnTemplate = function(args) {
        if (typeof args.object === "object") {
            var html = interpolate(args.template, args.object);
        }else{
			var html = args.template;
		}
        if (typeof args.callback === "function") {
            args.callback(html);
        }
    };

    var interpolate = function(template, obj) {
        var obj = obj || {};
        var tmpl = template, Lre = new RegExp("\#\{"), Rre = new RegExp("\}"), tmplA = [], temp, lft, rght;

        tmplA = tmpl.replace(/[\r\t\n]/g," ").split(Lre); // array of (.+?)} with '}' marking key vs rest of doc

        var returnString = "";
        for(var x = 0; x < tmplA.length; x++) {
            var chunk = tmplA[x];
            var splitChunk = chunk.split(Rre);

			// FIXME TODO: Embarrassingly ham handed approach to setting url_domain template variable for IE (bug i73662)
			//  Needs someone more familiar with javascript to find out why this error only occurs in IE
			//	 with the url_domain object value set anywhere but here (setting it elsewhere works fine in FF)
			if (splitChunk[0] == 'url_domain') {
				splitChunk[1] = 'http://' + document.location.hostname;
			}
            if (typeof splitChunk[1] !== "undefined") { // close tag is found
                // First check array notation for property names with spaces
                // Then check object notation for deep references
                var valueToInsert = eval("obj['" + splitChunk[0] +"']" ) || eval("obj." + splitChunk[0] );
                if (typeof valueToInsert === "undefined" || valueToInsert === null) {
                    valueToInsert = '';
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
        var template = getInternalTemplate(key);

        if (template && !forceReload) {  // internal template found and OK to use cache
            returnTemplate({
                template: template,
                object: objectParam,
                callback: args.callback
            })
        } else {  // no internal template found or not OK to use cache
            // attempt to retrieve from DOM
            var matchingTemplateNode = null;
            $(templateClassName).each( function() {
                if ( $(this).html() && ( $(this).attr("path")==key) ) {
                    matchingTemplateNode = this;
                }
            });
            if (matchingTemplateNode) { // inline template found in DOM
                template = setInternalTemplate( key, $(matchingTemplateNode).html() );
                returnTemplate({
                    template: template,
                    object: args.object,
                    callback: args.callback
                })
            } else { // not found inline


                $.ajax({
                    url: key,
                    context: this, // bind (.bind onSuccess callback)
                    data: args.urlparams,
                    success: function(data, textStatus, jqXHR){
                        template = setInternalTemplate( key, jqXHR.responseText);
                        returnTemplate({
                            template: template,
                            object: args.object,
                            callback: args.callback
                        })
                    }
                });
            }
        }

    };

    return that;

})();
//
// generic.TemplateSingleton = (function(){
//
//     /**
//      * @private singleton reference
//      */
//     var singleton;
//
//     /**
//      * @inner Template constructor
//      * @constructs Template object
//      */
//     var Template = function ( template, pattern ) {
//         this.template = template?template:'';
//         this.readyState = template?1:0;
//         this.pattern = pattern?pattern:new RegExp("\#\{(.+?)\}");
//         this.queue = new Array();
//
//         /**
//          * @private
//          */
//         var A = {
//             evaluate : function(replacements){
//                 var tmpl = this.template, Lre = new RegExp("\#\{"), Rre = new RegExp("\}"), tmplA = [], temp, lft, rght;
//
//             // reference : ob.replace(/[\r\t\n]/g," ").split("<").join("Y").split(">").join("X");
//             tmplA = tmpl.replace(/[\r\t\n]/g," ").split(Lre); // array of (.+?)} with '}' marking key vs rest of doc
//
//             for(var x = 0; x < tmplA.length; x++) {
//
//                 // Array.split returns differently for IE, test for undefined
//                 lft = (replacements[tmplA[x].split(Rre)[0]]===undefined)?'':replacements[tmplA[x].split(Rre)[0]]
//                 rght = (tmplA[x].split(Rre)[1]===undefined)?'':tmplA[x].split(Rre)[1];
//
//                 tmplA[x] = lft + rght;
//
//                 }
//                 tmpl = tmplA.join('');
//
//                 return tmpl;
//
//             },
//             Pattern : new RegExp("\#\{(.+?)\}")
//         }
//
//         $.extend(this,A,{
//             //test: function(){alert('test at prototype level');}, // prototype set as object, not a constructor
//             load: function(template) {
//                 this.template = template.toString();
//                 this.readyState = 1;
//                 this.onReadyState();
//             },
//             evaluateCallback: function (options) {
//                 this.options = {
//                     object: {},
//                     callback: function () {}
//                 };
//                 this.options = $.extend(this.options, options || { });
//
//                       /**
//                        * @private This is tied to templateString. If passed,
//                        * then onReadyState queue bypassed, and control goes straight
//                        * to the callbackEvaluation via readState true
//                        */
//                     if (this.readyState) {
//                         this.options.callback(this.evaluate(this.options.object));
//
//                     } else {
//                         this.queue.push({
//                             qtype: 'callback',
//                             obj: this.options.object,
//                             fnc: this.options.callback
//                         });
//                     }
//                 return;
//             },
//             // Asynchronous to .evaluateCallback
//             onReadyState: function () {
//                 while (q = this.queue.shift()) {
//                     var object = q.obj;
//                     var qtype = q.qtype;
//                     var callback = q.fnc;
//
//                     callback(this.evaluate(object));
//                 }
//             }
//         });
//     }
//
//     /**
//      * @description Single object with main method that controls for
//      * the switch among templateString, inline, cache, ajax is delegated.
//      *
//      * @inner Constructor
//      * @constructs an object with main method namespace
//      * @class GetFunctionObject
//      */
//     var GetFunctionObject = (new function() {
//
//         /**
//          * @private
//          */
//         var defaults = { useInline:true, templateCssClass : ".inline-template" }, _object  = []; // internal prop
//
//         this.debug = function() { var msg = 'private var defaults : '+defaults.useInline; alert(msg); }
//
//         /**
//          * @private
//          * @function primary function (method) as value bound to public get api method
//          */
//         this.main = function (params) {
//
//             /**
//              * @private
//              */
//             var key = params.path, query = params.query,
//                 forceReload = params.forceReload || false,
//                 templateString = params.templateString || false,
//                 useInline, templateClassName;
//
//             // if no templateString-override, then setup for inline script tag template
//             if(!templateString) {
//                 useInline = (params.useInline)?params.useInline:defaults.useInline;
//                 templateClassName = (params.templateClassName)?params.templateClassName:defaults.templateCssClass;
//             }
//             /* these controls currently closed
//             if(params.useInline && params.templateClassName) {
//                 defaults.useInline = params.useInline;
//                 defaults.templateClassName = params.templateClassName;
//             }
//             */
//
//             // Case 1: Brand New : forceReload, new query, and no template yet
//             if (typeof _object[key] != "undefined" && !forceReload && !query) {
//                 return _object[key];
//             }
//             _object[key] = new Template();
//             //this._object[key].test(); // hits new inner Class of Template
//
//             // Case 2: Template string directly passed
//             if (templateString) {
//                 _object[key].load(templateString);
//                 return _object[key].evaluateCallback(params);
//             }
//             var url = key;
//             if (query) {
//                 var q = $H(query);
//                 var queryString = q.toQueryString();
//                 url += "?" + queryString;
//             }
//             // Attempt to Use Inline
//             if(useInline) {
//                 $(templateClassName).each(function(){
//                     if($(this).html()&&($(this).attr("path")==key)) {
//                      alert($(this).html());
//                         _object[key].load( $(this).html() );
//                     }
//                 });
//             }else{
//              // load asynchronously and move onto evaluateCallback
//              $.ajax({
//                  url: url,
//                  context: this, // bind (.bind onSuccess callback)
//                  data: params.urlparams,
//                  success: function(data, textStatus, jqXHR){
//                      _object[key].load(jqXHR.responseText);
//                  }
//              });
//          }
//              _object[key].evaluateCallback(params);
//
//         return this;
//         }
//     }());
//
//     var PublicInterfaceMapper = { get : GetFunctionObject.main, sample : GetFunctionObject.debug };
//     var API = $.extend(PublicInterfaceMapper,GetFunctionObject);
//
//     return function () {
//
//         // Return Same Obj
//         if(singleton) { return singleton; }
//
//             // Extra api
//             singleton = $.extend(this,API);
//             singleton.api = API.sample;
//
//         //alert('return singleton; //* should only see this once *// ');
//         };
//     }());
//
// generic.template = new generic.TemplateSingleton();
