var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('patterns', function () {
  describe('macro', function () {
    it('matches only strings with a dot as the first character',
      function () {
        assert.ok(jroff.patterns.macro.test(
          '.TH'));
        assert.ok(!jroff.patterns.macro.test(
          ' .TH'));
        assert.ok(!jroff.patterns.macro.test(
          'TH.'));
      });
  });

  describe('noWitheSpace', function () {

    before(function () {
      this.validMatches = '  one two \n three'
        .match(jroff.patterns.noWithespace);

      this.invalidMatches = '   '
        .match(jroff.patterns.noWithespace);
    });

    it('matches any character except withespaces', function () {
      assert.ok(this.validMatches);
      assert.deepEqual(
        this.validMatches, ['one', 'two', '\n', 'three']);
    });

    it('ignores strings with only withespaces', function () {
      assert.equal(this.invalidMatches, null);
    });
  });

  describe('comment', function () {
    it('matches lines starting with \\" or .\\" ', function () {
      assert.ok(
        jroff.patterns.comment.test('.\\" This is a comment'));

      assert.ok(
        jroff.patterns.comment.test('\\" This is a comment'));
    });

    it('matches lines with \\" in any section', function () {
      assert.ok(
        jroff.patterns.comment.test('.TH title \\"comment')
      );
    });
  });

  describe('arguments', function () {
    it('matches single arguments, delimited by withespaces', function () {
      var matches = 'FOO 1 BAR 2'.match(jroff.patterns.arguments);

      assert.equal(matches.length, 4);
      assert.equal(matches[0], 'FOO');
      assert.equal(matches[3], '2');
    });

    it('matches arguments wrapped in double quotes as a single argument', function () {
      var matches = 'FOO "single argument" BAR'.match(jroff.patterns.arguments);

      assert.equal(matches.length, 3);
      assert.equal(matches[0], 'FOO');
      assert.equal(matches[1], '"single argument"');
    });

    it('does not match arguments wrapped in single quotes as a single argument', function () {
      var matches = "FOO 'multiple argument' BAR".match(jroff.patterns.arguments);

      assert.equal(matches.length, 4);
      assert.equal(matches[0], 'FOO');
      assert.equal(matches[1], "'multiple");
      assert.equal(matches[2], "argument'");
    });
  });

  it('does not match arguments wrapped in backsticks as a single argument', function () {
    var matches = 'FOO ‘multiple argument‘ “multiple argument“'.match(jroff.patterns.arguments);

    assert.equal(matches.length, 5);
    assert.equal(matches[1], '‘multiple');
    assert.equal(matches[4], 'argument“');
  });

  it('matches empty arguments delimited by double quotes', function () {
    var matches = 'FOO "" BAR'.match(jroff.patterns.arguments);

    assert.equal(matches.length, 3);
    assert.equal(matches[1], '""');
  });
});
