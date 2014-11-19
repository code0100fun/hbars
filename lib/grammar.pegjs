/*
 * hbars Grammar
 * ==========================
 *
 * Accepts a Haml template and produces an AST to create a Handlebars/HTMLBars template
 */

{
  function array(input){
    if(typeof(input) !== 'array'){
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

  function isAray(thing) {
    if( Object.prototype.toString.call(thing) === '[object Array]' ) {
      return true;
    }
    return false;
  }

  function condense(objects) {
    var target = {}, sources;
    if(isAray(objects)){
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

  function addProperty(target, key, value) {
    if(Object.keys(value).length > 0){
      target[key] = value;
    }
  }
}

elements
  = ((e:element lineEnd*) { return e })+

element
  = t:tag attributes:(id / class)* {
    var element = {
      type: 'Element',
      tag: t
    };
    addProperty(element, 'attributes', condense(attributes));
    return element;
  }
  / attributes:(id / class)+ {
    var element = {
      type: 'Element',
      tag: 'div'
    };
    addProperty(element, 'attributes', condense(attributes));
    return element;
  }

id
  = '#' i:ident { return { id: i } }

tag
  = '%' t:ident { return t; }

class
  = '.' c:ident { return { class: c } }

ident
  = name

name
  = chars:nameChar+ { return chars.join('') }

nameChar
  = [_a-z0-9-]i

nonascii
  = [\x80-\uFFFF]

lineEnd
  = [\n]

