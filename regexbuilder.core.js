// RFC 2234 - ABNF for Syntax Specifications
(function( RegexBuilder ) {

// 6.1  Core Rules
RegexBuilder.defineRules({
	// A-Z / a-z
	ALPHA: "[A-Za-z]",

	BIT: "[01]",

	// any 7-bit US-ASCII character, excluding NUL
	CHAR: function() {
		return this.encodeRange( 0x01, 0x7F );
	},

	// carriage return
	CR: function() {
		return this.encode( 0x0D );
	},

	// Internet standard newline
	CRLF: function() {
		return this.rule( "CR" ) + this.rule( "LF" );
	},

	// controls
	CTL: function() {
		return "[" +
			this.encodeRange( 0x00, 0x1F ) +
			this.encode( 0x7F ) +
		"]";
	},

	// 0-9
	DIGIT: "[0-9]",

	// " (Double Quote)
	DQUOTE: function() {
		return this.encode( 0x22 );
	},

	HEXDIG: "[0-9ABCDEF]",

	// horizontal tab
	HTAB: function() {
		return this.encode( 0x09 );
	},

	// linefeed
	LF: function() {
		return this.encode( 0x0A );
	},

	// linear white space (past newline)
	LWSP: function() {
		return "(" +
			this.rule( "WSP" ) +
			"|(" + 
				this.rule( "CRLF" ) +
				this.rule( "WSP" ) +
			")" +
		")*";
	},

	// 8 bits of data
	OCTET: function() {
		return this.encodeRange( 0x00, 0xFF );
	},

	// space
	SP: function() {
		return this.encode( 0x20 );
	},

	// visible (printing) characters
	VCHAR: function() {
		return this.encodeRange( 0x21, 0x7E );
	},

	// white space
	WSP: function() {
		return "[" +
			this.rule( "SP" ) +
			this.rule( "HTAB" ) +
		"]";
	}
});

})( RegexBuilder );
