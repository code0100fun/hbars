/*
 * hbars Preprocessor
 * ==========================
 *
 * Replaces occurances of:
 *  - indentation increases with INDENT
 *  - indentation decreases with DEDENT
 *  - line endings with TERM
 *
 * Also:
 *  - removes empty lines
 */

{
  var indentStack = [],
      indent = "",
      INDENT_CHAR = options.INDENT_CHAR || '\uEFEF',
      DEDENT_CHAR = options.DEDENT_CHAR || '\uEFFE',
      TERM_CHAR = options.TERM_CHAR || '\uEFFF';
}

start
  = INDENT? l:line*
    {
      var lines = util.compact(l).map(function(line){
        if(util.lastChar(line) !== DEDENT_CHAR){
          line = line + TERM_CHAR
        }
        return line;
      });
      return lines.join('');
    }

line
  = EOL { return } /
    SAMEDENT line:(
      (!EOL c:.
        {
          return c;
        }
      )
    )+ EOL*
    children:( i:INDENT c:line* d:DEDENT
    {
      var out = '';
      if(i){
        out = out + TERM_CHAR + i;
      }
      out = out + c.join(TERM_CHAR);
      if(d){
        if(util.lastChar(out) !== DEDENT_CHAR){
          out = out + TERM_CHAR;
        }
        out = out + d;
      }
      return out;
    })?
    {
      var out = line.join('');
      if(children){
        out = out + children;
      }
      return out;
    }

EOL
  = "\r\n" / "\n" / "\r"

SAMEDENT
  = i:[ \t]* &{ return i.join("") === indent; }

INDENT "INDENT"
  = &(i:[ \t]+ &{ return i.length > indent.length; }
    {
      indentStack.push(indent);
      indent = i.join('');
      peg$currPos = offset();
    })
    {
      return INDENT_CHAR;
    }

DEDENT "DEDENT"
  = {
      indent = indentStack.pop();
      return DEDENT_CHAR;
    }
