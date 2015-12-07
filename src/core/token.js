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
 * Class method used to know wheter a string represents a escape sequence
 *
 * @param {string} str
 *
 * @returns {boolean}
 *
 * @since 0.0.1
 *
 */
Token.isEscape = function(str) {
  return patterns.escape.test(str);
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
