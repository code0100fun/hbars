import { parse as preprocess } from 'hbars/preprocessor';
import { parse } from 'hbars/parser';
import { generate } from 'hbars/generator';

var compile = function(haml){
  var ast = parse(preprocess(haml));
  return generate(ast);
};

var Compiler = { compile: compile };

export default Compiler;
