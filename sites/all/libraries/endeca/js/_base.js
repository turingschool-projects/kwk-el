
var generic = generic || {};
var site = site || {};

generic.endeca = generic.endeca || {
    catalog: {},
    result: {},
    results: {},
    resultsgroup: {},
    mixins: {},
    instances: {},
    generic: {
        Class: generic.Class || {},
        env: generic.env || {},
        rb: generic.rb || {},
        template: generic.template || {}
    },
    helpers: {
        array: {
            toInt: function( array ) {
                for ( var i = 0; i < array.length; i++ ) {
                    array[i] = parseInt( array[i] );
                }
                return array;
            },
            unique: function( array ) {
                var o = {}, a = [];
                for ( var i = 0; i < array.length; i++ ) {
                    if ( typeof o[array[i]] == 'undefined' ) { a.push( array[i] ); }
                    o[array[i]] = 1;
                }
                return a;
            },
            remove: function( array, valuesToRemove ) {
                var newArray;
                var valuesToRemove = jQuery.isArray( valuesToRemove ) ? valuesToRemove : [valuesToRemove];
                return jQuery.grep( array, function( value ) {
                    return jQuery.inArray( value, valuesToRemove ) == -1 ;
                });
            }
        }, 
        func: {
            bind: function() { 
                var _func = arguments[0] || null; 
                var _obj = arguments[1] || this; 
                var _args = jQuery.grep(arguments, function(v, i) { 
                    return i > 1; 
                }); 
            
                return function() { 
                    return _func.apply(_obj, _args); 
                }; 
            }
        },
        string: {
            toQueryParams: function( string, separator ) {
            	var string = string || '';
            	var separator = separator || '&';
            	var paramsList = string.substring(string.indexOf('?')+1).split('#')[0].split(separator || '&'), params = {}, i, key, value, pair;
            	for (i=0; i<paramsList.length; i++) {
            		pair = paramsList[i].split('=');
            		key = decodeURIComponent(pair[0]);
            		value = (pair[1])?decodeURIComponent(pair[1]):'';
            		if (params[key]) {
            			if (typeof params[key] == "string") { params[key] = [params[key]]; }
            			params[key].push(value);
            		} else { params[key] = value; }
            	}
            	return params;
            }  
        },
        obj: {
            first: function( obj ) {
                for ( var i in obj ) { return obj[i]; }
            },
            slice: function( obj, array ) {
                var h = {};
                for ( var i = 0; i < array.length; i++ ) {
                    if ( typeof obj[array[i]] != 'undefined' ) {
                        h[array[i]] = obj[array[i]];
                    }
                }
                return h;
            }
        }
    }
};

site.endeca = generic.endeca;
