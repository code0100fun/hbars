var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var concat = require('broccoli-concat');
var AMDFormatter = require('es6-module-transpiler-amd-formatter');
var compileModules = require('broccoli-compile-modules');
var compileModulesCJS = require('broccoli-es6-module-transpiler');
var peg = require('broccoli-pegjs');
var cjsWrap = require('broccoli-cjs-wrap');
var wrapFiles = require('broccoli-wrap');
var removeFile = require('broccoli-file-remover');

var bower = 'bower_components';
var npm = 'node_modules';

var loader = pickFiles(bower, {
  srcDir: '/loader',
  files: [ 'loader.js' ],
  destDir: '/tests'
});

var chai = pickFiles(npm, {
  srcDir: '/chai',
  files: [ 'chai.js' ],
  destDir: '/tests'
});

var libTreeES6 = pickFiles('lib', {
  srcDir: '/',
  files: ['*.js'],
  destDir: '/'
});

var pegFiles = pickFiles('lib', {
  srcDir: '/',
  files: ['*.pegjs'],
  destDir: '/'
});

var pegFilesCJS = peg(pegFiles);

var parserCJS = pickFiles(pegFilesCJS, {
  srcDir: '/',
  files: ['parser.js'],
  destDir: '/'
});

var preprocessorCJS = pickFiles(pegFilesCJS, {
  srcDir: '/',
  files: ['preprocessor.js'],
  destDir: '/'
});

parser = wrapFiles(parserCJS, {
  wrapper: ["define('parser', function(require, exports, module){\n", "});"]
});

preprocessor = wrapFiles(preprocessorCJS, {
  wrapper: ["define('preprocessor', function(require, exports, module){\n", "});"]
});

var pegFilesAMD = mergeTrees([parser, preprocessor]);

var libTreeAMD = compileModules(libTreeES6, {
  inputFiles: ['**/*.js'],
  output: '/',
  formatter: new AMDFormatter()
});

libTreeAMD = removeFile(libTreeAMD, {
  files: ['parser.js', 'preprocessor.js']
});

libTreeAMD = concat(mergeTrees([libTreeAMD, pegFilesAMD]), {
  inputFiles: ['**/*.js'],
  outputFile: '/hbars.amd.js'
});

var testIndex = pickFiles('tests', {
  srcDir: '/',
  files: ['index.html'],
  destDir: '/tests/'
});

var testsTreeES6 = pickFiles('tests', {
  srcDir: '/',
  files: [ '**/*test.js' ],
  destDir: '/tests'
});

var libTreeTestES6 = pickFiles(libTreeES6, {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/'
});

libTreeTestES6 = mergeTrees([libTreeTestES6, testsTreeES6]);

var testsTreeCJS = compileModulesCJS(libTreeTestES6, {
  formatter: 'commonjs'
});

testsTreeCJS = removeFile(testsTreeCJS, {
  files: ['parser.js', 'preprocessor.js']
});

var setupCJS = pickFiles('tests', {
  srcDir: '/',
  files: [ 'setup_cjs.js' ],
  destDir: '/tests'
});

testsTreeCJS = mergeTrees([testsTreeCJS, pegFilesCJS, setupCJS]);

var libTreeTestCJS = pickFiles(testsTreeCJS, {
  srcDir: '/',
  files: ['*.js'],
  destDir: '/tests'
});

var testsTreeCJS = pickFiles(testsTreeCJS, {
  srcDir: '/tests',
  files: ['*.js'],
  destDir: '/tests'
});

testsTreeCJS = mergeTrees([testsTreeCJS, libTreeTestCJS]);

var testsTreeAMD = compileModules(mergeTrees([libTreeES6, testsTreeES6]), {
  inputFiles: ['**/*.js'],
  output: '/',
  formatter: new AMDFormatter()
});

testsTreeAMD = removeFile(testsTreeAMD, {
  files: ['parser.js', 'preprocessor.js']
});

testsTreeAMD = concat(mergeTrees([chai, testsTreeAMD, pegFilesAMD]), {
  inputFiles: ['**/*.js'],
  outputFile: '/tests/hbars-tests.amd.js'
});

var trees = [ loader, testIndex, testsTreeAMD, libTreeAMD, testsTreeCJS ];
module.exports = mergeTrees(trees);
