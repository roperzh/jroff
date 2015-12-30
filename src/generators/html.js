var HTMLGenerator = function () {};

HTMLGenerator.prototype.generate = function (source, macroLib) {
  var parser,
    ast;

  if(!source) {
    return '';
  }

  parser = new Parser(source);
  ast = parser.buildAST();
  lib = lib || 'doc';

  this.macros = mergeObjects([macros.defaults, macros[lib]]);
  macroLib = lib;

  this.buffer = {
    style: {
      indent: 8,
      fontSize: 16
    },
    references: [],
    lists: [],
    openTags: [],
    fontModes: [],
    section: ''
  };

  return this.generateRecursive(ast);
};

HTMLGenerator.prototype.generateRecursive = function (arr) {
  var partial;

  return arr.reduce(function (result, node) {
    if(node.kind === MACRO || node.kind === IMACRO || node.kind === ESCAPE) {

      if(node.value === 'Sh' || node.value === 'SH') {
        result += this.closeAllTags(this.buffer.fontModes);
        result += this.closeAllTags(this.buffer.openTags);
      }

      var f = this.macros[node.value] || function () {
        return node.value;
      };

      partial = node.nodes.length ? f.call(this, this.generateRecursive(node.nodes)) : f.call(this, '');

      result += partial || '';

    } else {
      result += this.cleanQuotes(node.value);
    }

    return result;

  }.bind(this), '');
};

/**
 * Remove wrapping double quotes from a string
 *
 * @param {string} str
 *
 * @returns {string} the given argument without wrapping quotes
 *
 * @example
 * cleanQuotes('"Lorem Ipsum"'); //-> 'Lorem Ipsum'
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.cleanQuotes = function(str) {
  return str.replace(patterns.wrappingQuotes, '$1');
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
HTMLGenerator.prototype.generateTag = function (name, content) {
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
 * Create HTML markup to close a specific tag
 *
 * @argument {string} tag name of the tag
 *
 * @returns {string}
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.closeTag = function (tag) {
  return '</' + tag + '>';
};

/**
 * Create HTML markup to close a list of tags
 *
 * @argument {array} tags
 *
 * @returns {string}
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.closeAllTags = function (tags) {
  var result = '',
    tag;

  while((tag = tags.shift())) {
    result += this.closeTag(tag);
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
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.parseArguments = function (args) {
  args = args.match(patterns.arguments) || [];

  return args.map(function (arg) {
    return this.cleanQuotes(arg);
  }.bind(this));
};

/**
 * Shortcut to join an array using whitespaces
 *
 * @argument {array} arr
 *
 * @returns {string}
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.join = function (arr) {
  return Array.prototype.join.call(arr, ' ');
};

/**
 * Useful for macros that require specific behavior inside of a section
 *
 * @argument {string} section name
 *
 * @returns {boolean} wether the value of this.buffer.section is equal to
 * the argument
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.isInsideOfSection = function (section) {
  return this.buffer.section.toLowerCase() === section.toLowerCase();
};
