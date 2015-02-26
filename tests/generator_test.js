import { generate } from '../generator';

describe('generator', function () {
  it('creates a tag', function () {
    var ast = [{ type: "element", tag: "p" }];
    var template = generate(ast);
    expect(template).to.equal('<p></p>');
  });

  it('creates multiple tags', function () {
    var ast = [
      { type: "element", tag: "p" },
      { type: "element", tag: "p" }
    ];
    var template = generate(ast);
    expect(template).to.equal('<p></p>\n<p></p>');
  });

  it('adds id attribute to tag', function () {
    var ast = [
      { type: "element", tag: "p", id: "foo" },
    ];
    var template = generate(ast);
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
    var template = generate(ast);
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
    var template = generate(ast);
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
    var template = generate(ast);
    expect(template).to.equal('<p id="paragraph" class="foo bar"></p>\n<a id="link" class="baz qux"></a>');
  });

  it('generates nested elements', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        nodes: [
          {
            type: "element",
            tag: "a",
            nodes: [
              {
                type: "element",
                tag: "span",
              }
            ]
          }
        ]
      },
    ];
    var template = generate(ast);
    expect(template).to.equal('<p>\n  <a>\n    <span></span>\n  </a>\n</p>');
  });

  it('generates nested helpers', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        nodes: [
          {
            type: "block_expression",
            name: "each",
            content: "things",
            nodes: [
              {
                type: "element",
                tag: "p",
              }
            ]
          },
        ]
      }
    ];
    var template = generate(ast);
    expect(template).to.equal('<p>\n  {{#each things}}\n    <p></p>\n  {{/each}}\n</p>');
  });

  it('generates mustache expression', function () {
    var ast = [
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
    ];
    var template = generate(ast);
    expect(template).to.equal('<p>\n  {{name}}\n</p>');
  });

  it('generates new each syntax', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        nodes: [
          {
            type: "block_expression",
            name: "each",
            content: "things as |thing|",
            nodes: [
              {
                type: "element",
                tag: "p",
              }
            ]
          },
        ]
      }
    ];
    var template = generate(ast);
    expect(template).to.equal('<p>\n  {{#each things as |thing|}}\n    <p></p>\n  {{/each}}\n</p>');
  });

  it('generates if/else', function () {
    var ast = [
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
    ];
    var template = generate(ast);
    expect(template).to.equal('{{#if foo}}\n  <p></p>\n{{else}}\n  <div></div>\n{{/if}}');
  });

  it('attributes', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        attributes: {
          name : 'foo',
          style: 'bar'
        }
      }
    ];
    var template = generate(ast);
    expect(template).to.equal('<p name="foo" style="bar"></p>');
  });

  it('attribute bindings', function () {
    var ast = [
      {
        type: "element",
        tag: "p",
        attributeBindings: {
          name : {
            type: "expression",
            content: 'foo'
          },
          style: {
            type: 'string',
            content: [
              {
                type: "expression",
                content: 'bar'
              }
            ]
          }
        }
      }
    ];
    var template = generate(ast);
    expect(template).to.equal('<p name={{foo}} style="{{bar}}"></p>');
  });

  it('helper expression', function () {
    var ast = [
      {
        type: "expression",
        content: "input type='text' value=name id='name'"
      }
    ];
    var template = generate(ast);
    expect(template).to.equal("{{input type='text' value=name id='name'}}");
  });

  it('helper attribute expressions', function () {
    var ast = [
      {
        type: "element",
        tag: "a",
        attributeBindings: {
          name : {
            type: 'expression',
            content: 'foo'
          }
        },
        content: 'Submit',
        helpers: [
          { type: 'expression', content: 'action "submit"' }
        ]
      }
    ];
    var template = generate(ast);
    expect(template).to.equal('<a name={{foo}} {{action "submit"}}>Submit</a>');
  });

  describe('plain text', function(){

    it('nested', function() {
      var ast = [
        {
          type: "element",
          tag: "p",
          nodes: [
            {
              type: "text",
              content: "some plain text 1234567890 !@#$*()_+-="
            }
          ]
        }
      ];

      var template = generate(ast);
      expect(template).to.equal('<p>\n  some plain text 1234567890 !@#$*()_+-=\n</p>');
    });

    it('inline', function() {
      var ast = [
        {
          type: "element",
          tag: "p",
          content: "some plain text 1234567890 !@#$*()_+-="
        }
      ];
      var template = generate(ast);
      expect(template).to.equal('<p>some plain text 1234567890 !@#$*()_+-=</p>');
    });

    describe('interpolation', function() {

      it('inline beginning', function() {
        var ast = [
          {
            type: "element",
            tag: "p",
            content: [
              { type: 'expression', content: 'foo' },
              ' bar',
              { type: 'text', content: ' baz' }
            ]
          }
        ];
        expect(generate(ast)).to.equal('<p>{{foo}} bar baz</p>');
      });

    });

  });

});
