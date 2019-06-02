
var generic = generic || {};

/**
 * @description Wrap Function - Return a new function that triggers a parameter function first and
 * then moves on to the original, wrapped function.  The follow up of the original can be
 * precluded by returning false from the parameter of type function.
 *
 **/

$.extend(Function.prototype, {

    /**
     * @param {function} step-ahead function to the original function being wrapped
     * @return {function} new function to be assigned to original namespace
     */
    wrap: function(fn) {

        var _generic_ = fn; // generic-level
        var _site_ = this; // site-level

        //this.passObj = true;
        var passObj = true;

        return function() {

            passObj = _generic_.apply(fn, arguments);
            if(passObj) _site_.call(this, passObj); else return;

        }

    }
});


/**
 * @description Minimal Native Version of Prototype Hash Class
 *
 * @class Hash
 * @namespace generic.Hash
 *
 * @returns A public api object (get, set, etc).
 *
 */

generic.Hash = function(obj) {

        var H = (obj instanceof Object)?obj:{}, index = [], _queue = [];

        var queryString = function() {

            /** @inner **/
            var Q = function (o,v,isArr) {

                var i, S = Object.prototype.toString, A = "[object Array]", _queue = [];

                o = o || H;

                for(i in o) {
                    if(typeof o[i] === "object") {
                        _queue = (S.call(o[i])===A)?Q(o[i],i,true):Q(o[i],i);
                    } else { n=(isArr)?v:i; _queue.push(n+'='+o[i]); }
                }

                return _queue;

            }

            //return "?"+Q().join("&");
            return Q().join("&");
        }

        return {

            /**
             * @public get
             */
            get : function (x) { return H[x] || false; },
            /**
             * @public set
             */
            set : function (x,y) { H[x] = y; index.push(x); return this; },
            /**
             * @public toQueryString
             ** DEPRECATED **
             */
            toQueryString : queryString,
            /**
             * @public fromQueryString
             */
            queryToJson : function(q,p/*pure object, not hash*/) {

                var query = q;
                var k, v, i;
                var obj = {};

                var xArr = query.split('&');

                for(i = 0; i < xArr.length; i++) {

                    k = xArr[i].split('=')[0]; v = xArr[i].split('=')[1];
                    evalStr = "obj['"+k+"']='"+v+"'";
                    eval(evalStr);

                }

                return obj;
            },


            /**
             * @public slice
             *
             * @param {array}
             * @returns hash containing only the key/value pairs matched by the keys
             *          passed in the array
             *
             */
            slice: function( array ) {
                var h = $H();
                for ( var i in array ) {
                    h.set( array[i], H[array[i]] );
                }
                return h;
            },

            obj: function() {
                return H;
            }
        }
        ; // end api set

    };

generic.HashFactory = function(hash) {

	var H = new generic.Hash(hash);
	return H;

}

/**
 * @see generic.Hash
 */
$H = generic.HashFactory; // map convenience alias






/**
 * Minimal Native Version of Prototype Class
 *
 * @deprecated Jquery extend method has options for deep copy extensions
 *
 * @class Class
 * @namespace generic.Class
 *
 */

generic.Class = { // Uppercase 'Class', avoid IE errors

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

        var len = arguments.length, args = Array.prototype.slice.call(arguments), fn = generic.Class.fn;

            if(len==2) {  tgt = generic.Class.fn(args[0],args[1]); }
            else if(len==1) {  tgt = generic.Class.fn(null,args[0]); }
            else { tgt = function(){}; /* return empty constructor */ }

        return tgt; // return constructor that stacks named Class w/ object-literal, works with instanceof

    }, // End Create Method
    mixin: function( baseClass, mixin ) {
        var newClass = baseClass;
        if ( mixin && mixin.length ) {
            for ( var i=0; i < mixin.length; i++ ) {
                newClass = generic.Class.mixin( newClass, mixin[i] );
            }
        } else {
            if ( mixin ) { newClass = generic.Class.create( newClass, mixin ); }
        }
        return newClass;
    }
};

/**
 * @memberOf generic
 *
 */

generic.isElement = function(o) {
    return o.nodeType && (o.nodeType == 1) ;
};

/**
 * @memberOf generic
 *
 */
generic.isString = function(s) {
    return typeof(s) == "string" ;
};

/**
 * @memberOf generic
 *
 */
generic.env = {
    isIE : !!(typeof(ActiveXObject) == 'function'),
    isIE6 : !!(!!(typeof(ActiveXObject) == 'function') && (/MSIE\s6\.0/.test(navigator.appVersion))),
    isIE11 : !!(/Trident.*rv[ :]*11\./.test(navigator.userAgent)),
    isIE8 : !!(!!(typeof(ActiveXObject) == 'function') && (/MSIE\s8\.0/.test(navigator.appVersion))),
    isIE9 : !!(!!(typeof(ActiveXObject) == 'function') && (/MSIE\s9\.0/.test(navigator.appVersion))),
    isFF : !!(typeof(navigator.product) != 'undefined' && navigator.product == 'Gecko' && !( (document.childNodes) && (!navigator.taintEnabled)) && /firefox/.test(navigator.userAgent.toLowerCase()) ),
    isFF2 : !!(typeof(navigator.product) != 'undefined' && navigator.product == 'Gecko' && !((document.childNodes) && (!navigator.taintEnabled)) && navigator.userAgent.toLowerCase().split(' firefox/').length > 1 && navigator.userAgent.toLowerCase().split(' firefox/')[1].split('.')[0] == '2'),
    isFF3 : !!(typeof(navigator.product) != 'undefined' && navigator.product == 'Gecko' && !((document.childNodes) && (!navigator.taintEnabled)) && navigator.userAgent.toLowerCase().split(' firefox/').length > 1 && navigator.userAgent.toLowerCase().split(' firefox/')[1].split('.')[0] == '3'),
    isMac    : !!(/macppc|macintel/.test(navigator.platform.toLowerCase())),
    isSafari : !!(/Safari/.test(navigator.userAgent)),
    isIOS4 : !!(navigator.userAgent.match(/OS 4(_\d)+ like Mac OS X/i)),
    isiOS11  : !!(/(iPhone|iPod|iPad)/i.test(navigator.userAgent) && /OS [11](.*) like Mac OS X/i.test(navigator.userAgent)),

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
    			value = splitStr[i].split('=')[1];

                var c = splitStr[i].match(new RegExp(key));
                var cItem = a.n[c] = a.n[c] || { "v" : [], "key" : c };
                cItem.e = cItem.e ? cItem.e + 1 : 0;   
                cItem.v.push(value);
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
    			if(tempObj.length>1) { eval('params["'+namespace+'"]=tempObj'); }
    			else { tempStr = tempObj[0]; eval('params["'+namespace+'"]=tempStr'); }
    		}

    		return params;
    	}

    	var parameters = main() || {};
    	return parameters;

    },
    query: function(key) {
        var result = generic.env.parsedQuery()[key] || null;
        return result;
    }
};
