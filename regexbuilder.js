(function( $ ) {

function extend( dest, src ) {
	for ( var prop in src ) {
		dest[ prop ] = src[ prop ];
	}
	return dest;
}

function map( arr, fn ) {
	var ret = [],
		i = 0,
		length = arr.length;
	for ( ; i < length; i++ ) {
		ret[ i ] = fn( arr[ i ] );
	}
	return ret;
}

var RegexBuilder = window.RegexBuilder = function( language, options ) {
	this.language = language || "JavaScript";
	this.languageDefn = RegexBuilder.languages[ this.language ];
	this.options = options || {};
	this.rules = extend( {}, RegexBuilder.rules );
};

extend( RegexBuilder, {
	languages: {
		JavaScript: {
			encode: function( code ) {
				var hex = code.toString( 16 );
				if ( hex.length % 2 ) {
					hex = "0" + hex;
				}
				if ( hex.length === 2 ) {
					return "\\x" + hex;
				}
				if ( hex.length === 4 ) {
					return "\\u" + hex;
				}
				throw "Cannot encode " + code;
			},
			modifiers: {
				caseless: "i",
				utf8: "",
				utf16: ""
			}
		}
	},

	rules: {},

	defineRules: function( rules ) {
		extend( this.rules, rules );
	}
});

extend( RegexBuilder.prototype, {
	rule: function( rule ) {
		if ( !( rule in this.rules ) ) {
			throw "No rule defined for " + rule;
		}
		if ( typeof this.rules[ rule ] !== "string" ) {
			this.rules[ rule ] = this.rules[ rule ].call( this );
		}
		return this.rules[ rule ];
	},

	encode: function( code ) {
		return this.languageDefn.encode( code );
	},

	encodeRange: function( start, end ) {
		return this.encode( start ) + "-" + this.encode( end );
	},

	modifier: function( modifier ) {
		var modifiers = this.languageDefn.modifiers;
		return typeof modifier === "string" ?
			modifiers[ modifier ] :
			map( modifier, function( modifier ) {
				return modifiers[ modifier ];
			}).join( "" );
	}
});

})();
