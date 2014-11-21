var isArray = function(thing) {
  if( Object.prototype.toString.call(thing) === '[object Array]' ) {
    return true;
  }
  return false;
}

var buildContent = function(node, indent) {
  var content = [];
  if(node.nodes){
    content.push('\n');
    node.nodes.forEach(function(n){
      content.push(build(n, indent + 1));
    });
    content.push('\n');
  }
  return content.join('');
}

var buildExpression = function(node, indent) {
  var lines = [];
  var indentStr = repeat('  ', indent);
  var helper = [indentStr, '{{', node.content, '}}'].join('');
  lines.push(helper);
  return lines;
}

var buildHelper = function(node, indent) {
  var lines = [];
  content = buildContent(node, indent);
  var indentStr = repeat('  ', indent);
  var helper = [indentStr, '{{#', node.name, ' ', node.content, '}}', content,
              indentStr, '{{/',node.name,'}}'].join('');
  lines.push(helper);
  return lines;
}

var buildElement = function(node, indent) {
  var lines = [];
  var attributes = buildAttributes(node);
  content = buildContent(node, indent);
  var indentStr = repeat('  ', indent);
  var tag = [indentStr, '<', node.tag, attributes, '>', content,
              '</',node.tag,'>'].join('');
  lines.push(tag);
  return lines;
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

var repeat = function(str, n) {
  return new Array( n + 1 ).join(str);
}

var build = function(node, indent){
  var lines;
  indent = indent || 0;
  switch(node.type){
    case 'element':
      lines = buildElement(node, indent);
      break;
    case 'helper':
      lines = buildHelper(node, indent);
      break;
    case 'expression':
      lines = buildExpression(node, indent);
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
