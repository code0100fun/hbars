var helpers = {
  /* Wrap input in array if it not already wrapped in array */
  array: function(input) {
    if(!helpers.isArray(input)){
      input = [input];
    }
    return input;
  },
  /* Check if object is wrapped in array */
  isArray: function(thing) {
    if( Object.prototype.toString.call(thing) === '[object Array]' ) {
      return true;
    }
    return false;
  },
  argsToArray: function(args) {
    return [].slice.call(args);
  },
  /* merges a set of objects. If multiple have the same key
   * an array is created to contain all results */
  condense: function(objects) {
    var target = {}, sources;
    if(helpers.isArray(objects)){
      sources = objects;
    }else{
      sources = helpers.argsToArray(arguments);
    }
    sources.forEach(function (source) {
      for (var prop in source) {
        if(target[prop]){
          target[prop] = helpers.array(target[prop]);
          target[prop].push(source[prop]);
        }else{
          target[prop] = source[prop];
        }
      }
    });
    return target;
  },
  /* remove undefined values in array */
  compact: function(arr) {
    if (!helpers.isArray(arr)) {
      return arr;
    } else {
      return arr.filter(function(elem) {
        return typeof(elem) !== 'undefined';
      }).map(helpers.compact);
    }
  },
  objectHasProperties: function(value) {
    return Object.keys(value).length > 0;
  },
  present: function(value) {
    return typeof(value) !== 'undefined' && value !== null;
  },
  /* add property to target if it is an array or a non-empty object */
  addProperty: function(target, key, value) {
    if(helpers.present(value) && (helpers.isArray(value) || helpers.objectHasProperties(value))){
      target[key] = value;
    }
  },
  lastChar: function(str){
    return str.slice(-1);
  }
};

export default helpers;
