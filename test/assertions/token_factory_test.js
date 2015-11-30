var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('TokenFactory', function () {
  before(function () {
    this.factory = new jroff.TokenFactory();
  });

  describe('#create', function () {
    it('returns an instance of the Token class', function () {
      var token = this.factory.create('');

      assert.ok(token instanceof jroff.Token);
    });

    it('creates an EMPTY token if no argument is provided', function () {
      var token = this.factory.create();

      assert.equal(token.kind, jroff.EMPTY);
      assert.equal(token.value, '');
    });

    it('creates a COMMENT token based on a raw string', function () {
      var rawComment = '.\\"This is a comment',
        token = this.factory.create(rawComment);

      assert.equal(token.kind, jroff.COMMENT);
      assert.equal(token.value, rawComment);
    });

    it('creates a MACRO token based on a raw string', function () {
      var rawMacro = '.SH',
        token = this.factory.create(rawMacro);

      assert.equal(token.kind, jroff.MACRO);
      assert.equal(token.value, 'SH');
    });

    it('creates a IMACRO token based on a raw string', function () {
      var rawInnerMacro = 'Fl',
        token = this.factory.create(rawInnerMacro);

      assert.equal(token.kind, jroff.IMACRO);
      assert.equal(token.value, rawInnerMacro);
    });

    it('creates a BREAK token based on newlines', function () {
      var rawBreak = '\n',
        token = this.factory.create(rawBreak);

      assert.equal(token.kind, jroff.BREAK);
      assert.equal(token.value, rawBreak);
    });

    it('creates a TEXT token with tex that does not match any pattern', function () {
      var rawText = 'asdf',
        token = this.factory.create(rawText);

      assert.equal(token.kind, jroff.TEXT);
      assert.equal(token.value, rawText);
    });
  });
});
