var isArray = function(thing) {
  if( Object.prototype.toString.call(thing) === '[object Array]' ) {
    return true;
  }
  return false;
}

var buildAttribute = function(key, value){
  if(isArray(value)){
    value = value.join(' ');
  }
  return [' ', key, '="', value, '"'].join('');
}

var  buildAttributes = function(node) {
  var attrs = [];
  if(node.id){
    attrs.push(buildAttribute('id', node.id));
  }
  if(node.attributes){
    Object.keys(node.attributes).forEach(function(key){
      var value = node.attributes[key];
      attrs.push(buildAttribute(key, value));
    });
  }
  return attrs.join('');
}

var build = function(node){
  var lines = [];
  switch(node.type){
    case 'element':
      var attributes = buildAttributes(node);
      var tag = ['<', node.tag, attributes, '>',
                  '</',node.tag,'>'].join('');
      lines.push(tag);
      break;
  }
  return lines;
}

module.exports = {
  generate: function(ast){
    var lines = [];
    ast.forEach(function(node){
      lines = lines.concat(build(node));
    });
    return lines.join('\n');
  }
};
