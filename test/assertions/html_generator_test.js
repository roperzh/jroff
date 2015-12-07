var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('HTMLGenerator', function () {
  before(function () {
    this.generator = new jroff.HTMLGenerator();
  });

  describe('#closeTag', function () {
    it('closes the provided tag name', function () {
      var result = this.generator.closeTag('p');

      assert.equal(result, '</p>');
    });
  });

  describe('#closeAllTags', function () {
    it('given an array returns a string of closing tags', function () {
      var result = this.generator.closeAllTags(['span', 'p', 'div']);

      assert.equal(result, '</span></p></div>');
    });

    it('removes all items in the provided array', function () {
      var arr = ['span', 'p'];

      this.generator.closeAllTags(arr);

      assert.equal(arr.length, 0);
    });
  });
});
