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
    return arg.replace(/\"|-/g, '');
  });
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
