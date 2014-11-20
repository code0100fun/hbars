var Parser = require('../lib/parser');

describe('parser', function () {
  it('parses tags', function () {
    var ast = Parser.parse('%p');
    expect(ast).to.deep.equal([{ type: "element", tag: "p" }]);
  });

  it('parses classes on elements', function () {
    var ast = Parser.parse('%p.foo.bar');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "p",
        attributes: {
          class : ['foo', 'bar']
        }
      }
    ]);
  });

  it('parses id on element', function () {
    var ast = Parser.parse('%p#baz');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "p",
        attributes: {
          id : 'baz'
        }
      }
    ]);
  });

  it('parses id and classes on element', function () {
    var ast = Parser.parse('%p.foo#baz.bar');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "p",
        attributes: {
          id : 'baz',
          class : ['foo', 'bar']
        }
      }
    ]);
  });

  it('defaults element to div if no tag is givin', function () {
    var ast = Parser.parse('.foo#baz.bar');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "div",
        attributes: {
          id : 'baz',
          class : ['foo', 'bar']
        }
      }
    ]);
  });

  it('multiple elements', function () {
    var ast = Parser.parse('.foo\n.bar\n%a.baz');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "div",
        attributes: {
          class : 'foo'
        },
      },
      {
        type: "element",
        tag: "div",
        attributes: {
          class : 'bar'
        },
      },
      {
        type: "element",
        tag: "a",
        attributes: {
          class : 'baz'
        }
      }
    ]);
  });
});
