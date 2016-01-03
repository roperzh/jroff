/**
 * Works out the grammatical structure of the token array provided
 * by the Lexer and generates an AST ready to be transformed, this
 * AST could be consumed by the HTML generator but it's not limited
 * to that.
 *
 * @constructor
 * @alias Parser
 *
 * @property {string} input raw contents of the man page
 *
 * @property {array} ast
 *
 * @property {Lexer} lexer instance of the Lexer class
 *
 * @property {array} tokens provided by the lexer.lex method
 *
 * @property {number} tokenslen cache the length of the tokens array
 *
 * @property {number} idx current index
 *
 * @property {number} state current state
 *
 * @property {object} buffer stores custom variables between states
 *
 * @since 0.0.1
 *
 */
var Parser = function (input) {
  this.ast = [];
  this.lexer = new Lexer(input);
  this.tokens = this.lexer.lex();
  this.tokenslen = this.tokens.length;
  this.idx = 0;
  this.state = BREAK;
  this.buffer = {};
  this.escapeWithArguments = ['\\f', '\\s', '\\m', '\\('];

  /* beautify ignore:start */

  var mappings = [

    // COMMENT mappings
    { state: COMMENT, input: BREAK,   action: 'stop'               },
    { state: COMMENT, input: '*',     action: 'ignore'             },

    // MACRO mappings
    { state: MACRO,   input: BREAK,   action: 'stop'               },
    { state: MACRO,   input: TEXT,    action: 'addText'            },
    { state: MACRO,   input: IMACRO,  action: 'addInlineMacro'     },
    { state: MACRO,   input: COMMENT, action: 'ignore'             },
    { state: MACRO,   input: MACRO,   action: 'addText'            },
    { state: MACRO,   input: ESCAPE,  action: 'macroEscape'        },

    // IMACRO mappings
    { state: IMACRO,  input: TEXT,    action: 'addImacro'          },
    { state: IMACRO,  input: IMACRO,  action: 'addImacro'          },
    { state: IMACRO,  input: COMMENT, action: 'ignore'             },
    { state: IMACRO,  input: BREAK,   action: 'ignore'             },
    { state: IMACRO,  input: ESCAPE,  action: 'startEscape'        },
    { state: IMACRO,  input: '*',     action: 'defaultError'       },

    // BREAK mappings
    { state: BREAK,   input: MACRO,   action: 'startMacro'         },
    { state: BREAK,   input: BREAK,   action: 'addLineBreak'       },
    { state: BREAK,   input: TEXT,    action: 'startText'          },
    { state: BREAK,   input: ESCAPE,  action: 'startEscape'        },
    { state: BREAK,   input: '*',     action: 'cleanBreak'         },

    // TEXT mappings
    { state: TEXT,    input: MACRO,   action: 'concatenate'        },
    { state: TEXT,    input: COMMENT, action: 'ignore'             },
    { state: TEXT,    input: TEXT,    action: 'concatenate'        },
    { state: TEXT,    input: BREAK,   action: 'stop'               },
    { state: TEXT,    input: IMACRO,  action: 'addInlineMacro'     },
    { state: TEXT,    input: ESCAPE,  action: 'startEscape'        },

    // ESCAPE mappings
    { state: ESCAPE,  input: TEXT,    action: 'escapeText'         },
    { state: ESCAPE,  input: IMACRO,  action: 'addInlineMacro'     },
    { state: ESCAPE,  input: BREAK,   action: 'addEscape'          },
    { state: ESCAPE,  input: COMMENT, action: 'ignore'             },
    { state: ESCAPE,  input: MACRO,   action: 'escapeText'         },
    { state: ESCAPE,  input: ESCAPE,  action: 'startEscape'        },
    { state: ESCAPE,  input: '*',     action: 'defaultError'       }
  ];

  /* beautify ignore:end */

  /**
   * Privileged method with access to the `mappings` array, this is
   * a sort of hack in order to allow the nice DSL-like notation
   * of transitions between states.
   *
   * The idea is to create an alias method in the parser instance
   * per transition listed in the `mappings` array.
   *
   * For example if state = TEXT, input = BREAK and action = 'stop'
   * a property called TEXT-BREAK ( '5-4' if we replace the values )
   * will be created in the parser, and will point to the
   * Parser.prototype.stop method
   *
   * @returns {undefined}
   *
   * @since 0.0.1
   *
   */
  this.initMappings = function () {
    var mapping,
      actionName;

    for(var i = mappings.length - 1; i >= 0; i--) {
      mapping = mappings[i];
      actionName = mapping.state + '-' + mapping.input;

      if(!this[mapping.action]) {
        throw(
          'Undefined function ' + mapping.action + ' in Parser object'
        );
      }

      this[actionName] = this[mapping.action].bind(this);
    }
  };

  /**
   * Retrieve the last token stored in the AST
   *
   * @returns {Token} token
   *
   * @since 0.0.1
   *
   */
  this.lastTok = function () {
    return this.ast[this.ast.length - 1];
  };

  this.initMappings();
};

Parser.prototype.macroEscape = function (token) {
  this.state = MACRO;
  this.lastTok()
    .addSubNode(token);
};

Parser.prototype.startEscape = function (token) {
  this.ast.push(token);
  this.state = ESCAPE;
};

Parser.prototype.escapeText = function (token) {
  var lastToken = this.lastTok();

  if(this.escapeWithArguments.indexOf(lastToken.value) !== -1) {
    token.value = token.value;
    lastToken.addNode(token);
  } else {
    this.startText(token);
  }
};

Parser.prototype.addEscape = function (token) {
  this.ast.push(token);
  this.state = BREAK;
};

Parser.prototype.addImacro = function (token) {
  // If the value of the token is a space character,
  // keep going until we find a valid argument
  // TODO: document this in a proper way
  if (patterns.noWitheSpace.test(token.value)) {
    this.state = MACRO;
  };

  this.lastTok()
    .addSubNode(token);
};

Parser.prototype.addInlineMacro = function (token) {
  this.state = IMACRO;
  this.lastTok()
    .addNode(token);
};

Parser.prototype.addLineBreak = function (token) {
  this.ast.push(token);
};

Parser.prototype.addText = function (token) {
  var lastToken = this.lastTok();

  if(lastToken.lastNode()
    .kind === TEXT) {
    lastToken.mixWithLastNode(token);
  } else {
    lastToken.addNode(token);
  }
};

Parser.prototype.buildAST = function () {
  var token,
    funcName,
    func;

  while(this.tokenslen > this.idx) {
    token = this.tokens[this.idx];
    funcName = this.state + '-' + token.kind;
    func = this[funcName] || this[this.state + '-*'];

    if(!func) {
      throw(
        'Cannot find a function named ' +
        funcName + ' or ' + this.state + '-*'
      );
    }

    func(token);
    this.idx++;
  }

  return this.ast;
};

Parser.prototype.cleanBreak = function (token) {
  this.state = token.kind;
};

Parser.prototype.concatenate = function (token) {
  this.lastTok()
    .mix(token);
};

Parser.prototype.defaultError = function (token) {
  throw(
    'Error parsing argument with state: ' +
    this.state + ', input: ' + token.kind
  );
};

Parser.prototype.ignore = function () {
  this.state = COMMENT;
};

Parser.prototype.startMacro = function (token) {
  this.state = MACRO;
  this.ast.push(token);
};

Parser.prototype.startText = function (token) {
  this.state = TEXT;
  this.ast.push(token);
};

Parser.prototype.stop = function () {
  this.state = BREAK;
};
