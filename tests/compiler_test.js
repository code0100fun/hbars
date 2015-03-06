import Compiler from 'hbars/compiler';

describe('compiler', function () {

  it('tags with classes and ids', function () {
    var template = Compiler.compile('%p#paragraph.foo.bar\n%a#link.baz.qux');
    expect(template).to.equal('<p id="paragraph" class="foo bar"></p>\n<a id="link" class="baz qux"></a>');
  });

  it('self closing tags', function () {
    var template = Compiler.compile('%meta\n%input\n%img');
    expect(template).to.equal('<meta>\n<input>\n<img>');
  });

  it('nested tags', function () {
    var template = Compiler.compile('%p\n  %a');
    expect(template).to.equal('<p>\n  <a></a>\n</p>');
  });

  it('nested block expression', function () {
    var template = Compiler.compile('%p\n\t- each things\n\t\t%p');
    expect(template).to.equal('<p>\n  {{#each things}}\n    <p></p>\n  {{/each}}\n</p>');
  });

  it('inline expression', function () {
    var template = Compiler.compile('%p= name');
    expect(template).to.equal('<p>{{name}}</p>');
  });

  it('nested expression', function () {
    var template = Compiler.compile('%p\n\t= name');
    expect(template).to.equal('<p>\n  {{name}}\n</p>');
  });

  it('if/else', function () {
    var template = Compiler.compile('-if foo\n  %p\n-else\n  %a');
    expect(template).to.equal('{{#if foo}}\n  <p></p>\n{{else}}\n  <a></a>\n{{/if}}');
  });

  it('if/else if', function () {
    var template = Compiler.compile('-if foo\n  %p\n-else if bar\n  %a\n-else\n  %s');
    expect(template).to.equal('{{#if foo}}\n  <p></p>\n{{else if bar}}\n  <a></a>\n{{else}}\n  <s></s>\n{{/if}}');
  });

  it('unless', function () {
    var template = Compiler.compile('-unless foo\n  %p\n');
    expect(template).to.equal('{{#unless foo}}\n  <p></p>\n{{/unless}}');
  });

  describe('attributes', function(){

    it('handles single and double quoted attributes', function () {
      var template = Compiler.compile('%p( name=\'foo\' style="bar" )');
      expect(template).to.equal('<p name="foo" style="bar"></p>');
    });

    describe('binding', function() {

      it('literal', function () {
        var template = Compiler.compile('%p{ disabled=isDisabled }');
        expect(template).to.equal('<p disabled={{isDisabled}}></p>');
      });

      it('quoted', function () {
        var template = Compiler.compile('%p{ name="#{bar}" }');
        expect(template).to.equal('<p name="{{bar}}"></p>');
      });

      it('complicated expression', function () {
        var template = Compiler.compile("%p{ class=\"baz #{ if bar 'bar' 'foo' }\" }");
        expect(template).to.equal("<p class=\"baz {{ if bar 'bar' 'foo' }}\"></p>");
      });

    });

    it('helper', function () {
      var template = Compiler.compile('%button{ name=name class="bar #{foo}" }{action "submit"}Submit');
      expect(template).to.equal('<button name={{name}} class="bar {{foo}}" {{action "submit"}}>Submit</button>');
    });

    it('helper nested content', function () {
      var template = Compiler.compile('%button{action "submit"}\n Submit');
      expect(template).to.equal('<button {{action "submit"}}>\n  Submit\n</button>');
    });

  });

  describe('plain text', function(){

    it('nested', function() {
      var template = Compiler.compile("%p\n  some plain text 1234567890 !@#$*()_+-=");
      expect(template).to.equal('<p>\n  some plain text 1234567890 !@#$*()_+-=\n</p>');
    });

    it('inline', function() {
      var template = Compiler.compile("%p some plain text 1234567890 !@#$*()_+-=");
      expect(template).to.equal('<p>some plain text 1234567890 !@#$*()_+-=</p>');
    });

  });

  describe('interpolation', function() {

    it('inline beginning', function() {
      var template = Compiler.compile("%p #{foo} bar #{baz}");
      expect(template).to.equal('<p>{{foo}} bar {{baz}}</p>');
    });

    it('inline with spaces', function() {
      var template = Compiler.compile("%p #{if foo bar} bar");
      expect(template).to.equal('<p>{{if foo bar}} bar</p>');
    });

    it('special characters', function() {
      var template = Compiler.compile("%p #{12 !@#$%^&*()_+=-\"': /><,.|\\} bar");
      expect(template).to.equal("<p>{{12 !@#$%^&*()_+=-\"': /><,.|\\}} bar</p>");
    });

  });

  describe('newlines', function() {
    it('between nested plain elements', function() {
      var template = Compiler.compile(".foo\n %p\n %p\n%p");
      expect(template).to.equal('<div class="foo">\n  <p></p>\n  <p></p>\n</div>\n<p></p>');
    });
  });

  describe('blank lines', function() {

    it('between inline plain elements', function() {
      var template = Compiler.compile("%p\n\n%p");
      expect(template).to.equal('<p></p>\n<p></p>');
    });

    it('between nested plain elements', function() {
      var template = Compiler.compile(".foo\n %p\n\n%p");
      expect(template).to.equal('<div class="foo">\n  <p></p>\n</div>\n<p></p>');
    });

  });

});
