/**
 * Jroff 0.0.1 <http://roperzh.github.io/jroff.js>
 * Copyright (c)2015 Roberto Dip <http://roperzh.com>
 * @license Distributed under MIT license
 * @module Jroff
 */

(function (root, factory) {
  if(typeof define === 'function' && define.amd) {
    define([], factory);
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Jroff = factory();
  }
}(this, function () {

  var COMMENT = 1,
    MACRO = 2,
    IMACRO = 3,
    BREAK = 4,
    TEXT = 5,
    EMPTY = 6;

  var callableMacros = [
  'Ac', 'Ao', 'Bc', 'Bo', 'Brc', 'Bro', 'Dc', 'Do', 'Ec', 'Eo', 'Fc',
  'Oc', 'Oo', 'Pc', 'Po', 'Qc', 'Qo', 'Sc', 'So', 'Xc', 'Xo', 'Aq',
  'Bq', 'Brq', 'Dq', 'Op', 'Pq', 'Ql', 'Qq', 'Sq', 'Vt', 'Ta', 'Ad',
  'An', 'Ap', 'Ar', 'At', 'Bsx', 'Bx', 'Cd', 'Cm', 'Dv', 'Dx', 'Em',
  'Er', 'Ev', 'Fa', 'Fl', 'Fn', 'Ft', 'Fx', 'Ic', 'Li', 'Lk', 'Ms',
  'Mt', 'Nm', 'Ns', 'Nx', 'Ox', 'Pa', 'Pf', 'Sx', 'Sy', 'Tn', 'Ux',
  'Va', 'Vt', 'Xr'
];

  /**
   * Wrap all common regexp patterns
   *
   * @namespace
   * @alias patterns
   * @since 0.0.1
   *
   */
  var patterns = {
    macro: /^\.[^\.]/,
    noWithespace: /\n|\S+/g,
    comment: /(\.\\)?\\\"/,
    arguments: /"(.*?)"|\S+/g,
    number: /[\d]/
  };

  var mergeObjects = function (objects) {
    return objects.reduce(function (memo, object) {
      for(var key in object) {
        if(object.hasOwnProperty(key)) {
          memo[key] = object[key];
        }
      }

      return memo;
    }, {});
  };

  var macros = {};

  /**
   * Represents a single token, encapsulates common behavior useful
   * to parse and manipulate tokens
   *
   * @constructor
   * @alias Token
   *
   * @property {string} value
   *
   * @property {number} kind of the token, used to know if the token
   * represents a macro, break, inline macro, etc.
   *
   * @property {array} nodes is a collection of sub tokens, useful while
   * parsing ( for example a macro with inline macros ).
   *
   * @since 0.0.1
   *
   */
  var Token = function (value, kind) {
    this.value = value || '';
    this.kind = kind || EMPTY;
    this.nodes = [];
  };

  /**
   * Class method used to know wheter a string represents a comment
   *
   * @param {string} str
   *
   * @returns {boolean}
   *
   * @since 0.0.1
   *
   */
  Token.isComment = function (str) {
    return patterns.comment.test(str);
  };

  /**
   * Class method used to know wheter a string represents an empty line
   *
   * @param {string} str
   *
   * @returns {boolean}
   *
   * @since 0.0.1
   *
   */
  Token.isEmptyLine = function (str) {
    return str === '\n';
  };

  /**
   * Class method used to know wheter a string represents an inline
   * macro
   *
   * @param {string} str
   *
   * @returns {boolean}
   *
   * @since 0.0.1
   *
   */
  Token.isInlineMacro = function (str) {
    return callableMacros.indexOf(str) !== -1;
  };

  /**
   * Class method used to know wheter a string represents a macro
   *
   * @param {string} str
   *
   * @returns {boolean}
   *
   * @since 0.0.1
   *
   */
  Token.isMacro = function (str) {
    return patterns.macro.test(str);
  };

  /**
   * Add a given token into the nodes array
   *
   * @param {Token} token
   *
   * @returns {Token} the token instance itself, useful for method
   * chaining
   *
   * @since 0.0.1
   *
   */
  Token.prototype.addNode = function (token) {
    this.nodes.push(token);

    return this;
  };

  /**
   * Add a given token into the nodes array of the last node
   *
   * @param {Token} token
   *
   * @returns {Token} the token instance itself, useful for method
   * chaining
   *
   * @todo clarify the documentation and add examples
   *
   * @since 0.0.1
   *
   */
  Token.prototype.addSubNode = function (token) {
    this.lastNode()
      .addNode(token);
  };

  /**
   * Return the last node in the nodes array, if the array is empty,
   * safely return a new token of kind EMPTY
   *
   * @returns {Token}
   *
   * @since 0.0.1
   *
   */
  Token.prototype.lastNode = function () {
    return this.nodes[this.nodes.length - 1] || new Token();
  };

  /**
   * Mix the given token with the current token instance.
   *
   * Mixing two tokens means to concatenate their values
   *
   * @param {Token} token
   *
   * @returns {Token} the token instance itself, useful for method
   * chaining
   *
   * @todo clarify the documentation and add examples
   *
   * @since 0.0.1
   *
   */
  Token.prototype.mix = function (token) {
    this.value = this.value + ' ' + token.value;

    if(this.kind === EMPTY) {
      this.kind = token.kind;
    }

    return this;
  };

  /**
   * Mix a given token, with the last token in the nodes collection,
   * if the nodes collection is empty, safely mix it with an empty token
   * via the `lastNode` function
   *
   * @param {Token} the token to be mixed
   *
   * @returns {Token} the token instance itself, useful for method
   * chaining
   *
   * @since 0.0.1
   *
   */
  Token.prototype.mixWithLastNode = function (token) {
    this.lastNode()
      .mix(token);

    return this;
  };

  /**
   * Supplies an interface to create new Token instances based on a
   * string representation of the token, and returns a Token instance
   * with the correct `kind` attribute.
   * This constructor is meant to be instantiated.
   *
   * @constructor
   * @alias TokenFactory
   * @since 0.0.1
   *
   */
  var TokenFactory = function () {};

  /**
   * Creates a new Token with the correct kind based on a raw
   * representation of the token
   *
   * @param {string} [rawToken]
   *
   * @returns {Token} a new instance of the Token class
   *
   * @example
   * var factory = new TokenFactory();
   * var token = factory.create('.SH TITLE');
   * token.kind === MACRO; //=> true
   * token.value; //=> 'TITLE'
   *
   * @since 0.0.1
   *
   */
  TokenFactory.prototype.create = function (rawToken) {
    var kind = TEXT;

    if(typeof rawToken === 'undefined') {
      kind = EMPTY;
    } else if(Token.isComment(rawToken)) {
      kind = COMMENT;
    } else if(Token.isMacro(rawToken)) {
      kind = MACRO;
      rawToken = rawToken.substring(1);
    } else if(Token.isInlineMacro(rawToken)) {
      kind = IMACRO;
    } else if(Token.isEmptyLine(rawToken)) {
      kind = BREAK;
    }

    return new Token(rawToken, kind);
  };

  /**
   * Takes charge of the process of converting a sequence of characters
   * (string) into a sequence of tokens. Also keeps track of useful
   * information like current column and line number during the process
   *
   * @constructor
   *
   * @property {array} source the source string, splitted by withespaces
   *
   * @property {array} tokens buffer to store the parsed tokens
   *
   * @property {integer} sourceIdx current token index
   *
   * @property {col} current column being parsed
   *
   * @property {line} current line being parsed
   *
   * @property {TokenFactory} factory used to create tokens
   *
   */
  var Lexer = function (source) {
    this.source = source.match(patterns.noWithespace);
    this.tokens = [];
    this.sourceIdx = 0;
    this.col = 0;
    this.line = 1;
    this.factory = new TokenFactory();
  };

  /**
   * Does the tokenization of the source given in the constructor,
   * and returns an array of tokens.
   *
   * @returns {array} array of tokens
   *
   * @example
   * var lexer = new Lexer(string);
   * lexer.lex() //=> [...]
   */
  Lexer.prototype.lex = function () {
    var lexeme;

    while((lexeme = this.next())) {
      this.tokens.push(this.factory.create(lexeme));
    }

    return this.tokens;
  };

  /**
   * Deals with the management of the current token being parsed,
   * and of the state of the col and line variables.
   *
   * @returns {string} the next lexeme in the source, when there is no
   * more lexemes it returns `undefined`
   *
   */
  Lexer.prototype.next = function () {
    var lexeme = this.source[this.sourceIdx++];

    if(lexeme === '\n') {
      this.col = 0;
      this.line += 1;
    } else if(lexeme) {
      this.col += lexeme.length;
    }

    return lexeme;
  };

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

    /* beautify ignore:start */

  var mappings = [

    // COMMENT mappings
    { state: COMMENT, input: '*',     action: 'ignore'       },
    { state: COMMENT, input: BREAK,   action: 'stop'         },

    // MACRO mappings
    { state: MACRO,   input: BREAK,   action: 'stop'         },
    { state: MACRO,   input: TEXT,    action: 'addText'      },
    { state: MACRO,   input: IMACRO,  action: 'addInline'    },
    { state: MACRO,   input: COMMENT, action: 'ignore'       },
    { state: MACRO,   input: MACRO,   action: 'addText'      },

    // IMACRO mappings
    { state: IMACRO,  input: TEXT,    action: 'addImacro'    },
    { state: IMACRO,  input: IMACRO,  action: 'addImacro'    },
    { state: IMACRO,  input: COMMENT, action: 'ignore'       },
    { state: IMACRO,  input: BREAK,   action: 'ignore'       },
    { state: IMACRO,  input: '*',     action: 'defaultError' },

    // BREAK mappings
    { state: BREAK,   input: MACRO,   action: 'startMacro'   },
    { state: BREAK,   input: BREAK,   action: 'addLineBreak' },
    { state: BREAK,   input: TEXT,    action: 'startText'    },
    { state: BREAK,   input: '*',     action: 'cleanBreak'   },

    // TEXT mappings
    { state: TEXT,    input: MACRO,   action: 'concatenate'  },
    { state: TEXT,    input: COMMENT, action: 'ignore'       },
    { state: TEXT,    input: TEXT,    action: 'concatenate'  },
    { state: TEXT,    input: BREAK,   action: 'stop'         },
    { state: TEXT,    input: IMACRO,  action: 'addInline'    }
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

  Parser.prototype.addImacro = function (token) {
    this.state = MACRO;
    this.lastTok()
      .addSubNode(token);
  };

  Parser.prototype.addInline = function (token) {
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
    token.value = ' ' + token.value;
    this.ast.push(token);
  };

  Parser.prototype.stop = function (token) {
    this.state = BREAK;
  };

  /**
   * Group all `an` macros
   * @namespace
   * @alias anMacros
   * @since 0.0.1
   */
  macros.an = {

    /**
     * This should be the first command in a man page, not only
     * creates the title of the page but also stores in the buffer
     * useful variables: `title`, `section`, `date`, `source`
     * and `manual`
     *
     * @param {string} args raw representation of the arguments
     * described below, in this version the TH function is in charge
     * to parse and store this arguments in the buffer
     *
     * @param {object} buffer
     *
     * @returns {string}
     *
     * @example
     * var args = 'FOO 1 "MARCH 1995" Linux "User Manuals"';
     * var buffer = {};
     *
     * TH(args, buffer);
     * buffer.title   //=> FOO
     * buffer.section //=> 1
     * buffer.date    //=> "MARCH 1995"
     *
     * @since 0.0.1
     *
     */
    TH: function (args) {
      var title;

      args = this.parseArguments(args);

      this.buffer.title = args[0] || '';
      this.buffer.section = args[1] || '';
      this.buffer.date = args[2] || '';
      this.buffer.source = args[3] || '';
      this.buffer.manual = args[4] || '';

      title = this.buffer.title + '(' + this.buffer.section + ')';

      return(
        '<p><span>' + title + '</span>' +
        '<span>' + this.buffer.manual + '</span>' +
        '<span>' + title + '</span></p>'
      );
    },

    /**
     * Represent a section in the manual, creates a title tag
     * with the contents of the `arg` variable
     *
     * @param {string} args section title, from 1 to n words.
     *
     * @returns {string} a semantic representation of a section title.
     *
     * @since 0.0.1
     *
     */
    SH: function (args) {
      return this.generateTag('h2', args);
    },

    /**
     * Represent a subsection inside a section, creates a subtitle tag
     * with the contents of the `arg` variable
     *
     * @param {string} args subtitle, from 1 to n words.
     *
     * @returns {string} a semantic representation of a section title.
     *
     * @since 0.0.1
     *
     */
    SS: function (args) {
      return this.generateTag('h3', args);
    },

    /**
     * Generate bold text
     *
     * @param {string} args the text to be presented as bold
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    B: function (args) {
      return this.generateTag('strong', args);
    },

    /**
     * Generate bold text alternated with italic text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    BI: function (args) {
      return this.generateAlternTag('strong', 'i', args);
    },

    /**
     * Generate bold text alternated with regular text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    BR: function (args) {
      return this.generateAlternTag('strong', 'span', args);
    },

    /**
     * Generate italic text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    I: function (args) {
      return this.generateTag('i', args);
    },

    /**
     * Generate italic text alternated with bold
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    IB: function (args) {
      return this.generateAlternTag('i', 'strong', args);
    },

    /**
     * Generate italic text alternated with regular text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    IR: function (args) {
      return this.generateAlternTag('i', 'span', args);
    },

    /**
     * Generate regular text alternated with bold text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    RB: function (args) {
      return this.generateAlternTag('span', 'strong', args);
    },

    /**
     * Generate regular text alternated with italic text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    RI: function (args) {
      return this.generateAlternTag('span', 'i', args);
    },

    /**
     * Generate small text alternated with bold text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    SB: function (args) {
      return this.generateAlternTag('small', 'strong', args);
    },

    /**
     * Generate small text
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    SM: function (args) {
      return this.generateTag('small', args);
    },

    /**
     * Generate a paragraph
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    P: function (args) {
      return this.generateTag('p', args);
    }
  };

  macros.an.LP = macros.an.P;
  /* TODO: check this one */
  macros.an.PP = macros.an.P;

  macros.defaults = {
    br: function () {
      return '<br>';
    }
  };

  var docSections = {
    1: 'General Commands Manual',
    2: 'System Calls Manual',
    3: 'Library Functions Manual',
    4: 'Kernel Interfaces Manual',
    5: 'File Formats Manual',
    6: 'Games Manual',
    7: 'Miscellaneous Information Manual',
    8: 'System Manager\'s Manual',
    9: 'Kernel Developer\'s Manual'
  };

  var volumes = {
    'USD': 'User\'s Supplementary Documents',
    'PS1': 'Programmer\'s Supplementary Documents',
    'AMD': 'Ancestral Manual Documents',
    'SMM': 'System Manager\'s Manual',
    'URM': 'User\'s Reference Manual',
    'PRM': 'Programmer\'s Manual',
    'KM': 'Kernel Manual',
    'IND': 'Manual Master Index',
    'LOCAL': 'Local Manual',
    'CON': 'Contributed Software Manual'
  };

  var architectures = [
  'alpha', 'acorn26', 'acorn32', 'algor', 'amd64', 'amiga', 'arc', 'arm26',
  'arm32', 'atari', 'bebox', 'cats', 'cesfic', 'cobalt', 'dreamcast',
  'evbarm', 'evbmips', 'evbppc', 'evbsh3', 'hp300', 'hp700', 'hpcmips',
  'i386', 'luna68k', 'm68k', 'mac68k', 'macppc', 'mips', 'mmeye', 'mvme68k',
  'mvmeppc', 'netwinder', 'news68k', 'newsmips', 'next68k', 'ofppc',
  'pc532', 'pmax', 'pmppc', 'powerpc', 'prep', 'sandpoint', 'sgimips', 'sh3',
  'shark', 'sparc', 'sparc64', 'sun3', 'tahoe', 'vax', 'x68k', 'x86_64'
];

  var fontModes = {
    emphasis: 'i',
    literal: 'span',
    symbolic: 'strong'
  };

  var abbreviations = {
    '-ansiC': 'ANSI X3.159-1989 (``ANSI C89\'\')',
    '-ansiC-89': 'ANSI X3.159-1989 (``ANSI C89\'\')',
    '-isoC': 'ISO/IEC 9899:1990 (``ISO C90\'\')',
    '-isoC-90': 'ISO/IEC 9899:1990 (``ISO C90\'\')',
    '-isoC-99': 'ISO/IEC 9899:1999 (``ISO C99\'\')',
    '-iso9945-1-90': 'ISO/IEC 9945-1:1990 (``POSIX.1\'\')',
    '-iso9945-1-96': 'ISO/IEC 9945-1:1996 (``POSIX.1\'\')',
    '-p1003.1': 'IEEE Std 1003.1 (``POSIX.1\'\')',
    '-p1003.1-88': 'IEEE Std 1003.1-1988 (``POSIX.1\'\')',
    '-p1003.1-90': 'ISO/IEC 9945-1:1990 (``POSIX.1\'\')',
    '-p1003.1-96': 'ISO/IEC 9945-1:1996 (``POSIX.1\'\')',
    '-p1003.1b-93': 'IEEE Std 1003.1b-1993 (``POSIX.1\'\')',
    '-p1003.1c-95': 'IEEE Std 1003.1c-1995 (``POSIX.1\'\')',
    '-p1003.1g-2000': 'IEEE Std 1003.1g-2000 (``POSIX.1\'\')',
    '-p1003.1i-95': 'IEEE Std 1003.1i-1995 (``POSIX.1\'\')',
    '-p1003.1-2001': 'IEEE Std 1003.1-2001 (``POSIX.1\'\')',
    '-p1003.1-2004': 'IEEE Std 1003.1-2004 (``POSIX.1\'\')',
    '-iso9945-2-93': 'ISO/IEC 9945-2:1993 (``POSIX.2\'\')',
    '-p1003.2': 'IEEE Std 1003.2 (``POSIX.2\'\')',
    '-p1003.2-92': 'IEEE Std 1003.2-1992 (``POSIX.2\'\')',
    '-p1003.2a-92': 'IEEE Std 1003.2a-1992 (``POSIX.2\'\')',
    '-susv2': 'Version 2 of the Single UNIX Specification (``SUSv2\'\')',
    '-susv3': 'Version 3 of the Single UNIX Specification (``SUSv3\'\')',
    '-svid4': 'System V Interface Definition, Fourth Edition (``SVID4\'\')',
    '-xbd5': 'X/Open System Interface Definitions Issue 5 (``XBD5\'\')',
    '-xcu5': 'X/Open Commands and Utilities Issue 5 (``XCU5\'\')',
    '-xcurses4.2': 'X/Open Curses Issue 4, Version 2 (``XCURSES4.2\'\')',
    '-xns5': 'X/Open Networking Services Issue 5 (``XNS5\'\')',
    '-xns5.2': 'X/Open Networking Services Issue 5.2 (``XNS5.2\'\')',
    '-xpg3': 'X/Open Portability Guide Issue 3 (``XPG3\'\')',
    '-xpg4': 'X/Open Portability Guide Issue 4 (``XPG4\'\')',
    '-xpg4.2': 'X/Open Portability Guide Issue 4, Version 2 (``XPG4.2\'\')',
    '-xsh5': 'X/Open System Interfaces and Headers Issue 5 (``XSH5\'\')',
    '-ieee754': 'IEEE Std 754-1985',
    '-iso8802-3': 'ISO/IEC 8802-3:1989'
  };

  /**
   * Group all `doc` macros
   * @namespace
   * @alias macros.doc
   * @since 0.0.1
   */
  macros.doc = {

    /**
     * This should be the first command in a man page, not only
     * creates the title of the page but also stores in the buffer
     * useful variables: `title`, `section`, `date`, `source`
     * and `manual`
     *
     * @argument {string} args.title is the subject of the page,
     * traditionally in capitals due to troff limitations, but
     * capitals are not required in this implementation.
     * If ommited, 'UNTITLED' is used.
     *
     * @argument {string} args.section number, may be a number in the
     * range 1..9, mappings between numbers and section names are
     * defined in the 'docSections' namespace. The default value is
     * empty.
     *
     * @argument {string} args.volume name may be arbitrary or one of
     * the keys defined in the volumes namespace, defaults to LOCAL.
     *
     * If the section number is neither a numeric expression in the
     * range 1 to 9 nor one of the above described keywords, the third
     * parameter is used verbatim as the volume name.
     *
     * @returns {string} a representation of the header displayed by
     * groff
     *
     * @since 0.0.1
     *
     */
    Dt: function (args) {
      var sideText,
        midText,
        title,
        section,
        volume;

      /* Parse the arguments string */
      args = this.parseArguments(args);
      title = args[0];
      section = args[1];
      volume = args[2];

      /* Store arguments with default values in the buffer */
      this.buffer.title = title || 'UNTITLED';
      this.buffer.section = section || '';
      this.buffer.volume = volume || 'LOCAL';

      sideText = this.buffer.title;
      midText = this.buffer.volume;

      if(section) {
        sideText = this.buffer.title + '(' + this.buffer.section + ')';

        if(volumes[volume]) {
          midText = volumes[volume];
        } else if(architectures.indexOf(volume) !== -1) {
          midText = 'BSD/' + volume + docSections[this.buffer.section];
        } else if(docSections[this.buffer.section]) {
          midText = 'BSD' + docSections[this.buffer.section];
        }
      }

      return(
        '<p><span>' + sideText + '</span>' +
        '<span>' + midText + '</span>' +
        '<span>' + sideText + '</span></p><section>'
      );
    },

    /**
     * Store the document date in the buffer,
     * since this macro is neither callable nor parsed
     * we just store the verbatim value
     *
     * @param {string} date
     *
     * @since 0.0.1
     *
     */
    Dd: function (date) {
      this.buffer.date = date;
    },

    /**
     * Store a value for the operating system in the buffer,
     * this value is used in the bottom left corner of the
     * parsed manpage.
     *
     * This macro is neither callable nor parsed.
     *
     * @param {string} os
     *
     * @since 0.0.1
     *
     */
    Os: function (os) {
      this.buffer.os = os;
    },

    /**
     * The address macro identifies an address construct,
     * it's generally printed as a italic text.
     *
     * @param {string} address
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Ad: function (args) {
      return this.generateTag('i', args);
    },

    /**
     * The `.An' macro is used to specify the name of the author
     * of the item being documented, or the name of the author of
     * the actual manual page.
     *
     * Generally prints text in regular format
     *
     * @param {string} author
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    An: function (author) {
      return this.generateTag('span', author);
    },

    /**
     * The .Ar argument macro may be used whenever an argument
     * is referenced. If called without arguments,
     * the `file ...' string is output.
     *
     * Generally prints text in italic format
     *
     * @param {string} argument
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Ar: function (args) {
      args = args || 'file...';

      return this.generateTag('i', args);
    },

    /**
     * The `.Cd' macro is used to demonstrate a config
     * declaration for a device interface in a section four manual.
     *
     * In the SYNOPSIS section a `.Cd' command causes a line break
     * before and after its arguments are printed.
     *
     * Generally prints text in bold format
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Cd: function (args) {
      var tag = this.isInsideOf('SYNOPSIS') ? 'p>strong' : 'strong';

      args = args.replace(/"/g, '');

      return this.generateTag(tag, args);
    },

    /**
     * Defines a variable, in practical terms, it only returns the text
     * in normal format
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Dv: function (args) {
      return this.generateTag('span', args);
    },

    /**
     * Especifies an environment variable,
     * in practical terms, it only returns the text in normal format
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Ev: function (args) {
      return this.generateTag('span', args);
    },

    /**
     * The `.Fl' macro handles command line flags, it prepends
     * a dash, `-', to the flag and makes it bold.
     *
     * A call without any arguments results in a dash representing
     * stdin/stdout
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Fl: function (args) {
      return this.generateTag('strong', '-' + args);
    },

    /**
     * The command modifier is identical to the `.Fl' (flag) command
     * with the exception that the `.Cm' macro does not assert a dash
     * in front of every argument.
     *
     * @param {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Cm: function (args) {
      return this.generateTag('strong', args);
    },

    /**
     * The `.Nm' macro is used for the document title or subject name.
     * It has the peculiarity of remembering the first argument it
     * was called with, which should always be the subject name of
     * the page.  When called without arguments, `.Nm' regurgitates
     * this initial name for the sole purpose of making less work
     * for the author.
     *
     * @param {string} args name
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Nm: function (args) {
      var result;

      this.buffer.name = this.buffer.name || args;
      result = args || this.buffer.name;

      return this.generateTag('strong', result);
    },

    /**
     * `.Nd' first prints `--', then all its arguments.
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Nd: function (args) {
      return this.generateTag('span', '-- ' + args);
    },

    /**
     * Defines a section header and a wrapper for the content that
     * comes next ( section tag ) indented with the default indent.
     *
     * Also stores in the buffer the current section name.
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Sh: function (args) {
      var openingTag = '<section style="margin-left:' +
        this.buffer.style.indent + '%;">';

      this.buffer.section = args;

      return '</section>' + this.generateTag('h2', args) + openingTag;
    },

    /**
     * The `.Op' macro places option brackets around any remaining
     * arguments on the command line
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Op: function (args) {
      return this.generateTag('span', '[' + args + ']');
    },

    /**
     * The `.Xr' macro expects the first argument to be a manual page
     * name. The optional second argument, if a string
     * (defining the manual section), is put into parentheses.
     *
     * @argument {string} args.name name of the manual page
     *
     * @argument {string} args.number
     *
     * @argument {string} text the remaining text in the line
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Xr: function (args) {
      var name,
        number,
        text;

      args = this.parseArguments(args);

      name = args.shift() || '';
      number = args[0] ? '(' + args.shift() + ')' : '';
      text = args.join(' ') || '';

      return this.generateTag('span', name + number + text);
    },

    /**
     * Initiates several types of lists, they may be
     * nested within themselves and within displays.
     *
     * The list type is specified with the first argument provided
     *
     * In addition, several list attributes may be specified
     * such as the width of a tag, the list offset, and compactness.
     *
     * In this implementation, the macro stores in the buffer the
     * list type for later use within the It tag
     *
     * @param {string} args.type the type of the list,
     * for example -enum
     *
     * @returns {string}
     *
     *
     * @since 0.0.1
     *
     */
    Bl: function (args) {
      var indent;

      args = this.parseArguments(args);

      this.buffer.lists.unshift({
        kind: args[0],
        prevTag: '',
        isOpen: false
      });

      indent = (
        this.buffer.style.indent / 4) * (this.buffer.lists.length - 1);

      return(
        '<ul style="list-style:none;padding:0 0 0 ' + indent + '%;">'
      );
    },

    /**
     * Items within the list are specified with the `.It'
     * item macro.
     *
     * Depending on the list type the macro could receive extra args
     *
     * @argument {string} args exact meaning depends on list type
     *
     * @returns {string}
     *
     * @todo complete this documentation explain how the text and the
     * styles work.
     *
     * @since 0.0.1
     *
     */
    It: function (args) {
      var list = this.buffer.lists[0],
        pre = list.isOpen ? '</span></li>' : '',
        tagStyles = '',
        tag = '',
        contentStyles = '';

      list.isOpen = true;

      switch(list.kind) {
      case 'bullet':
        tag = '&compfn;';
        contentStyles = 'margin-left:2%';
        break;

      case 'dash':
        tag = '&minus;';
        contentStyles = 'margin-left:2%';
        break;

      case 'enum':
        list.prevTag = list.prevTag || 1;
        tag = (list.prevTag++) + '.';
        contentStyles = 'margin-left:2%';
        break;

      case 'item':
        tag = '';
        contentStyles = 'margin-left:2%';
        break;

      case 'tag':
        tag = args;
        tagStyles = 'display:block;margin-bottom:15px;';
        contentStyles = 'margin-left:2%';
        break;

      case 'hang':
        tag = this.generateTag('i', args);
        tagStyles = 'width:8%;display:inline-block;';
        contentStyles = 'margin-left:2%';
        break;

      case 'ohang':
        tag = this.generateTag('strong', args);
        tagStyles = 'display:block;';
        contentStyles = 'margin-bottom:2%;display:inline-block';
        break;

      case 'inset':
        tag = this.generateTag('i', args);
        contentStyles = 'margin-bottom:2%;display:inline-block;';
        break;
      }

      return(
        pre + '<li><span style="' + tagStyles + '">' +
        tag + '</span><span style="' + contentStyles + '">'
      );
    },

    /**
     * Defines the end of a list
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    El: function () {
      this.buffer.lists.shift();

      return '</span></li></ul>';
    },

    /**
     * The `.Pp' paragraph command may be used to specify a line space
     * where necessary.
     *
     * Since raw text is just added to the stream, this function
     * only opens the paragraph, the closing is handled in the
     * generator
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Pp: function () {
      this.buffer.isParagraphOpen = true;

      return '<p>';
    },

    /**
     * Prints an opening bracket
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Oo: function () {
      return this.generateTag('span', '[');
    },

    /**
     * Prints a closing bracket
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Oc: function () {
      return this.generateTag('span', ']');
    },

    /**
     * Encloses in angle brackets the given text
     *
     * @argument {string} args text to be enclosed
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Aq: function (args) {
      return this.generateTag('span', '&lt;' + args + '&gt;');
    },

    /**
     * Prints an opening angle bracket
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Ao: function () {
      return this.generateTag('span', '&lt;');
    },

    /**
     * Prints a closing angle bracket
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Ac: function () {
      return this.generateTag('span', '&gt;');
    },

    /**
     * Encloses in brackets the given text
     *
     * @argument {string} args text to be enclosed
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Bq: function (args) {
      return this.generateTag('span', '[' + args + ']');
    },

    /**
     * Prints an opening bracket
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Bo: function () {
      return this.generateTag('span', '[');
    },

    /**
     * Prints a closing bracket
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Bc: function () {
      return this.generateTag('span', ']');
    },

    /**
     * Encloses in braces the given text
     *
     * @argument {string} args text to be enclosed
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Brq: function (args) {
      return this.generateTag('span', '{' + args + '}');
    },

    /**
     * Prints an opening brace
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Bro: function () {
      return this.generateTag('span', '{');
    },

    /**
     * Prints a closing brace
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Brc: function () {
      return this.generateTag('span', '}');
    },

    /**
     * Encloses in double quotes a given text
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Dq: function (args) {
      return this.generateTag('span', '``' + args + '\'\'');
    },

    /**
     * Prints an opening double quote
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Do: function () {
      return this.generateTag('span', '``');
    },

    /**
     * Prints a closing double quote
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Dc: function () {
      return this.generateTag('span', '\'\'');
    },

    /**
     * Encloses a given text in XX
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Eq: function (args) {
      return this.generateTag('span', 'XX' + args + 'XX');
    },

    /**
     * Prints XX
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Eo: function () {
      return this.generateTag('span', 'XX');
    },

    /**
     * Prints XX
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Ec: function () {
      return this.generateTag('span', 'XX');
    },

    /**
     * Encloses the given text in parenthesis
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Pq: function (args) {
      return this.generateTag('span', '(' + args + ')');
    },

    /**
     * Prints an open parenthesis
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Po: function () {
      return this.generateTag('span', '(');
    },

    /**
     * Prints a closing parenthesis
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Pc: function () {
      return this.generateTag('span', ')');
    },

    /**
     * Encloses a text in straight double quotes
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Qq: function (args) {
      return this.generateTag('span', '"' + args + '"');
    },

    /**
     * Prints a straight double quote
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Qo: function () {
      return this.generateTag('span', '"');
    },

    /**
     * Prints a straight double quote
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Qc: function () {
      return this.generateTag('span', '"');
    },

    /**
     * Encloses text in straight single quotes
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Sq: function (args) {
      return this.generateTag('span', '`' + args + '\'');
    },

    /**
     * Prints a straight single qoute
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    So: function () {
      return this.generateTag('span', '`');
    },

    /**
     * Prints a straight single quote
     *
     * @retuns {string}
     *
     * @since 0.0.1
     *
     */
    Sc: function () {
      return this.generateTag('span', '\'');
    },

    /**
     * Replaces standard abbreviations with their formal names.
     * Mappings between abbreviations and formal names can be found in
     * the 'abbreviations' object
     *
     * If the abbreviation is invalid, nothing is printed.
     *
     * @arguments {string} args abbreviation
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    St: function (args) {
      var cont = '';

      args = args.trim();

      if(abbreviations[args]) {
        cont = this.generateTag('abbr', abbreviations[args]);
      }

      return cont;
    },

    /**
     * Prints 'AT&T UNIX' and prepends the version number if provided
     *
     * @argument {string} version the version number
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    At: function (version) {
      var base = ' AT&amp;T UNIX',
        preamble;

      version = version.match(patterns.number);
      preamble = version ? 'Version ' + version[0] : '';

      return this.generateTag('span', preamble + base);
    },

    /**
     * Prints 'BSD' and prepends the version number if provided, also
     * if the -devel flag is provided, print a default text
     *
     * @argument {string} version the version number
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Bx: function (version) {
      var base = 'BSD',
        out;

      if(version === '-devel') {
        out = base + '(currently under development)';
      } else {
        out = version + base;
      }

      return this.generateTag('span', out);
    },

    /**
     * Formats path or file names.  If called without arguments,
     * the `~' string is output, which represents the current user's
     * home directory.
     *
     * @arguments {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Pa: function (args) {
      args = args || '~';

      return this.generateTag('i', args);
    },

    /**
     * Quotes the argument literally
     * @arguments {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Ql: function (args) {
      return this.generateTag('span', '`' + args + '\'');
    },

    /**
     * Reference start. Causes a line break in the SEE ALSO section
     * and begins collection of reference information until
     * the reference end macro is read.
     *
     * In practice, defines the references namespace in the buffer
     *
     * @since 0.0.1
     *
     */
    Rs: function () {
      this.buffer.references = {
        authors: [],
        bookTitle: '',
        date: '',
        publisherName: '',
        journalName: '',
        issueNumber: '',
        optionalInformation: '',
        pageNumber: '',
        corporate: '',
        reportName: '',
        articleTitle: '',
        volume: ''
      };
    },

    /**
     * Reference author name; one name per invocation.
     *
     * @arguments {string} name
     *
     * @since 0.0.1
     *
     */
    '%A': function (name) {
      this.buffer.references.authors.push(name);
    },

    /**
     * Reference book title
     *
     * @arguments {string} title
     *
     * @since 0.0.1
     *
     */
    '%B': function (title) {
      this.buffer.references.bookTitle += ' ' + title;
    },

    /**
     * Reference date asa raw string
     *
     * @arguments {string} date
     *
     * @since 0.0.1
     *
     */
    '%D': function (date) {
      this.buffer.references.date += ' ' + date;
    },

    /**
     * Reference issue/publisher name
     *
     * @arguments {string} name
     *
     * @since 0.0.1
     *
     */
    '%I': function (name) {
      this.buffer.references.publisherName += ' ' + name;
    },

    /**
     * Reference journal name
     *
     * @arguments {string} name
     *
     * @since 0.0.1
     *
     */
    '%J': function (name) {
      this.buffer.references.journalName += ' ' + name;
    },

    /**
     * Reference issue number
     *
     * @arguments {string} issue
     *
     * @since 0.0.1
     *
     */
    '%N': function (issue) {
      this.buffer.references.issueNumber += ' ' + issue;
    },

    /**
     * Reference optional information
     *
     * @arguments {string} args
     *
     * @since 0.0.1
     *
     */
    '%O': function (args) {
      this.buffer.references.optionalInformation += ' ' + args;
    },

    /**
     * Reference page number
     *
     * @arguments {string} page
     *
     * @since 0.0.1
     *
     */
    '%P': function (page) {
      this.buffer.references.pageNumber += ' ' + page;
    },

    /**
     * Reference corporate author
     *
     * @arguments {string} name
     *
     * @since 0.0.1
     *
     */
    '%Q': function (name) {
      this.buffer.references.corporate += ' ' + name;
    },

    /**
     * Reference report name
     *
     * @arguments {string} name
     *
     * @since 0.0.1
     *
     */
    '%R': function (name) {
      this.buffer.references.reportName += ' ' + name;
    },

    /**
     * Reference title of article
     *
     * @arguments {string} title
     *
     * @since 0.0.1
     *
     */
    '%T': function (title) {
      this.buffer.references.articleTitle += ' ' + title;
    },

    /**
     * Reference volume
     *
     * @arguments {string} volume
     *
     * @since 0.0.1
     *
     */
    '%V': function (volume) {
      this.buffer.references.volume += ' ' + volume;
    },

    /**
     * Reference end, prints all the references. Uses special
     * treatement with author names, joining them with '&'
     *
     * @return {string}
     *
     * @since 0.0.1
     *
     */
    Re: function () {
      var references = [];

      this.buffer.references.authors =
        this.buffer.references.authors.join(' and ');

      for(var key in this.buffer.references) {
        if(this.buffer.references[key]) {
          references.push(this.buffer.references[key]);
        }
      }

      return this.generateTag('p', references.join(', '));
    },

    /**
     * Prints its arguments in a smaller font.
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Tn: function (args) {
      return this.generateTag('small', args);
    },

    /**
     * Represents symbolic emphasis, prints the provided arguments
     * in boldface
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Sy: function (args) {
      return this.generateTag('strong', args);
    },

    /**
     * References variables, print the provided arguments in italics
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Va: function (args) {
      return this.generateTag('i', args);
    },

    /**
     * May be used for special characters, variable con-
     * stants, etc. - anything which should be displayed
     * as it would be typed.
     *
     * @argument {string} args
     *
     * @returns {string}
     *
     * @todo check this implementation once we handle escaped chars
     *
     * @since 0.0.1
     *
     */
    Li: function (args) {
      return this.generateTag('span', args);
    },

    /**
     * Start the font mode until .Ef is reached, receives a font mode
     * flag as a parameter; valid font modes are:
     *
     * - `-emphasis` Same as .Em macro
     * - `-literal`  Same as .Li macro
     * - `-symbolic` Same as .Sy macro
     *
     * Font modes and their tags are listed in the `fontModes` object.
     *
     * @argument {string} mode mode to be used
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Bf: function (mode) {
      var tag;

      mode = this.parseArguments(mode)[0];
      tag = fontModes[mode] || 'span';

      this.buffer.activeFontModes = this.buffer.activeFontModes || [];
      this.buffer.activeFontModes.push(tag);

      return '<' + tag + '>';
    },

    /**
     * Stop the font mode started with .Bf
     *
     * @since 0.0.1
     *
     */
    Ef: function () {
      var tag = this.buffer.activeFontModes.pop();

      return '</' + tag + '>';
    },

    /**
     * Represent a subsection inside a section, creates a subtitle tag
     * with the contents of the `arg` variable
     *
     * @param {string} subtitle, from 1 to n words.
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Ss: function (subtitle) {
      return this.generateTag('h3', subtitle);
    },

    /**
     * Prints a function signature, with the function name in bold
     * if no arguments are provided, returns an empty string
     *
     * @argument {string} args.name function name
     *
     * @argument {string} args.params function params
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Fn: function (args) {
      var type,
        name,
        params,
        storedType;

      args = this.parseArguments(args);

      if(!args[0]) {
        return '';
      }

      storedType = this.buffer.functionType;
      type = storedType ? this.generateTag('i', storedType) : '';
      name = this.generateTag('strong', args[0]);
      params = args[1] || '';

      this.buffer.functionType = '';

      return this.generateTag('span', type + name + '(' + params + ')');
    },

    /**
     * Stores in the buffer a function type to be used later on for
     * others macros (for example Fn)
     *
     * @since 0.0.1
     *
     */
    Ft: function (type) {
      this.buffer.functionType = type;
    },

    /**
     * Opens a multi parameter function definition
     *
     * In practice initializes the functionArgs array and stores in the
     * buffer the function name provided as argument
     *
     * @argument {string} name of the function
     *
     * @since 0.0.1
     *
     */
    Fo: function (name) {
      this.buffer.functionArgs = [];
      this.buffer.functionName = name;
    },

    /**
     * Stores in the buffer a function argument
     *
     * @since 0.0.1
     *
     */
    Fa: function (arg) {
      this.buffer.functionArgs.push(arg);
    },

    /**
     * Closes the multi parameter funcion definition and prints the
     * result
     *
     * Behind the covers this function only formats the params and then
     * calls .Ft
     *
     * @return {string}
     *
     * @since 0.0.1
     *
     */
    Fc: function () {
      var args = this.buffer.functionArgs.join(', ')
        .replace(/\"/g, ''),
        callParams = this.buffer.functionName + ' "' + args + '"';

      return macros.doc.Fn.call(this, callParams);
    },

    /**
     * Prints the provided text in italics, if its called inside of the
     * SYNOPSIS section it also adds a line break
     *
     * @argument {string}
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Vt: function (args) {
      var base = this.generateTag('i', args),
        postamble = this.isInsideOf('SYNOPSIS') ? '<br>' : '';

      return base + postamble;
    },

    /**
     * Text may be stressed or emphasized with this macro, in practice,
     * the macro prints italic text
     *
     * @argument {string} text to be italized
     *
     * @returns {string}
     *
     * @since 0.0.1
     *
     */
    Em: function (text) {
      return this.generateTag('i', text);
    },
  };

  var HTMLGenerator = function () {};

  HTMLGenerator.prototype.generate = function (source, macroLib) {
    var parser,
      ast;

    if(!source) {
      return '';
    }

    parser = new Parser(source);
    ast = parser.buildAST();

    macroLib = macroLib || 'doc';

    this.macros = mergeObjects([macros.defaults, macros[macroLib]]);
    this.buffer = {
      style: {
        indent: 8
      },
      lists: [],
      section: ''
    };

    return this.generateRecursive(ast);
  };

  HTMLGenerator.prototype.generateRecursive = function (arr) {
    var partial;

    return arr.reduce(function (result, node) {
      if(node.kind === MACRO || node.kind === IMACRO) {

        if(this.buffer.isParagraphOpen && node.value === 'Sh') {
          result += '</p>';
          this.buffer.isParagraphOpen = false;
        }

        var f = this.macros[node.value] || function () {
          console.warn('warn: undefined macro ' + node.value);
          return node.value;
        };

        partial = node.nodes.length ? f.call(this, this.generateRecursive(node.nodes)) : f.call(this, '');

        result += partial || '';

      } else {
        result += node.value;
      }

      return result;

    }.bind(this), '');
  };

  /**
   * Generate valid HTML tags
   *
   * @param {string} name tag name, this can also be a nested tag
   * definition, so 'p>a' is a valid name and denotes a `p` tag
   * wrapping an `a` tag.
   *
   * @param {string} content the content inside the tag
   *
   * @param {object} properties valid HTML properties
   *
   * @returns {string}
   *
   * @alias generateTag
   *
   * @since 0.0.1
   *
   */
  HTMLGenerator.prototype.generateTag = function (name, content, properties) {
    var tags = name.split('>'),
      i = -1,
      openingTags = '',
      closingTags = '';

    while(tags[++i]) {
      openingTags += '<' + tags[i] + '> ';
    }

    while(tags[--i]) {
      closingTags += ' </' + tags[i] + '>';
    }

    return openingTags + content + closingTags;
  };

  /**
   * Given two tags names, this function generates a chunk of HTML
   * with the content splitted between the two tags.
   *
   * This is specially useful for macros like BI, BR, etc.
   *
   * @param {string} firstTag
   *
   * @param {string} secondTag
   *
   * @param {string} content
   *
   * @returns {string}
   *
   * @alias generateAlternTag
   *
   * @since 0.0.1
   *
   */
  HTMLGenerator.prototype.generateAlternTag = function (firstTag, secondTag, content) {
    var i = -1,
      result = '',
      currentTag = secondTag;

    content = this.parseArguments(content);

    while(content[++i]) {
      currentTag = currentTag === firstTag ? secondTag : firstTag;
      result += this.generateTag(currentTag, content[i]);
    }

    return result;
  };

  /**
   * Transform a raw string in an array of arguments, in groff
   * arguments are delimited by spaces and double quotes can
   * be used to specify an argument which contains spaces.
   *
   * @argument {string} args
   *
   * @returns {array}
   *
   * @alias parseArguments
   *
   * @since 0.0.1
   *
   */
  HTMLGenerator.prototype.parseArguments = function (args) {
    args = args.match(patterns.arguments) || [];

    return args.map(function (arg) {
      return arg.replace(/\"|-/g, '');
    });
  };

  HTMLGenerator.prototype.join = function (arr) {
    return Array.prototype.join.call(arr, ' ');
  };

  HTMLGenerator.prototype.isInsideOf = function (section) {
    return this.buffer.section.toLowerCase() === section.toLowerCase();
  };

  return {
    HTMLGenerator: HTMLGenerator,
    Lexer: Lexer,
    Token: Token,
    TokenFactory: TokenFactory,
    macros: macros,
    patterns: patterns,
    Parser: Parser,
    COMMENT: COMMENT,
    MACRO: MACRO,
    IMACRO: IMACRO,
    BREAK: BREAK,
    TEXT: TEXT,
    EMPTY: EMPTY
  };

}));
