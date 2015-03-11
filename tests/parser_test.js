import { parse as preprocess } from 'hbars/preprocessor';
import { parse as parser } from 'hbars/parser';

function parse(haml) {
  try {
    var preprocessed = preprocess(haml);
    return parser(preprocessed);
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

  it('complex nested element', function () {
    var ast = parse('.foo\n\t.bar\n\t\t.baz\n\t.qux');
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
            },
            nodes: [
              {
                type: "element",
                tag: "div",
                attributes: {
                  class : 'baz'
                }
              }
            ]
          },
          {
            type: "element",
            tag: "div",
            attributes: {
              class : 'qux'
            }
          }
        ]
      }
    ]);
  });

  it('inline expression', function () {
    var ast = parse('= user.name');
    expect(ast).to.deep.equal([
      {
        type: "expression",
        content: "user.name",
      }
    ]);
  });

  it('inline expression with tag', function () {
    var ast = parse('%p= user.name');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "p",
        content: [
          {
            type: "expression",
            content: "user.name",
          }
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

  it('complex block expressions', function () {
    var ast = parse('.foo\n\t- if thing\n\t\t.qux\n\t- else if not\n\t\t.bar\n\t- if foo\n\t\t.baz');
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
            name: "if",
            content: "thing",
            nodes: [
              {
                type: "element",
                tag: "div",
                attributes: {
                  class : 'qux'
                }
              },
              {
                type: "mid_block_expression",
                name: "else",
                content: "if not"
              },
              {
                type: "element",
                tag: "div",
                attributes: {
                  class : 'bar'
                }
              }
            ]
          },
          {
            type: "block_expression",
            name: "if",
            content: "foo",
            nodes: [
              {
                type: "element",
                tag: "div",
                attributes: {
                  class : 'baz'
                }
              }
            ]
          }
        ]
      }
    ]);
  });

  it('mustache expression', function () {
    var ast = parse('%p\n\t= user.name');
    expect(ast).to.deep.equal([
      {
        type: "element",
        tag: "p",
        nodes: [
          {
            type: "expression",
            content: "user.name",
          }
        ]
      }
    ]);
  });

  it('helper expression', function () {
    var ast = parse("= input type='text' value=name id='name'");
    expect(ast).to.deep.equal([
      {
        type: "expression",
        content: "input type='text' value=name id='name'"
      }
    ]);
  });

  it('if/else', function () {
    var ast = parse('- if foo.bar\n  %p\n- else if baz.qux\n  %div');
    expect(ast).to.deep.equal([
      {
        type: "block_expression",
        name: "if",
        content: "foo.bar",
        nodes: [
          {
            type: "element",
            tag: "p"
          },
          {
            type: "mid_block_expression",
            name: "else",
            content: "if baz.qux"
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

    it('static', function () {
      var ast = parse("%p( name=\"foo\" style=\"bar\" )");
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          attributes: {
            name : { type: "string", content: "foo" },
            style : { type: "string", content: "bar" }
          }
        }
      ]);
    });

    it('binding', function () {
      var ast = parse('%p{ name=foo.bar foo="baz #{ if bar \'bar\' \'foo\' } blah #{ foo }" }');
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          attributeBindings: {
            name : {
              type: 'expression',
              content: 'foo.bar'
            },
            foo: {
              type: 'string',
              content: [
                'baz ',
                {
                  type: 'expression',
                  content: ' if bar \'bar\' \'foo\' '
                },
                ' blah ',
                {
                  type: 'expression',
                  content: ' foo '
                }
              ]
            }
          }
        }
      ]);
    });

    it('helper expressions', function () {
      var ast = parse('%p{action "submit"}{ name=foo class="bar" }{blah foo}');
      expect(ast).to.deep.equal([
        {
          type: "element",
          tag: "p",
          attributeBindings: {
            name : { type: "expression", content: "foo" },
            class: { type: "string", content: "bar" }
          },
          helpers: [
            { type: 'expression', content: 'action "submit"' },
            { type: 'expression', content: 'blah foo' }
          ]
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
          content: ["some plain text 1234567890 !@#$%^&*()_+-={}[]|;:'?/>.<,"]
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

      it('nested beginning', function() {
        var ast = parse("%p\n  #{foo} {bar} #{baz} #{qux}");
        expect(ast).to.deep.equal([
          {
            type: "element",
            tag: "p",
            nodes: [
              { type: 'text', content: [
                  { type: 'expression', content: 'foo' },
                  ' {bar} ',
                  { type: 'expression', content: 'baz' },
                  ' ',
                  { type: 'expression', content: 'qux' }
                ]
              }
            ]
          }
        ]);

      });

    });

  });

});
