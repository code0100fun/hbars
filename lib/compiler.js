import { parse as preprocess } from 'preprocessor';
import { parse } from 'parser';
import { generate } from 'generator';

var compile = function(haml){
  var ast = parse(preprocess(haml));
  return generate(ast);
}

var Compiler = { compile: compile };

export default Compiler;
