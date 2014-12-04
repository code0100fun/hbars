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

  it('handle multiple root level nodes', function () {
    var processed = preprocess('%p\n\t%p\n%a\n%p', options);
    expect(processed).to.equal('%p.>%p.<%a.%p.');
  });

});
