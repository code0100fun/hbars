var isArray = function(thing) {
  if( Object.prototype.toString.call(thing) === '[object Array]' ) {
    return true;
  }
  return false;
};

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
};

var buildExpression = function(node, indent) {
  var lines = [];
  var indentStr = repeat('  ', indent);
  var expression = [indentStr, '{{', node.content, '}}'].join('');
  lines.push(expression);
  return lines;
};

var buildBlockExpression = function(node, indent) {
  var lines = [];
  var content = buildContent(node, indent);
  var indentStr = repeat('  ', indent);
  var expression = [indentStr, '{{#', node.name, ' ', node.content, '}}', content,
              indentStr, '{{/',node.name,'}}'].join('');
  lines.push(expression);
  return lines;
};

var buildMidBlockExpression = function(node, indent) {
  var lines = [];
  var indentStr = repeat('  ', indent - 1);
  var expression = ['\n', indentStr, '{{', node.name, '}}', '\n'].join('');
  lines.push(expression);
  return lines;
};


var buildElement = function(node, indent) {
  var lines = [];
  var attributes = buildAttributes(node);
  var bindAttrs = buildAttributeBindings(node);
  var content = buildContent(node, indent);
  var indentStr = repeat('  ', indent);
  var tag = [indentStr, '<', node.tag, attributes, bindAttrs, '>', content,
              '</',node.tag,'>'].join('');
  lines.push(tag);
  return lines;
};

var buildAttribute = function(key, value, quoted){
  var quotes = '"';
  if(typeof(quoted) === 'undefined'){
    quoted = true;
  }
  if(!quoted){
    quotes = '';
  }
  if(isArray(value)){
    value = value.join(' ');
  }
  return [' ', key, '=', quotes, value, quotes].join('');
};

var buildAttributeBindings = function(node) {
  var attrs = [];
  if(node.attributeBindings){
    Object.keys(node.attributeBindings).forEach(function(key){
      var value = node.attributeBindings[key];
      attrs.push(buildAttribute(key, value, false));
    });
  }
  if(attrs.length > 0){
    return [' ', '{{', 'bind-attr'].concat(attrs).concat(['}}']).join('');
  }
  return '';
};

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
};

var repeat = function(str, n) {
  return new Array( n + 1 ).join(str);
};

var build = function(node, indent){
  var lines;
  indent = indent || 0;
  switch(node.type){
    case 'element':
      lines = buildElement(node, indent);
      break;
    case 'block_expression':
      lines = buildBlockExpression(node, indent);
      break;
    case 'mid_block_expression':
      lines = buildMidBlockExpression(node, indent);
      break;
    case 'expression':
      lines = buildExpression(node, indent);
      break;
  }
  return lines;
};

var generate = function(ast){
  var lines = [];
  ast.forEach(function(node){
    lines = lines.concat(build(node));
  });
  return lines.join('\n');
};

export { generate };
