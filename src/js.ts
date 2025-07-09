const REGEX_LITERAL = /\/(?:\\?[^[])*\/|\/(?:\\?[^])*?](?:\\?[^[])*?\//y;
const TEMPLATE_PART = /[`}](?:\\?[^])*?(?:`|\${)/y;
const REGEX_LITERAL_START = /(?<=[(=:,?&!]\s*)\//y;

const STOPPING_POINT = /['"`{}[\]/|]/g;

export default function* iterateTopLevel(
  source: string,
  start: number = 0,
): Generator<[number, string]> {
  let cursor = start;
  const brackets = [];
  let depth = -1;
  const max = source.length;
  parsing: while (cursor < max) {
    STOPPING_POINT.lastIndex = cursor;
    const match = STOPPING_POINT.exec(source);
    if (!match) break parsing;
    cursor = match.index;
    const [stop] = match;
    switch (stop) {
      case "|": {
        cursor++;
        if (depth < 0) {
          if (source[cursor] != ">") break;
          cursor++;
          yield [cursor - 2, "|>"];
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
        if (depth == 0) yield [cursor, stop];
        cursor++;
        break;
      }
      case "]": {
        if (brackets[depth] == "[") depth--;
        if (depth < 0) yield [cursor, "]"];
        cursor++;
        break;
      }
      case "}": {
        if (brackets[depth] == "{") {
          depth--;
          if (depth < 0) yield [cursor, "}"];
          cursor++;
          break;
        } else if (depth < 0) {
          yield [cursor, "}"];
          cursor++;
          break;
        } else if (brackets[depth] != "`") {
          cursor++;
          break;
        }
        depth--;
      } /* falls through */
      case "`": {
        TEMPLATE_PART.lastIndex = cursor;
        const match = TEMPLATE_PART.exec(source);
        if (!match) return max;
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
  return [max, ""];
}
