var isArray = function(thing) {
  if( Object.prototype.toString.call(thing) === '[object Array]' ) {
    return true;
  }
  return false;
};

var buildInlineContent = function(contents) {
  var content = [];
  if(typeof(contents) === 'string'){
    return contents;
  }
  contents.forEach(function(c){
    if(typeof(c) === 'string'){
      content.push(c);
    }else{
      content.push(build(c, 0));
    }
  });
  return content.join('');
};

var buildContent = function(node, indent) {
  var content = [];
  if(node.nodes){
    node.nodes.forEach(function(n){
      content.push(build(n, indent + 1));
    });
    content = [content.join('\n')];
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

var buildText = function(node, indent) {
  var lines = [];
  var indentStr = repeat('  ', indent);
  var text = indentStr + node.content;
  lines.push(text);
  return lines;
};

var buildBlockExpression = function(node, indent) {
  var lines = [];
  var content = buildContent(node, indent);
  var indentStr = repeat('  ', indent);
  var expression = [indentStr, '{{#', node.name, ' ', node.content, '}}', '\n',
              content, '\n', indentStr, '{{/',node.name,'}}'].join('');
  lines.push(expression);
  return lines;
};

var buildMidBlockExpression = function(node, indent) {
  var lines = [];
  var indentStr = repeat('  ', indent - 1);
  var expression = [indentStr, '{{', node.name, '}}'].join('');
  lines.push(expression);
  return lines;
};

var buildElement = function(node, indent) {
  var lines = [];
  var attributes = buildAttributes(node);
  var bindAttrs = buildAttributeBindings(node);
  var attributeHelpers = buildAttributeHelpers(node);
  var content;
  if(node.content){
    content = buildInlineContent(node.content);
  }else{
    content = buildContent(node, indent);
    if(content && content.length > 0){
      content = ['\n', buildContent(node, indent), '\n'].join('');
    }
  }
  var indentStr = repeat('  ', indent);
  var tag = [indentStr, '<', node.tag, attributes, bindAttrs, attributeHelpers, '>', content,
              '</',node.tag,'>'].join('');
  lines.push(tag);
  return lines;
};

var enclosedIn = function(str, char){
  return str.substr(str.length - 1) === char;
};

var unquote = function(str){
  if(enclosedIn(str, '"')) {
    str = str.substring(1, str.length-1);
  }
  if(enclosedIn(str, "'")) {
    str = str.substring(1, str.length-1);
  }
  return str;
};

var enquote = function(str, char){
  var quotes = char || '"';
  if(char){
    quotes = char;
  }
  return [quotes, unquote(str), quotes].join('');
};

var buildAttribute = function(key, value, quoted){
  if(isArray(value)){
    value = value.join(' ');
  }
  quoted = quoted || typeof(quoted) === 'undefined';
  if(quoted){
    value = enquote(value);
  }
  var attr =  [' ', key, '=', value].join('');
  return attr;
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

var buildAttributeHelpers = function(node) {
  var helpers = [];
  if(node.helpers){
    node.helpers.forEach(function(helper){
      helpers.push(build(helper));
    });
  }
  if(helpers.length > 0){
    return [' ', helpers.join('')].join('');
  }
  return '';
};

var buildAttributes = function(node) {
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
    case 'text':
      lines = buildText(node, indent);
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
