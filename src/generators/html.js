var HTMLGenerator = function () {};

HTMLGenerator.prototype.generate = function (source, lib) {
  var parser,
    ast;

  if(!source) {
    return '';
  }

  parser = new Parser(source);
  ast = parser.buildAST();
  lib = lib || 'doc';

  this.macros = mergeObjects([macros.defaults, macros[lib]]);

  /* Global variable, used to define if a token is imacro */
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
    sectionTags: [],
    activeFontModes: [],
    section: ''
  };

  return this.recurse(ast);
};

/**
 * Fires the recursive generation of the HTML based on the
 * AST hierarchy, uses the native reduce function
 *
 * @param {array} arr of tokens
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.recurse = function (arr) {
  return arr.reduce(this.reduceRecursive.bind(this), '');
};

/**
 * Meant to be used as an auxiliar function for the reduce call
 * in 'this.recurse'
 *
 * @param {string} result
 *
 * @param {token} node
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.reduceRecursive = function (result, node) {
  var tokensWithNodes = [MACRO, IMACRO, ESCAPE],
    func,
    args;

  if(tokensWithNodes.indexOf(node.kind) !== -1) {
    if(node.value === 'Sh' || node.value === 'SH') {
      result += this.closeAllTags(this.buffer.fontModes);
      result += this.closeAllTags(this.buffer.openTags);
    }

    func = this.macros[node.value] || this.undefMacro;
    args = node.nodes.length ? this.recurse(node.nodes) : '';
    result += func.call(this, args, node) || '';
  } else {
    result += this.cleanQuotes(node.value);
  }

  return result;
};

/**
 * Fallback function for undefined macros
 *
 * @param {string} args
 *
 * @param {token} node
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.undefMacro = function (args, node) {
  console.warn('Unsupported macro:', node.value);
  return args;
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
HTMLGenerator.prototype.cleanQuotes = function (str) {
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
  return this.closeTagsUntil(tags[0], tags);
};

/**
 * Create HTML markup to close a list of tags until a given tag is
 * reached
 *
 * @argument {string} limitTag to be reached, if empty it closes all
 *
 * @argument {array} tags
 *
 * @returns {string}
 *
 * @since 0.0.1
 *
 */
HTMLGenerator.prototype.closeTagsUntil = function (limitTag, tags) {
  var result = '',
    tag;

  if(tags.indexOf(limitTag) !== -1) {
    while((tag = tags.pop())) {
      result += this.closeTag(tag);

      if(tag === limitTag) {
        break;
      }
    }
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
    return this.cleanQuotes(arg)
      .trim();
  }.bind(this));
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
