var assert = require('assert'),
  jroff = require('../../dist/jroff');

describe('Token', function () {
  beforeEach(function () {
    this.token1 = new jroff.Token('token 1', jroff.TEXT);
    this.token2 = new jroff.Token('token 2', jroff.TEXT);
  });

  it('assigns the value property on instantiation', function () {
    assert.equal(this.token1.value, 'token 1');
    assert.equal(this.token2.value, 'token 2');
  });

  it('assigns the kind property on instantiation', function () {
    assert.equal(this.token1.kind, jroff.TEXT);
    assert.equal(this.token2.kind, jroff.TEXT);
  });

  it('assigns an empty array as the nodes property on instantiation', function () {
    assert.deepEqual(this.token1.nodes, []);
    assert.deepEqual(this.token2.nodes, []);
  });

  it('initializes the value property to an empty string if not provided', function () {
    var tok = new jroff.Token();

    assert.equal(tok.value, '');
  });

  it('initializes a token of type EMPTY if no kind provided', function () {
    var tok = new jroff.Token();

    assert.equal(tok.kind, jroff.EMPTY);
  });

  describe('instance methods', function () {
    describe('#mix', function () {
      it('assigns the kind of the new token if the original is EMPTY', function () {
        var tok = new jroff.Token();
        tok.mix(this.token1);

        assert.equal(tok.kind, this.token1.kind);
      });

      it('concatenates the .value attribute of each token', function () {
        var mixedToken = this.token1.mix(this.token2);

        assert.equal(mixedToken.value, 'token 1token 2');
        assert.equal(this.token1.value, mixedToken.value);
        assert.equal(this.token2.value, 'token 2');
      });

      it('returns the token being mixed', function () {
        var mixedToken = this.token1.mix(this.token2);

        assert.deepEqual(this.token1, mixedToken);
      });
    });

    describe('#addNode', function () {
      it('adds a node into the .nodes value of a Token instance', function () {
        this.token1.addNode(this.token2);

        assert.equal(this.token1.nodes.length, 1);
        assert.deepEqual(this.token1.nodes[0], this.token2);
      });
    });

    describe('#lastNode', function () {
      it('returns the last node in the .nodes attribute of a Token instance', function () {
        this.token1.addNode(this.token2);

        assert.equal(this.token1.lastNode(), this.token2);
      });

      it('safely returns a node of type EMPTY if the node list is empty', function () {
        assert.deepEqual(this.token1.lastNode(), new jroff.Token());
        assert.doesNotThrow(function () {
          this.token1.lastNode();
        }.bind(this));
      });
    });

    describe('#mixWithLastNode', function () {
      it('mixes a token with the last node of another token', function () {
        var token3 = new jroff.Token('token 3', jroff.TEXT);

        this.token1.addNode(token3);
        this.token1.mixWithLastNode(this.token2);

        assert.equal(this.token1.lastNode()
          .value, 'token 3token 2');
        assert.equal(this.token1.lastNode()
          .kind, jroff.TEXT);
      });
    });

    describe('#addSubNode', function () {
      it('pushes a token into the nodes collection of the last node of a given token', function () {
        var token3 = new jroff.Token('token 3', jroff.TEXT);

        this.token1.addNode(token3);
        this.token1.addSubNode(this.token2);

        assert.equal(this.token1.nodes.length, 1);
        assert.equal(this.token1.lastNode()
          .nodes.length, 1);
        assert.equal(this.token1.lastNode()
          .lastNode(), this.token2);
      });
    });

    describe('#lastNodeIsNotSpace', function () {
      it('returns false when the last node of the token is a whitespace', function () {
        var token3 = new jroff.Token('  ', jroff.TEXT);

        this.token1.addNode(token3);

        assert.ok(!this.token1.lastNodeIsNotSpace());
      });

      it('returns true when the last node of the token is not a whitespace', function () {
        var token3 = new jroff.Token('asf', jroff.TEXT);

        this.token1.addNode(token3);

        assert.ok(this.token1.lastNodeIsNotSpace());
      });
    });

  });

  describe('class methods', function () {
    describe('#isMacro', function () {
      it('returns true only if the given string represents a macro pattern', function () {
        assert.ok(jroff.Token.isMacro('.SH'));
        assert.ok(!jroff.Token.isMacro('asdf'));
      });
    });

    describe('#isInlineMacro', function () {
      it('returns true only if the given string represents an inline macro pattern', function () {
        assert.ok(jroff.Token.isInlineMacro('Fl'));
        assert.ok(!jroff.Token.isInlineMacro('asdf'));
      });
    });

    describe('#isComment', function () {
      it('returns true only if the given string represents a comment pattern', function () {
        assert.ok(jroff.Token.isComment('\\" Comment'));
        assert.ok(!jroff.Token.isComment('asdf'));
      });
    });

    describe('#isEmptyLine', function () {
      it('returns true only if the given string represents a newline', function () {
        assert.ok(jroff.Token.isEmptyLine('\n'));
        assert.ok(!jroff.Token.isEmptyLine('asdf'));
      });
    });

    describe('#isEscape', function () {
      it('returns true only if the given string starts with a backslash', function () {
        assert.ok(jroff.Token.isEscape('\\fB'));
        assert.ok(jroff.Token.isEscape('\\(xx'));
        assert.ok(jroff.Token.isEscape('\\[xx xx xx'));
      });
    });
  });
});
