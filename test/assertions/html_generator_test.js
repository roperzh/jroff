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

  describe('#closeTagsUntil', function () {
    it('given a limit tag and an array it closes all tags until the limit tag is found', function () {
      var result = this.generator.closeTagsUntil('p', ['div', 'p', 'span']);

      assert.equal(result, '</span></p>');
    });
  });

  describe('#closeAllTags', function () {
    it('given an array returns a string of closing tags', function () {
      var result = this.generator.closeAllTags(['div', 'p', 'span']);

      assert.equal(result, '</span></p></div>');
    });

    it('removes all items in the provided array', function () {
      var arr = ['span', 'p'];

      this.generator.closeAllTags(arr);

      assert.equal(arr.length, 0);
    });
  });

  describe('#cleanQuotes', function () {
    it('removes wrapping double quotes from a given string', function () {
      var result = this.generator.cleanQuotes('"Lorem Ipsum"');

      assert.equal(result, 'Lorem Ipsum');
    });

    it('does not remove unmatching quotes', function () {
      var result = this.generator.cleanQuotes('Lorem "Ipsum');

      assert.equal(result, 'Lorem "Ipsum');
    });

    it('removes quotes only if they are wrapping the whole string', function () {
      var result = this.generator.cleanQuotes('"Lorem" "Ipsum"');

      assert.equal(result, '"Lorem" "Ipsum"');
    });
  });
});
