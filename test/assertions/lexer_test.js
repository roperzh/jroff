var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('Lexer', function () {
  beforeEach(function () {
    var source = '.TH TITLE\n.SH  TEST';

    this.lexer = new jroff.Lexer(source);
  });

  describe('instance', function () {
    it('splits the source by withespaces and newlines', function () {
      assert.deepEqual(this.lexer.source, ['.TH', ' ', 'TITLE', '\n', '.SH', '  ', 'TEST']);
    });

    it('creates instance variables to track the current line and column', function () {
      assert.equal(this.lexer.col, 0);
      assert.equal(this.lexer.line, 1);
    });
  });

  describe('#cleanSource', function () {
    it('adds whitespace between escape characters', function () {
      var clean = this.lexer.cleanSource('[\\-\\-version]');

      assert.equal(clean, '[ \\-  \\- version]');
    });

    it('replaces < and > characters with their HTML escape equivalents', function () {
      var clean = this.lexer.cleanSource('<test>');

      assert.equal(clean, '&lt;test&gt;');
    });
  });

  describe('#lex', function () {
    it('returns an array of token instances', function () {
      var allTokens = this.lexer.lex()
        .every(function (token) {
          return token instanceof jroff.Token;
        });

      assert.ok(allTokens);
    });

    it('returns an array of tokens with the correct values', function () {
      var tokens = this.lexer.lex();

      assert.equal(tokens[0].kind, jroff.MACRO);
      assert.equal(tokens[0].value, 'TH');

      assert.equal(tokens[1].kind, jroff.TEXT);
      assert.equal(tokens[1].value, ' ');

      assert.equal(tokens[2].kind, jroff.TEXT);
      assert.equal(tokens[2].value, 'TITLE');
    });
  });

  describe('#next', function () {
    it('properly returns the next item in the `source` array', function () {
      var first = this.lexer.next(),
        second = this.lexer.next();

      assert.equal(first, '.TH');
      assert.equal(second, ' ');
    });

    it('increases the value of sourceIdx on each call', function () {
      this.lexer.next();
      this.lexer.next();

      assert.equal(this.lexer.sourceIdx, 2);
    });

    it('keeps updated the `col` and `line` instance variables', function () {
      this.lexer.next();
      assert.equal(this.lexer.col, 3);
      assert.equal(this.lexer.line, 1);

      this.lexer.next();
      this.lexer.next();
      assert.equal(this.lexer.col, 9);
      assert.equal(this.lexer.line, 1);

      this.lexer.next();
      assert.equal(this.lexer.col, 0);
      assert.equal(this.lexer.line, 2);
    });

  });
});
