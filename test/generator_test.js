var Generator = require('../lib/generator');

describe('generator', function () {
  it('creates a tag', function () {
    var ast = [{ type: "element", tag: "p" }];
    var template = Generator.generate(ast);
    expect(template).to.equal('<p></p>');
  });

  it('creates multiple tags', function () {
    var ast = [
      { type: "element", tag: "p" },
      { type: "element", tag: "p" }
    ];
    var template = Generator.generate(ast);
    expect(template).to.equal('<p></p>\n<p></p>');
  });

  it('adds id attribute to tag', function () {
    var ast = [
      { type: "element", tag: "p", id: "foo" },
    ];
    var template = Generator.generate(ast);
    expect(template).to.equal('<p id="foo"></p>');
  });

  it('adds single class attribute to tag', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        attributes: {
          class: "foo"
        }
      },
    ];
    var template = Generator.generate(ast);
    expect(template).to.equal('<p class="foo"></p>');
  });

  it('adds multiple classes to tag', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        attributes: {
          class: ["foo", "bar"]
        }
      },
    ];
    var template = Generator.generate(ast);
    expect(template).to.equal('<p class="foo bar"></p>');
  });

  it('adds id and multiple classes to multiple tags', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        id: "paragraph",
        attributes: {
          class: ["foo", "bar"]
        }
      },
      {
        type: "element",
        tag: "a",
        id: "link",
        attributes: {
          class: ["baz", "qux"]
        }
      },
    ];
    var template = Generator.generate(ast);
    expect(template).to.equal('<p id="paragraph" class="foo bar"></p>\n<a id="link" class="baz qux"></a>');
  });
});
