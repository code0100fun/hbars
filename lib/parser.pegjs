/*
 * hbars Grammar
 * ==========================
 *
 * Accepts a Haml template and produces an AST to create a Handlebars/HTMLBars template
 */

{
  var INDENT_CHAR = options.INDENT_CHAR || '\uEFEF',
      DEDENT_CHAR = options.DEDENT_CHAR || '\uEFFE',
      TERM_CHAR = options.TERM_CHAR || '\uEFFF';

  function array(input){
    if(Object.prototype.toString.call(input) !== '[object Array]'){
      input = [input];
    }
    return input;
  }

  function compact(input){
    if(typeof(input) === 'array'){
      if(input.length === 0){
        return;
      }
    }else if(typeof(input) === 'object'){
      if(Object.keys(input).length === 0){
        return;
      }
    }
    return input;
  }

  function isArray(thing) {
    if( Object.prototype.toString.call(thing) === '[object Array]' ) {
      return true;
    }
    return false;
  }

  function condense(objects) {
    var target = {}, sources;
    if(isArray(objects)){
      sources = objects;
    }else{
      sources = [].slice.call(arguments, 0);
    }
    sources.forEach(function (source) {
      for (var prop in source) {
        if(target[prop]){
          target[prop] = array(target[prop]);
          target[prop].push(source[prop]);
        }else{
          target[prop] = source[prop];
        }
      }
    });
    return target;
  }

  function addProperties(target, key, value) {
    if(Object.keys(value).length > 0){
      target[key] = value;
    }
  }

  function addProperty(target, key, value) {
    if(typeof(value) !== 'undefined' && value !== null){
      target[key] = value;
    }
  }
}

elements
  = (blockElement / mustache / textLine)*

mustacheContent 'Mustache Content'
  = c:.+
  { return c.join(''); }

mustache
  = blockChainExpression / blockExpression / fullLineMustacheExpression

blockChainExpression
  = b:blockExpression+
  &{
    var top = b[0];
    var mid = b[1];
    if(b.length == 2){
      return top.name === "if" && mid.name === "else";
    }
    return false;
  }
  {
    var top = b[0];
    var mid = b[1];
    var newMid = { type: "mid_block_expression", name: mid.name };
    if(mid.content){
      newMid.content = mid.content;
    }
    top.nodes.push(newMid);
    top.nodes.push.apply(top.nodes, mid.nodes);
    return top;
  }

blockExpression
  = _ dash _ name:ident _ m:text? _ TERM b:(INDENT elements DEDENT)?
  {
    var e = { type: 'block_expression', name:name };
    if(m) {
      e.content = m;
    }
    if(b && b.length > 0){
      e.nodes = b[1];
    }
    return e;
  }

fullLineMustacheExpression
  = m:mustacheExpression _ TERM
  { return m; }

mustacheExpression
  = _ equal _ m:text
  {
    return { type: 'expression', content:m };
  }

dash
  = '-'

equal
  = '='

element
  = t:(tag)? idClass:(id / class)* _ attrs:(
      a:attributes { return { attributes: a }; } /
      b:attributeBindings { return { attributeBindings: b }; } /
      h:attributeHelper { return { helpers: h }; }
    )* _ i:(mustacheExpression / inlineText )? _ TERM
  &{
    return !!t || !!idClass.length;
  }
  {
    var element = {
      type: 'element',
      tag: t || 'div'
    };
    var attributes = idClass;
    var addAtributes = condense(attrs);
    addProperties(element, 'attributes', condense(attributes.concat(addAtributes.attributes)));
    addProperties(element, 'attributeBindings', condense(addAtributes.attributeBindings));
    if(typeof(addAtributes.helpers) !== 'undefined'){
      addProperty(element, 'helpers', array(addAtributes.helpers));
    }
    if(i){
      addProperty(element, 'content', array(i));
    }
    return element;
  }

attributes
  = '(' a:attributeList ')'
  {
    return a;
  }

attributeHelper
  = '{' _ m:[^}]* _ '}'
  {
    return { type: 'expression', content: m.join('') };
  }

attributeBindings
  = '{' a:boundAttributeList '}'
  {
    return a;
  }

boundAttributeList 'Bound Attribute List'
  = a:boundAttribute*
  {
    return condense(a);
  }

attributeList 'Attribute List'
  = a:attribute*
  {
    return condense(a);
  }

boundAttribute
  = _ k:ident '=' v:(identChainExpression / doubleQuotedInterpolation / quoted) _
  {
    var attr = {};
    attr[k] = v;
    return attr;
  }

identChainExpression
 = c:identChain
 { return { type: 'expression', content: c }; }

attribute
  = _ k:ident '=' v:(identChain / quoted) _
  {
    var attr = {};
    attr[k] = v;
    return attr;
  }

blockElement
  = e:element b:(INDENT elements DEDENT)?
  {
    if(b && b.length > 0){
      e.nodes = b[1];
    }
    return e;
  }

id
  = '#' i:ident { return { id: i } }

tag
  = '%' t:ident { return t; }

class
  = '.' c:ident { return { class: c } }

quoted
  = chars:(("'" c:singleQuoteContent "'"){return c;} /
           ('"' c:doubleQuoteContent '"'){return c;} )
  { return { type: 'string', content: chars }; }

textLine
  = _ !(nonTextStart) _ t:(interpolation / interpolationText)* _ TERM
  {
    if(t.length === 1 && typeof(t[0]) === 'string'){
      return { type: 'text', content: t[0] };
    }
    return { type: 'text', content: t };
  }

inlineText
  = !(nonInlineTextStart) _ t:(interpolation / interpolationText)*
  {
    var content = [];
    t.forEach(function(node){
      content.push(node);
    });
    if(t.length === 1 && typeof(t[0]) === 'string'){
      return t[0];
    }
    return content;
  }

doubleQuotedInterpolation
  = '"' t:(interpolation / quotedInterpolationText )* '"'
  {
    var content = [];
    t.forEach(function(node){
      content.push(node);
    });
    if(t.length === 1 && typeof(t[0]) === 'string'){
      return t[0];
    }
    return { type: 'string', content: content };
  }

quotedInterpolationText
  = c:(!'"' interpolationText)
  { return c.join(''); }

interpolation
  = '#{' t:[^}]* '}'
  { return { type: 'expression', content: t.join('') }; }

interpolationText
  = t:(!'#{' c:textChar { return c; })+
  { return t.join(''); }

text
  = t:textChar+
  { return t.join(''); }

textChar
  = i:. &{ return i !== TERM_CHAR } { return i; }

singleQuoteContent
  = c:singleQuoteChar*
  { return c.join(''); }

doubleQuoteContent
  = c:doubleQuoteChar*
  { return c.join(''); }

singleQuoteChar
  = [^']

doubleQuoteChar
  = [^"]

identChain
  = i:(name / '.')+
  { return i.join('') }

ident
  = name

name
  = chars:nameChar+ { return chars.join('') }

nameChar
  = [_a-z0-9-]i
nonTextChar
  = TERM / DEDENT / INDENT / EOF

nonInlineTextStart
  = [%\.=\-] / TERM / DEDENT

nonTextStart
  = [%\.=\-] / TERM / DEDENT

INDENT "INDENT" = i:. &{ return i === INDENT_CHAR } { return ''; }
DEDENT "DEDENT" = i:. &{ return i === DEDENT_CHAR } { return ''; }
TERM  "TERM" = i:. &{ return i === TERM_CHAR } { return ''; }

__ "required whitespace"
  = whitespace+

_ "whitespace"
  = whitespace*

whitespace
  = [ \t\n\r]

EOF
  = !.

