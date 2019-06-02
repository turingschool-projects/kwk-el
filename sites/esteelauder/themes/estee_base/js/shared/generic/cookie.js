
var generic = generic || {};

generic.cookie = function(/*String*/name, /*String?*/value, /*.__cookieProps*/props){
	var c = document.cookie;
	if (arguments.length == 1) {
		var matches = c.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
		if (matches) {
			matches = decodeURIComponent(matches[1]);
			try {
			     return jQuery.parseJSON(matches); //Object
			} catch(e) {
			     return matches; //String
			}

		} else {
			return undefined;
		}
	} else {
		props = props || {};
// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
		var exp = props.expires;
		if (typeof exp == "number"){
			var d = new Date();
			d.setTime(d.getTime() + exp*24*60*60*1000);
			exp = props.expires = d;
		}
		if(exp && exp.toUTCString){ props.expires = exp.toUTCString(); }

		value = encodeURIComponent(value);
		var updatedCookie = name + "=" + value;

		for(propName in props){
			updatedCookie += "; " + propName;
			var propValue = props[propName];
			if(propValue !== true){ updatedCookie += "=" + propValue; }
		}
		//console.log(updatedCookie);
		document.cookie = updatedCookie;
	}
};