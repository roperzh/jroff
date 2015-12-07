macros.defaults = {
  /**
   * Adds a line break
   *
   * @returns {string}
   *
   * @since 0.0.1
   */
  br: function () {
    return '<br>';
  },

  /**
   * Sets the space-character size to N/36 em.
   *
   * @argument {integer} number
   *
   * @since 0.0.1
   *
   */
  ss: function(number) {

  },

  /**
   * Change to font defined by fontType, possible values are R,I,B,S.
   * Behaves in the same way as \fx, \f(xx, \fN
   *
   * @argument {string} fontType
   *
   * @since 0.0.1
   *
   */
  ft: function(fontType) {

  },

  /**
   * Set the vertical spacing of the following paragraphs
   *
   * @argument {string} spacing
   *
   * @since 0.0.1
   *
   */
  vs: function(spacing) {

  },

  /**
   * Set the indent of the following paragraphs
   *
   * @argument {string} indent
   *
   * @since 0.0.1
   *
   */
  in: function(indent) {

  },

  /**
   * Set the scape character to the provided character
   *
   * @argument {string} character
   *
   * @since 0.0.1
   *
   */
  ec: function(character) {

  },

  /**
   * Turn off escape character mechanism
   *
   * @since 0.0.1
   *
   */
  eo: function() {

  },

  /**
   * Italize the next `n` input lines
   *
   * @since 0.0.1
   *
   */
  ul: function(numberOfLines) {

  },

  /**
   * Italize the next `n` input lines
   *
   * @since 0.0.1
   *
   */
  cu: function(numberOfLines) {

  },

  /**
   * \ prevents or delays the interpretation of \
   *
   */
  '\\': function() {

  },

  /**
   * Printable version of the current escape character.
   *
   */
  '\e': function() {

  },

  /**
   * ´ (acute accent); equivalent to \(aa
   *
   */
  '\’': function() {

  },

  /**
   * ` (grave accent); equivalent to \(ga
   *
   */
  '\‘': function() {

  },

  /**
   * - Minus sign in the current font
   *
   */
  '\-': function() {

  },

  /**
   * Period (dot) (see de)
   *
   */
  '\.': function() {

  },

  /**
   * Unpaddable space-size space character
   *
   */
  '\space': function() {

  },

  /**
   * Digit width space
   *
   */
  '\0': function() {

  },

  /**
   * 1/6 em narrow space character (zero width in nroff)
   *
   */
  '\|': function() {

  },

  /**
   * 1/12 em half-narrow space character (zero width in nroff)
   */
  '\^': function() {

  },

  /**
   * Non-printing, zero width character
   *
   */
  '\&': function() {

  },

  /**
   * Transparent line indicator
   *
   */
  '\!': function() {

  },

  /**
   * Beginning of comment; continues to end of line
   *
   */
  '\"': function() {

  },

  /**
   * Default optional hyphenation character
   *
   */
  '\%': function() {

  },

  /**
   * Character named xx
   *
   */
   '\(xx': function() {

   },

   /**
    * Non-interpreted leader character
    *
    */
   '\a': function() {

   },

   /**
    * \fN Change to font named x or xx, or position N
    *
    */
   '\f': function() {

   },

   /**
    * Non-interpreted horizontal tab
    *
    */
   '\t': function() {

   },

   /**
    * \w’string’ Width of string
    *
    */
   '\w': function() {

   }
};
