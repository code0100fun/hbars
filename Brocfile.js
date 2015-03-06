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

var libTreeAMD = compileModules(libTreeES6, {
  modules: 'amd',
  moduleIds: true
});

var loader = pickFiles(bower, {
  srcDir: '/loader',
  files: [ 'loader.js' ],
  destDir: testDir
});

var outputCJS = compileModules(libTreeES6, {
  modules: 'common',
  resolveModuleSource: function(path) {
    return path.replace(new RegExp('^' + name),'.');
  }
});

var outputMainAMD = concat(libTreeAMD, {
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

var testSetupCJS = compileModules(testSetupES6, {
  modules: 'common',
});

var testsTreeES6 = pickFiles('.' + testDir, {
  srcDir: '/',
  files: ['**/*' + testPostfix + '.js'],
  destDir: testDir
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
  srcDir: '/' + name,
  files: ['**/*'],
  destDir: testDir
});

var jshintTests = jshint(testsTreeES6, {
  testGenerator: jshintMocha
});

var webTests = concat(mergeTrees([jshintTests, jshintLib, testsTreeCJS]), {
  inputFiles: ['**/*' + testPostfix + '.js', '**/*jshint.js'],
  outputFile: testDir + '/' + name + '-' + testsPostfix + '.js'
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
