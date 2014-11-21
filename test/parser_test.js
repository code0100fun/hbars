var Preprocessor = require('../lib/preprocessor');
var Parser = require('../lib/parser');

function parse(haml) {
  return Parser.parse(Preprocessor.parse(haml));
}

describe('parser', function () {
  it('parses tags', function () {
    var ast = parse('%p');
    expect(ast).to.deep.equal([{ type: "element", tag: "p" }]);
  });

  it('parses classes on elements', function () {
    var ast = parse('%p.foo.bar');
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
    var ast = parse('%p#baz');
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
    var ast = parse('%p.foo#baz.bar');
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
    var ast = parse('.foo#baz.bar');
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
    var ast = parse('.foo\n.bar\n%a.baz');
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

  it('nested element', function () {
    var ast = parse('.foo\n\t.bar');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "div",
        attributes: {
          class : 'foo'
        },
        nodes: [
          {
            type: "element",
            tag: "div",
            attributes: {
              class : 'bar'
            }
          },
        ]
      }
    ]);
  });

  it('block helpers', function () {
    var ast = parse('.foo\n\t- each things\n\t\t.qux');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "div",
        attributes: {
          class : 'foo'
        },
        nodes: [
          {
            type: "helper",
            name: "each",
            content: "things",
            nodes: [
              {
                type: "element",
                tag: "div",
                attributes: {
                  class : 'qux'
                }
              }
            ]
          },
        ]
      }
    ]);
  });


});
