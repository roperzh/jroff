var Jroff = require('../dist/jroff'),
  path = require('path'),
  assert = require("assert"),
  fs = require('fs'),
  pretty = require('pretty');

/** Helpers */
var clean = function (str) {
  return pretty(str.replace(/(\r\n|\n|\r|\s)/gm, ''));
};

var runTest = function (message, parsed, html) {
  it(message, function () {
    assert.deepEqual(clean(html), clean(parsed));
  });
};

/** Macros */
var generator = new Jroff.HTMLGenerator(),
  glob = require("glob"),
  files = glob.sync('test/**/*.html'),
  comment = /(<!--[\s\S]*?-->)/,
  removeComment = /<!--|-->/g,
  testDirective = /@it (.*)\n/;

files.forEach(function (f) {
  describe(f, function () {
    var fileContents = fs.readFileSync(path.join(f), "utf8")
      .split(comment),
      extension = f.indexOf('doc') !== -1 ? 'doc' : 'an';

    for(var i = 1; i < fileContents.length; i += 2) {
      var directives = fileContents[i].replace(removeComment, '')
        .trim()
        .split(testDirective),
        html = fileContents[i + 1],
        message = directives[1],
        rawMan = directives[2],
        parsed = generator.generate(rawMan, extension);

      runTest(message, html, parsed);
    }
  });
});

/** Assertions */
require('./assertions/patterns_test.js');
require('./assertions/token_test.js');
require('./assertions/token_factory_test.js');
require('./assertions/lexer_test.js');
require('./assertions/doc_macros_test.js');
require('./assertions/an_macros_test.js');
require('./assertions/html_generator_test.js');
