var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('Macros', function () {
  describe('an library', function () {
    before(function () {
      this.context = new jroff.HTMLGenerator();
      this.context.buffer = {};
      this.context.buffer.style = {};
      this.context.buffer.style.indent = '';
    });

    describe('.TH', function () {
      it('stores in the buffer useful information', function () {
        var text = 'FOO 1 "MARCH 1995" Linux "User Manuals"',
          html = jroff.macros.an.TH.call(this.context, text);

        assert.equal(this.context.buffer.title, 'FOO');
        assert.equal(this.context.buffer.section, '1');
        assert.equal(this.context.buffer.date, 'MARCH 1995');
        assert.equal(this.context.buffer.source, 'Linux');
        assert.equal(this.context.buffer.manual, 'User Manuals');
      });
    });
  });
});
