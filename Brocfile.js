var pkg = require('./package.json');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var concat = require('broccoli-concat');
var compileModules = require('broccoli-babel-transpiler');
var peg = require('broccoli-pegjs');
var jshint = require('broccoli-jshint');

var bower = 'bower_components';
var testDir = '/tests';
var testPostfix = 'test';
var testsPostfix = 'tests';

var name = pkg.name;

var pegFiles = pickFiles('lib', {
  srcDir: '/',
  files: ['*.pegjs'],
  destDir: '/'
});

var pegFilesES6 = peg(pegFiles, {
  wrapper: function(src, parser) {
    return '/*jshint ignore: start*/\nexport default ' +
      parser + '\n/*jshint ignore: end*/';
  }
});

var libTreeES6 = pickFiles(mergeTrees(['lib', pegFilesES6]), {
  srcDir: '/',
  files: ['*.js'],
  destDir: '/' + name
});

var libTreeUMD = compileModules(libTreeES6, {
  modules: 'umd',
  moduleIds: true
});

var loader = pickFiles(bower, {
  srcDir: '/loader',
  files: [ 'loader.js' ],
  destDir: testDir
});

var outputUMD = compileModules(libTreeES6, {
  modules: 'umd',
  moduleIds: true,
  resolveModuleSource: function(path) {
    return path.replace(new RegExp('^' + name),'.');
  }
});

var outputConcatUMD = concat(libTreeUMD, {
  inputFiles: [ '**/*.js' ],
  outputFile: '/' + name + '.js'
});

var testIndex = pickFiles('.' + testDir, {
  srcDir: '/',
  files: ['index.html'],
  destDir: testDir
});

var testSetupES6 = pickFiles('.' + testDir + '/support', {
  srcDir: '/',
  files: [ 'setup.js'],
  destDir: testDir + '/support'
});

var testSetupUMD = compileModules(testSetupES6, {
  modules: 'umd',
  moduleIds: true
});

var testsTreeES6 = pickFiles('.' + testDir, {
  srcDir: '/',
  files: ['**/*' + testPostfix + '.js'],
  destDir: testDir
});

var testsTreeUMD = compileModules(testsTreeES6, {
  modules: 'umd',
  moduleIds: true,
  resolveModuleSource: function(path) {
    return './../' + path;
  }
});

var jshintMocha = function(relativePath, passed, errors) {
  return "describe('jshint " + relativePath + "', function(){" +
  "it('" + relativePath + " should pass jshint', function() {\n" +
  "  assert.ok(" + passed + ", \"" + this.escapeErrorString(errors) + "\");\n" +
  "});\n});";
}

var jshintLibES6 = jshint(libTreeES6, {
  testGenerator: jshintMocha
});

jshintLibES6 = pickFiles(jshintLibES6, {
  srcDir: '/' + name,
  files: ['**/*'],
  destDir: testDir
});

var jshintTestsES6 = jshint(testsTreeES6, {
  testGenerator: jshintMocha
});

var jshintTreeUMD = compileModules(mergeTrees([jshintTestsES6, jshintLibES6]), {
  modules: 'umd',
  moduleIds: true
});

var webTests = concat(mergeTrees([testsTreeUMD, jshintTreeUMD]), {
  inputFiles: ['**/*' + testPostfix + '.js', '**/*jshint.js'],
  outputFile: testDir + '/' + name + '-' + testsPostfix + '.js'
});

module.exports = mergeTrees([
  loader,
  outputConcatUMD,
  outputUMD,
  testIndex,
  testSetupUMD,
  webTests,
  testsTreeUMD,
  jshintTreeUMD
]);
