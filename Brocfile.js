var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var concat = require('broccoli-concat');
var compileModules = require('broccoli-babel-transpiler');
var peg = require('broccoli-pegjs');
var jshint = require('broccoli-jshint');

var bower = 'bower_components';

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
  destDir: '/hbars'
});

var libTreeAMD = compileModules(libTreeES6, {
  modules: 'amd',
  moduleIds: true
});

var loader = pickFiles(bower, {
  srcDir: '/loader',
  files: [ 'loader.js' ],
  destDir: '/tests'
});

var outputCJS = compileModules(libTreeES6, {
  modules: 'common',
  resolveModuleSource: function(path) {
    return path.replace(new RegExp('^hbars'),'.');
  }
});

var outputMainAMD = concat(libTreeAMD, {
  inputFiles: [ '**/*.js' ],
  outputFile: '/hbars.js'
});

var testIndex = pickFiles('tests', {
  srcDir: '/',
  files: ['index.html'],
  destDir: '/tests/'
});

var testSetupES6 = pickFiles('tests/support', {
  srcDir: '/',
  files: [ 'setup.js'],
  destDir: '/tests/support'
});

var testSetupCJS = compileModules(testSetupES6, {
  modules: 'common',
});

var testsTreeES6 = pickFiles('tests', {
  srcDir: '/',
  files: ['**/*test.js'],
  destDir: '/tests'
});

var testsCJS = compileModules(testsTreeES6, {
  modules: 'common',
  resolveModuleSource: function(path) {
    return './../' + path;
  }
});

var testsTreeCJS = compileModules(testsTreeES6, {
  modules: 'common'
});

var jshintMocha = function(relativePath, passed, errors) {
  return "describe('jshint " + relativePath + "', function(){" +
  "it('" + relativePath + " should pass jshint', function() {\n" +
  "  assert.ok(" + passed + ", \"" + this.escapeErrorString(errors) + "\");\n" +
  "});\n});";
}

var jshintLib = jshint(libTreeES6, {
  testGenerator: jshintMocha
});

jshintLib = pickFiles(jshintLib, {
  srcDir: '/hbars',
  files: ['**/*'],
  destDir: '/tests'
});

var jshintTests = jshint(testsTreeES6, {
  testGenerator: jshintMocha
});

var webTests = concat(mergeTrees([jshintTests, jshintLib, testsTreeCJS]), {
  inputFiles: ['**/*test.js', '**/*jshint.js'],
  outputFile: '/tests/hbars-tests.js'
});

module.exports = mergeTrees([
  outputMainAMD,
  loader,
  testIndex,
  testsCJS,
  testSetupCJS,
  outputCJS,
  webTests,
  jshintLib,
  jshintTests,
]);
