const REGEX_LITERAL = /\/(?:\\?[^[])*\/|\/(?:\\?[^])*?](?:\\?[^[])*?\//y;
const TEMPLATE_PART = /[`}](?:\\?[^])*?(?:`|\${)/y;
const REGEX_LITERAL_START = /(?<=[(=:,?&!]\s*)\//y;

const STOPPING_POINT = /['"`{}[\]/|]|((?<!\.\??)\b[a-zA-Z_]\w+)/g;

const reserved = new Set(['var', 'let', 'const', 'function', 'class', 'typeof',
  'instanceof', 'true', 'false', 'null', 'undefined', 'if', 'else', 'while',
  'for', 'do', 'new', 'void', 'yield', 'await', 'break', 'continue', 'switch',
  'case', 'default', 'return', 'import', 'export', 'delete', 'throw', 'try',
  'catch', 'finallly', 'async',
  '__file', '__env', '__defaults', '__err', '__exports', '__pos']);

export default function* iterateTopLevel(
  source: string,
  start: number = 0,
): Generator<[number, string, Set<string>]> {
  const variables = new Set<string>();
  let cursor = start;
  const brackets = [];
  let depth = -1;
  const max = source.length;
  parsing: while (cursor < max) {
    STOPPING_POINT.lastIndex = cursor;
    const match = STOPPING_POINT.exec(source);
    if (!match) break parsing;
    cursor = match.index;
    const [stop, variable] = match;
    if(variable){
      cursor += variable.length;
      if(!reserved.has(variable)) variables.add(variable);
      continue;
    }
    switch (stop) {
      case "|": {
        cursor++;
        if (depth < 0) {
          if (source[cursor] != ">") break;
          cursor++;
          yield [cursor - 2, "|>", variables];
        }
        break;
      }
      case "'":
      case `"`: {
        let escapes = 0;
        do {
          cursor = source.indexOf(stop, cursor + 1);
          if (cursor == -1) break parsing;
          escapes = 0;
          while (source[cursor - 1 - escapes] == "\\") escapes++;
        } while (escapes % 2 != 0);
        cursor++;
        break;
      }
      case "{":
      case "[": {
        brackets[++depth] = stop;
        if (depth == 0) yield [cursor, stop, variables];
        cursor++;
        break;
      }
      case "]": {
        if (brackets[depth] == "[") depth--;
        if (depth < 0) yield [cursor, "]", variables];
        cursor++;
        break;
      }
      case "}": {
        if (brackets[depth] == "{") {
          depth--;
          if (depth < 0) yield [cursor, "}", variables];
          cursor++;
          break;
        } else if (depth < 0) {
          yield [cursor, "}", variables];
          cursor++;
          break;
        } else if (brackets[depth] != "`") {
          cursor++;
          break;
        }
        depth--;
      }
      case "`": {
        TEMPLATE_PART.lastIndex = cursor;
        const match = TEMPLATE_PART.exec(source);
        if (!match) break parsing;
        const [part] = match;
        cursor += part.length;
        if (source[cursor - 1] == "`") break;
        brackets[++depth] = "`";
        break;
      }
      case "/": {
        if (source[cursor + 1] == "/") {
          cursor = source.indexOf("\n", cursor + 2);
          if (cursor == -1) break parsing;
          break;
        } else if (source[cursor + 1] == "*") {
          cursor = source.indexOf("*/", cursor + 2);
          if (cursor == -1) break parsing;
          break;
        }
        REGEX_LITERAL_START.lastIndex = cursor;
        if (!REGEX_LITERAL_START.test(source)) {
          cursor++;
          break;
        }
        REGEX_LITERAL.lastIndex = cursor;
        const match = REGEX_LITERAL.exec(source);
        if (!match) break parsing;
        cursor += match[0].length;
        break;
      }
    }
  }
  return [max, "", variables];
}
