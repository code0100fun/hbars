var Compiler = require('../lib/compiler');

describe('compiler', function () {
  it('compiles tags with classes and ids', function () {
    var template = Compiler.compile('%p#paragraph.foo.bar\n%a#link.baz.qux');
    expect(template).to.equal('<p id="paragraph" class="foo bar"></p>\n<a id="link" class="baz qux"></a>');
  });

  it('compiles nested tags', function () {
    var template = Compiler.compile('%p\n  %a');
    expect(template).to.equal('<p>\n  <a></a>\n</p>');
  });
});
