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
