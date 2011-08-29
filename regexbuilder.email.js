// RFC 5322 - Internet Message Format
(function( RegexBuilder ) {

// 3.2.1.  Quoted characters
RegexBuilder.defineRules({
	quotedPair: function() {
		return "(" +
			"(" +
				"\\\\" +
				"(" +
					this.rule( "VCHAR" ) + "|" +
					this.rule( "WSP" ) +
				")" +
			")" + "|" +
			this.rule( "obsQp" ) +
		")";
	}
});

// 3.2.2.  Folding White Space and Comments
RegexBuilder.defineRules({
	// Folding white space
	FWS: function() {
		return "(" +
			"(" +
				"(" +
					this.rule( "WSP" ) + "*" +
					this.rule( "CRLF" ) +
				")" +
				this.rule( "WSP" ) + "+" +
			")" + "|" +
			this.rule( "obsFWS" ) +
		")";
	},

	// Printable US-ASCII characters not including "(", ")", or "\"
	ctext: function() {
		return "(" +
			"[" +
				this.encodeRange( 33, 39 ) +
				this.encodeRange( 42, 91 ) +
				this.encodeRange( 93, 126 ) +
			"]|" +
			this.rule( "obsCtext" ) +
		")";
	},

	ccontent: function() {
		return "(" +
			this.rule( "ctext" ) + "|" +
			this.rule( "quotedPair" ) +
			// TODO: comments are allowed to nest
//			this.rule( "comment" ) +
		")";
	},

	comment: function() {
		return "\\(" +
			"(" +
				this.rule( "FWS" ) + "?" +
				this.rule( "ccontent" ) +
			")*" +
			this.rule( "FWS" ) + "?" +
		"\\)";
	},

	CFWS: function() {
		return "(" +
			"(" +
				"(" +
					this.rule( "FWS" ) + "?" +
					this.rule( "comment" ) +
				")+" +
				this.rule( "FWS" ) + "?" +
			")" +
			this.rule( "FWS" ) +
		")";
	}
});

// 3.2.3.  Atom
RegexBuilder.defineRules({
	// Printable US-ASCII characters not including specials.  Used for atoms.
	atext: function() {
		return "(" +
			this.rule( "ALPHA" ) + "|" +
			this.rule( "DIGIT" ) + "|" +
			"[!#$%&'*+\\-\\/=?^_`{|}~]" +
		")";
	},

	atom: function() {
		return this.rule( "CFWS" ) + "?" +
			this.rule( "atext" ) + "+" +
			this.rule( "CFWS" ) + "?";
	},

	dotAtomText: function() {
		return this.rule( "atext" ) + "+" +
			"(" +
				"\\." +
				this.rule( "atext" ) + "+" +
			")*";
	},

	dotAtom: function() {
		var comment,
			rule = this.rule( "dotAtomText" );

		if ( this.options.comments ) {
			comment = this.rule( "CFWS" ) + "?";
			rule = comment + rule + comment;
		}

		return rule;
	},

	// Special characters that do not appear in atext
	specials: function() {
		return "[()<>[\\]:;@\\,." + this.rule( "DQUOTE" ) + "]";
	}
});

// 3.2.4.  Quoted Strings
RegexBuilder.defineRules({
	// Printable US-ASCII characters not including "\" or the quote character
	qtext: function() {
		return "(" +
			"[" +
				this.encode( 33 ) +
				this.encodeRange( 35, 91 ) +
				this.encodeRange( 93, 126 ) +
			"]|" +
			this.rule( "obsQtext" ) +
		")";
	},

	qcontent: function() {
		return "(" +
			this.rule( "qtext" ) + "|" +
			this.rule( "quotedPair" ) +
		")";
	},

	quotedString: function() {
		return this.rule( "CFWS" ) + "?" +
			this.rule( "DQUOTE" ) +
			"(" +
				this.rule( "FWS" ) + "?" +
				this.rule( "qcontent" ) +
			")*" +
			this.rule( "FWS" ) + "?" +
			this.rule( "DQUOTE" ) +
			this.rule( "CFWS" ) + "?";
	}
});

// 3.2.5.  Miscellaneous Tokens
RegexBuilder.defineRules({
	word: function() {
		return "(" +
			this.rule( "atom" ) + "|" +
			this.rule( "quotedString" ) +
		")";
	}

	// ...
});

// 3.4.1.  Addr-Spec Specification
//      Note: A liberal syntax for the domain portion of addr-spec is
//      given here.  However, the domain portion contains addressing
//      information specified by and used in other protocols (e.g.,
//      [RFC1034], [RFC1035], [RFC1123], [RFC5321]).  It is therefore
//      incumbent upon implementations to conform to the syntax of
//      addresses for the context in which they are used.
RegexBuilder.defineRules({
	addrSpec: function() {
		return this.rule( "localPart" ) + "@" + this.rule( "domain" );
	},

	localPart: function() {
		var alternatives = [
			this.rule( "dotAtom" )
		];
		if ( this.options.localQuoted ) {
			alternatives.push( this.rule( "quotedString" ) );
		}
		if ( this.options.obsolete ) {
			alternatives.push( this.rule( "obsLocalPart" ) );
		}
		return "(" + alternatives.join( "|" ) + ")";
	},

	domain: function() {
		// TODO: add options/definitions for reasonable protocols
		var alternatives = [
			this.rule( "dotAtom" )
		];
		if ( this.options.domainLiteral ) {
			alternatives.push( this.rule( "domainLiteral" ) );
		}
		if ( this.options.obsolete ) {
			alternatives.push( this.rule( "obsDomain" ) );
		}
		return "(" + alternatives.join( "|" ) + ")";
	},

	domainLiteral: function() {
		return this.rule( "CFWS" ) + "?" +
			"\\[" +
				"(" +
					this.rule( "FWS" ) + "?" +
					this.rule( "dtext" ) +
				")*" +
				this.rule( "FWS" ) + "?" +
			"\\]" +
			this.rule( "CFWS" );
	},

	// Printable US-ASCII characters not including "[", "]", or "\"
	dtext: function() {
		return "(" +
			"[" +
				this.encodeRange( 33, 90 ) +
				this.encodeRange( 94, 126 ) +
			"]|" +
			this.rule( "obsDtext" ) +
		")";
	}
});

// 4.1.  Miscellaneous Obsolete Tokens
RegexBuilder.defineRules({
	// US-ASCII control characters that do not include the carriage return,
	// line feed, and white space characters
	obsNOWSCTL: function() {
		return "[" +
			this.encodeRange( 1, 8 ) +
			this.encode( 11 ) +
			this.encode( 12 ) +
			this.encodeRange( 14, 31 ) +
			this.encode( 127 ) +
		"]";
	},

	obsCtext: function() {
		return this.rule( "obsNOWSCTL" );
	},

	obsQtext: function() {
		return this.rule( "obsNOWSCTL" );
	},

	// ...

	obsQp: function() {
		return "\\\\" +
			"(" +
				this.encode( 0 ) + "|" +
				this.rule( "obsNOWSCTL" ) + "|" +
				this.rule( "LF" ) + "|" +
				this.rule( "CR" ) +
			")";
	}

	// ...
});

// 4.2.  Obsolete Folding White Space
RegexBuilder.defineRules({
	obsFWS: function() {
		return this.rule( "WSP" ) + "+" +
			"(" +
				this.rule( "CRLF" ) +
				this.rule( "WSP" ) + "+" +
			")*";
	}
});

// 4.4.  Obsolete Addressing
RegexBuilder.defineRules({
	// ...

	obsLocalPart: function() {
		return this.rule( "word" ) +
			"(" +
				"\\." +
				this.rule( "word" ) +
			")*";
	},

	obsDomain: function() {
		return this.rule( "atom" ) +
			"(" +
				"\\." +
				this.rule( "atom" ) +
			")*";
	},

	obsDtext: function() {
		return "(" +
			this.rule( "obsNOWSCTL" ) + "|" +
			this.rule( "quotedPair" ) +
		")";
	}
});

})( RegexBuilder );
