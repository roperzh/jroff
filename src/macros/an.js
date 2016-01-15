/**
 * Group all `an` macros
 * @namespace
 * @alias macros.an
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
    var openingTag = '<section style="margin-left:' +
      this.buffer.style.indent + '%;">',
      preamble = '';

    this.buffer.section = args;

    preamble += this.closeAllTags(this.buffer.fontModes);
    preamble += this.closeAllTags(this.buffer.openTags);
    preamble += this.closeAllTags(this.buffer.sectionTags);

    this.buffer.sectionTags.push('section');

    return preamble + this.generateTag('h2', args) + openingTag;
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
  P: function () {
    var result = '';

    result += this.closeAllTags(this.buffer.fontModes);
    result += this.closeTagsUntil('div', this.buffer.openTags);

    this.buffer.openTags.push('div');

    return result + '<div style="margin-bottom: 2%;">';
  },

  /**
   * Start relative margin indent: moves the left margin `indent` to
   * the right (if is omitted, the prevailing indent value is used).
   *
   * @param {string} indent
   *
   * @since 0.0.1
   *
   */
  RS: function (indent) {
    var result = '';

    indent = indent || this.buffer.style.indent;

    result += this.closeAllTags(this.buffer.fontModes);
    result += '<section style="margin-left:' + indent + '%">';

    this.buffer.openTags.push('section');

    return result;
  },

  /**
   * End relative margin indent and restores the previous value
   * of the prevailing indent.
   *
   * @since 0.0.1
   *
   */
  RE: function () {
    return this.closeTagsUntil('section', this.buffer.openTags);
  }
};

macros.an.LP = macros.an.P;
macros.an.PP = macros.an.P;
