import helpers from 'hbars/helpers';

describe('helpers', function () {

  describe('#isArray', function() {
    it('returns false for object', function () {
      var result = helpers.isArray({});
      expect(result).to.eq(false);
    });

    it('returns true for array', function () {
      var result = helpers.isArray([{}]);
      expect(result).to.eq(true);
    });
  });

  describe('#array', function() {
    it('wraps object in array', function () {
      var result = helpers.array({});
      expect(result).to.deep.eq([{}]);
    });

    it('returns array if already array', function () {
      var input = [{}];
      var result = helpers.array(input);
      expect(result).to.eq(input);
    });
  });

  describe('#condense', function() {
    it('merges two objects', function () {
      var result = helpers.condense({ foo: 'foo' }, { bar: 'bar' });
      expect(result).to.deep.eq({ foo: 'foo', bar: 'bar' });
    });

    it('duplicate keys are added to array', function () {
      var result = helpers.condense({ foo: 'foo' }, { foo: 'bar' });
      expect(result).to.deep.eq({ foo: ['foo', 'bar'] });
    });

    it('also accepts an array of objects to merge', function () {
      var result = helpers.condense([{ foo: 'foo' }, { foo: 'bar' }]);
      expect(result).to.deep.eq({ foo: ['foo', 'bar'] });
    });
  });

  describe('#compact', function() {
    it('removes undefined values in array', function () {
      var result = helpers.compact([ 1, undefined, 2 ]);
      expect(result).to.deep.eq([ 1, 2 ]);
    });

    it('returns the input if it is not an array', function () {
      var input = { foo: 'foo'};
      var result = helpers.compact(input);
      expect(result).to.deep.eq(input);
    });
  });

  describe('#addProperty', function() {
    it('adds array as property of target', function () {
      var target = {};
      helpers.addProperty(target, 'foo', []);
      expect(target).to.deep.eq({ foo: [] });
    });

    it('adds non-empty object as property of target', function () {
      var target = {};
      helpers.addProperty(target, 'foo', { bar: 'bar' });
      expect(target).to.deep.eq({ foo: { bar: 'bar' } });
    });

    it('ignores empty object', function () {
      var target = {};
      helpers.addProperty(target, 'foo', {});
      expect(target).to.deep.eq({});
    });
  });

});
