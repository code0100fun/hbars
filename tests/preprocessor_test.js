import { parse as preprocess } from 'preprocessor';

describe('preprocessor', function () {

  var options = {
    INDENT_CHAR: '>',
    DEDENT_CHAR: '<',
    TERM_CHAR: '.',
  };

  it('adds TERM char to last line', function () {
    var processed = preprocess('%p', options);
    expect(processed).to.equal('%p.');
  });

  it('replaces newline with TERM char', function () {
    var processed = preprocess('%p\n%p', options);
    expect(processed).to.equal('%p.%p.');
  });

  it('removes leading newlines', function () {
    var processed = preprocess('\n\n%p', options);
    expect(processed).to.equal('%p.');
  });

  it('removes empty trailing lines', function () {
    var processed = preprocess('%p\n\n', options);
    expect(processed).to.equal('%p.');
  });

  it('removes empty lines between content', function () {
    var processed = preprocess('%p\n\n\n%p', options);
    expect(processed).to.equal('%p.%p.');
  });

  it('marks 2 space indentation with single INDENT char', function () {
    var processed = preprocess('%p\n  %p', options);
    expect(processed).to.equal('%p.>%p.<');
  });

  it('marks tab indentation with single INDENT char', function () {
    var processed = preprocess('%p\n\t%p', options);
    expect(processed).to.equal('%p.>%p.<');
  });

  it('handles multiple root level nodes', function () {
    var processed = preprocess('%p\n\t%p\n%a\n%p', options);
    expect(processed).to.equal('%p.>%p.<%a.%p.');
  });

  it('allows for multiple bound attribute hashes', function () {
    var processed = preprocess('%p{f="b"}{a "c"}\n\t%p', options);
    expect(processed).to.equal('%p{f="b"}{a "c"}.>%p.<');
  });

  it('captures expressions until EOL, INDENT, DEDENT, or EOF', function () {
    var processed = preprocess("= input type='text' value=name id='name'", options);
    expect(processed).to.equal("= input type='text' value=name id='name'.");
  });

  describe('blank lines', function() {

    it('between inline plain elements', function() {
      var processed = preprocess("%p\n\n%p", options);
      expect(processed).to.equal("%p.%p.");
    });

    it('between nested plain elements', function() {
      var processed = preprocess(".foo\n %p\n\n%p", options);
      expect(processed).to.equal(".foo.>%p.<%p.");
    });

    it('first lines', function() {
      var processed = preprocess("\n\n%p\n%p", options);
      expect(processed).to.equal("%p.%p.");
    });

    it('end of file', function() {
      var processed = preprocess("%p\n%p\n\n", options);
      expect(processed).to.equal("%p.%p.");
    });

  });

});
