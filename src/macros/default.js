var fontMappings = {
  B: 'strong',
  R: 'span',
  I: 'i',
  S: 'small'
};

/**
 * Group all defautl groff macros
 * @namespace
 * @alias macros.defaults
 * @since 0.0.1
 */
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
  ss: function (number) {
    this.buffer.openTags.push('span');

    return '<span style="word-spacing:' + (number / 36) + 'em;">';
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
  ft: function (fontType) {
    var result = '',
      type;

    /* the font type can be a string with multiple arguments */
    fontType = this.parseArguments(fontType)[0];
    type = fontMappings[fontType.trim()];

    result += this.closeAllTags(this.buffer.fontModes);

    if(type !== fontMappings.R) {
      result += '<' + type + '> ';
      this.buffer.fontModes.push(type);
    }

    return result;
  },

  /**
   * Set the vertical spacing of the following paragraphs
   *
   * @argument {string} spacing
   *
   * @since 0.0.1
   *
   */
  vs: function (spacing) {
    spacing = spacing || 12;

    this.buffer.openTags.push('section');

    return '<section style="line-height:' + (spacing / 12) + 'em;">';
  },

  /**
   * No filling or adjusting of output lines.
   *
   * This macro is useless in the context of the current
   * implementation, it only produces a line break (similar to the
   * default groff output)
   *
   * @since 0.0.1
   *
   */
  nf: function () {
    return '<br>';
  },

  /**
   * Set the indent of the following paragraphs
   *
   * @argument {string} indent
   *
   * @since 0.0.1
   *
   */
  in : function (indent) {
    indent = indent || 3;

    this.buffer.openTags.push('section');

    return '<section style="margin-left:' + (indent / 3) + 'em;">';
  },

  /**
   * Italize the next `n` input lines
   *
   * In this implementation, the macro starts the italic mode, without
   * taking in consideration the number of lines provided.
   *
   * @since 0.0.1
   *
   */
  ul: function () {
    return macros.defaults.ft.call(this, 'I');
  },

  /**
   * Italize the next `n` input lines
   *
   * In this implementation, the macro starts the italic mode, without
   * taking in consideration the number of lines provided.
   *
   * @since 0.0.1
   *
   */
  cu: function () {
    return macros.defaults.ft.call(this, 'I');
  },

  /**
   * Space vertically in either direction.
   *
   * If `spacing` is negative, the motion is backward (upward) and is
   * limited to the distance to the top of the page
   *
   * If the no-space mode is on, no spacing occurs (see ns and rs)
   *
   * @argument {string} spacing
   *
   * @since 0.0.1
   *
   */
  sp: function (spacing) {
    spacing = spacing || '2';

    return '<hr style="margin-top:' + spacing + 'em;visibility:hidden;">';
  },

  /**
   * Used to manage conditionals, not supported in the current version
   *
   * @since 0.0.1
   *
   */
  'if': function () {
    return '';
  },

  /**
   * Used to manage conditionals, not supported in the current version
   *
   * @since 0.0.1
   *
   */
  ie: function () {
    return '';
  },

  /**
   * Used to manage conditionals, not supported in the current version
   *
   * @since 0.0.1
   *
   */
  el: function () {
    return '';
  },

  /**
   * Used to manage conditionals, not supported in the current version
   *
   * @since 0.0.1
   *
   */
  '\\}': function () {
    return '';
  },

  /**
   * Used to define new macros, not supported in the current version
   *
   * @since 0.0.1
   *
   */
  de: function () {
    return '';
  },

  /**
   * Need `number` vertical space, not supported in the current version
   *
   * @since 0.0.1
   *
   */
  ne: function () {
    return '';
  },

  /**
   * Custom pattern present in some man pages, does not produce any
   * output
   *
   * @since 0.0.1
   *
   */
  '.': function () {
    return '';
  },

  /**
   * Fill output lines, does not apply for the current implementation
   *
   * @since 0.0.1
   *
   */
  fi: function () {
    return '';
  },

  /**
   * Disable hyphenation
   *
   * @since 0.0.1
   *
   */
  nh: function () {
    /* TODO: apply this property somewhere */
    this.buffer.style.hyphens = 'none';
  },

  /**
   * Adjust output lines with mode c; where c = l, r, c, b,none
   *
   * @since 0.0.1
   */
  ad: function (align) {
    /* TODO: apply this property somewhere */
    this.buffer.style.textAlign = align;
  },

  /**
   * Prevents or delays the interpretation of \, in this implementation
   * behaves exactly like `\e`
   *
   * @returns {string}
   *
   * @since 0.0.1
   *
   */
  '\\\\': function () {
    return macros.defaults['\\e'].call(this);
  },

  /**
   * Print the escape character
   *
   * @returns {string}
   *
   * @since 0.0.1
   *
   */
  '\\e': function () {
    return '\\ ';
  },

  /**
   * Print the minus sign (-) in the current font
   *
   * @returns {string}
   *
   * @since 0.0.1
   *
   */
  '\\-': function () {
    return '&minus;';
  },

  /**
   * \fx Change to font named x, works as a shorthand of .ft
   *
   * @argument {string} args the word next to the escape sequence, due to the
   * current parser structure we must split the font type argument of the
   * escape secuence here.
   *
   * @returns {string}
   *
   * @since 0.0.1
   */
  '\\f': function (args) {
    var fontType;

    args = args.trim();
    fontType = args.charAt(0);

    return macros.defaults.ft.call(this, fontType) + ' ' + args.slice(1);
  },

  /**
   * According to the roff spec, this sequence is used as a
   * "non-printing, zero width character", but for the purposes of this
   * implementation we can just ignore this behavior.
   *
   * @returns {string}
   *
   * @since 0.0.1
   *
   */
  '\\&': function () {
    return '';
  },

  /**
   * Increase or decrease the font size by `n` units, negative values are
   * accepted.
   *
   * @argument {string} args the word next to the escape sequence, due to the
   * current parser structure we need to do extra work here to parse the
   * arguments
   *
   * @returns {string}
   *
   * @since 0.0.1
   *
   */
  '\\s': function (args) {
    var txt;

    args = args.split(patterns.realNumber);
    txt = args[2] || '';

    this.buffer.style.fontSize += parseInt(args[1], 10);
    this.buffer.openTags.push('span');

    return(
      '<span style="font-size:' + this.buffer.style.fontSize + 'px;">' + txt
    );
  },

  /**
   * For the purposes of this implementation we can just ignore this sequence.
   *
   * @returns {string}
   *
   * @since 0.0.1
   +
   */
  '\\m': function () {
    return '';
  },

  /**
   * For the purposes of this implementation we can just ignore this sequence.
   *
   * @returns {string}
   *
   * @since 0.0.1
   +
   */
  '\\(': function () {
    return '';
  },

  /**
   * For the purposes of this implementation we can just ignore this sequence.
   *
   * @returns {string}
   *
   * @since 0.0.1
   +
   */
  '\\d': function () {
    return '';
  },

  /**
   * For the purposes of this implementation we can just ignore this sequence.
   *
   * @returns {string}
   *
   * @since 0.0.1
   +
   */
  '\\u': function () {
    return '';
  },

  '\\+': function () {
    return '&plus;';
  }
};
