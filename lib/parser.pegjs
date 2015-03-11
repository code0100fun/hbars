/*
 * hbars Grammar
 * ==========================
 *
 * Accepts a Hbars template and produces an AST to create a HTMLBars template
 */

{
  var INDENT_CHAR = options.INDENT_CHAR || '\uEFEF',
      DEDENT_CHAR = options.DEDENT_CHAR || '\uEFFE',
      TERM_CHAR = options.TERM_CHAR || '\uEFFF';
}

elements
  = (blockElement / mustache / textLine)*

mustacheContent 'Mustache Content'
  = c:.+
  { return c.join(''); }

mustache
  = blockWithElseChain / blockExpression / fullLineMustacheExpression

blockWithElseChain
  = b:blockExpression c:elseExpression+
  {
    for(var i = 0; i < c.length; i++) {
      b.nodes = b.nodes.concat(c[i]);
    }
    return b;
  }

elseExpression
  = _ dash _ name:'else' _ m:text? _ TERM b:(INDENT elements DEDENT TERM?)?
  {
    var e = { type: 'mid_block_expression', name:name };
    if(m) {
      e.content = m;
    }
    var nodes = [e];
    if(b && b.length > 0){
      nodes = nodes.concat(b[1]);
    }
    return nodes;
  }

blockExpression
  = _ dash _ name:ident _ m:text? _ TERM b:(INDENT elements DEDENT TERM?)?
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
    )* _ i:(mustacheExpression / inlineText )?
  &{
    return !!t || !!idClass.length;
  }
  {
    var element = {
      type: 'element',
      tag: t || 'div'
    };
    var attributes = idClass;
    var addAtributes = util.condense(attrs);
    util.addProperty(element, 'attributes', util.condense(attributes.concat(addAtributes.attributes)));
    util.addProperty(element, 'attributeBindings', util.condense(addAtributes.attributeBindings));
    if(typeof(addAtributes.helpers) !== 'undefined'){
      util.addProperty(element, 'helpers', util.array(addAtributes.helpers));
    }
    if(i){
      util.addProperty(element, 'content', util.array(i));
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
    return util.condense(a);
  }

attributeList 'Attribute List'
  = a:attribute*
  {
    return util.condense(a);
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
  = e:element _ TERM b:(INDENT elements DEDENT TERM?)?
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

