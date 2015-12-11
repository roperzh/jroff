var Benchmark = require('benchmark'),
  suite = new Benchmark.Suite,
  Jroff = require('../dist/jroff'),
  path = require('path'),
  fs = require('fs'),
  results = require('./benchmark.json'),
  gitContent = getFileContents('git.an'),
  nodeContent = getFileContents('git.an'),
  rubyContent = getFileContents('ruby.doc'),
  partialResults = {
    cases: []
  };

suite.add('Git', function() {
  var generator = new Jroff.HTMLGenerator();
  generator.generate(gitContent, 'an');
})
.add('Node.js', function() {
  var generator = new Jroff.HTMLGenerator();
  generator.generate(nodeContent, 'an');
})
.add('Ruby', function() {
  var generator = new Jroff.HTMLGenerator();
  generator.generate(rubyContent, 'doc');
})
.on('cycle', function(event) {
  var target = event.target,
    rawOldTarget = results[results.length - 1].cases[target.id - 1],
    oldTarget = new Benchmark(rawOldTarget);

  console.log('======= ' + target.name + ' =======\n')
  console.log('Old: ', String(oldTarget));
  console.log('\n');
  console.log('New: ', String(target));
  console.log('\n\n');

  partialResults.cases.push(target);
})
.on('complete', function() {
  if (process.argv[2] === '-s') {
    console.log('Saving data');
    partialResults.date = new Date();
    results.push(partialResults);

    fs.writeFileSync('./benchmarks/benchmark.json', JSON.stringify(results));
  };
})
.on('error', function(e) {
  console.log(e)
})
.run();

function getFileContents(file) {
  return fs.readFileSync(path.join(__dirname, 'cases/' + file), 'utf8');
}
