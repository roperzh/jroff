var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('Macros', function () {
  describe('doc library', function () {
    before(function () {
      this.context = new jroff.HTMLGenerator();
      this.context.buffer = {};
      this.context.buffer.style = {};
      this.context.buffer.style.indent = '';
    });

    describe('.Dd', function () {
      it('stores the date as a single string in the buffer', function () {
        jroff.macros.doc.Dd.call(this.context, 'April 25, 2001');

        assert.equal(this.context.buffer.date, 'April 25, 2001');
      });
    });

    describe('.Os', function () {
      it('stores the OS value and the release as a single string in the buffer', function () {
        jroff.macros.doc.Os.call(this.context, 'Darwin 8.0.0');

        assert.equal(this.context.buffer.os, 'Darwin 8.0.0');
      });
    });

    describe('.Sh', function () {
      it('stores the section title value as a single string in the buffer', function () {
        jroff.macros.doc.Sh.call(this.context, 'ABOUT');

        assert.equal(this.context.buffer.section, 'ABOUT');
      });
    });

    describe('.Dv', function () {
      it('returns the same text provided in the input', function () {
        var result = jroff.macros.doc.Dv.call(this.context, 'test');

        assert.equal(result, '<span> test </span>');
      });
    });

    describe('.Ev', function () {
      it('returns the same text provided in the input', function () {
        var result = jroff.macros.doc.Ev.call(this.context, 'test');

        assert.equal(result, '<span> test </span>');
      });
    });
  });
});
