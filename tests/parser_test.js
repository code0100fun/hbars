import { parse as preprocess } from '../preprocessor';
import { parse as parser } from '../parser';

var options = {};

function parse(haml) {
  try {
    var preprocessed = preprocess(haml, options);
    return parser(preprocessed, options);
  }catch(e){
   return e.message;
  }
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

  it('defaults element to div if no tag is given', function () {
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

  it('block expressions', function () {
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
            type: "block_expression",
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

  it('mustache expression', function () {
    var ast = parse('%p\n\t= name');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "p",
        nodes: [
          {
            type: "expression",
            content: "name",
          }
        ]
      }
    ]);
  });

  it('if/else', function () {
    var ast = parse('- if foo\n  %p\n- else\n  %div');
    expect(ast).to.deep.equal([
      {
        type: "block_expression",
        name: "if",
        content: "foo",
        nodes: [
          {
            type: "element",
            tag: "p"
          },
          {
            type: "mid_block_expression",
            name: "else"
          },
          {
            type: "element",
            tag: "div"
          }
        ]
      },
    ]);
  });

  describe('attributes', function() {

    it('static attributes', function () {
      var ast = parse("%p( name=\"foo\" style=\"bar\" )");
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          attributes: {
            name : '"foo"',
            style: '"bar"'
          }
        }
      ]);
    });

    it('bind-attr', function () {
      var ast = parse("%p{ name=foo style='bar' }");
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          attributeBindings: {
            name : 'foo',
            style: '\'bar\''
          }
        }
      ]);
    });

  });

  describe('plain text', function(){

    it('nested', function() {
      var ast = parse("%p\n  some plain text 1234567890 !@#$%^&*()_+-={}[]|;:'?/>.<,");
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          nodes: [
            {
              type: "text",
              content: "some plain text 1234567890 !@#$%^&*()_+-={}[]|;:'?/>.<,"
            }
          ]
        }
      ]);
    });

    it('inline', function() {
      var ast = parse("%p some plain text 1234567890 !@#$%^&*()_+-={}[]|;:'?/>.<,");
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          content: "some plain text 1234567890 !@#$%^&*()_+-={}[]|;:'?/>.<,"
        }
      ]);
    });

    describe('interpolation', function() {

      it('inline beginning', function() {
        var ast = parse("%p #{foo} {bar} #{baz} #{qux}");
        expect(ast).to.deep.equal([
          {
            type: "element",
            tag: "p",
            content: [
              { type: 'expression', content: 'foo' },
              ' {bar} ',
              { type: 'expression', content: 'baz' },
              ' ',
              { type: 'expression', content: 'qux' }
            ]
          }
        ]);
      });

      // it('nested beginning', function() {
      //   var ast = parse("%p\n  #{foo} {bar} #{baz} #{qux}");
      //   expect(ast).to.deep.equal([
      //     {
      //       type: "element",
      //       tag: "p",
      //       nodes: [
      //         { type: 'expression', content: 'foo' },
      //         ' {bar} ',
      //         { type: 'expression', content: 'baz' },
      //         ' ',
      //         { type: 'expression', content: 'qux' }
      //       ]
      //     }
      //   ]);
      // });

    });

  });

});
