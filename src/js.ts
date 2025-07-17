import reserved from "./reserved.ts";

const TEMPLATE_PART = /[`}](?:\\?[^])*?(?:`|\${)/y;
const REGEX_LITERAL_START = /(?<=[(=:,?&!]\s*)\//y;
const STOPPING_POINT = /['"`{}[\]/|]|((?<!\.\??)\b[a-zA-Z_]\w+)/g;

/**
 * This function iterates over the top-level scope of a JavaScript source code
 * string. It yields pairs of the index and the type of each top-level element
 * found.
 *
 * @example `{ foo: { bar: 1 } }` will yield:
 * - [0, "{", Set[]]                for the first opening brace
 * - [18, "}", Set['foo', 'bar']]   for the _second_ closing brace
 * - [18, "", Set['foo', 'bar']]    for the end of the string
 */
export default function* iterateTopLevel(
  source: string,
  start: number = 0,
): Generator<[number, string, Set<string>]> {
  const variables = new Set<string>();
  let cursor = start;
  let depth = -1;
  const brackets = [];
  const max = source.length;

  parsing: while (cursor < max) {
    // Search for the next stopping point (e.g., a brace, quote, or regex).
    STOPPING_POINT.lastIndex = cursor;
    const match = STOPPING_POINT.exec(source);

    // No stopping point found, stop parsing.
    if (!match) {
      break parsing;
    }

    cursor = match.index;
    const [stop, variable] = match;
    if (variable) {
      cursor += variable.length;
      if (!reserved.has(variable)) variables.add(variable);
      continue;
    }

    // Check the type of the stopping point.
    switch (stop) {
      case "|": {
        cursor++;
        // It's a pipe `|>` in the top-level scope
        if (depth < 0 && source[cursor] === ">") {
          cursor++;
          yield [cursor - 2, "|>", variables];
        }
        break;
      }

      case "'":
      case `"`: {
        // It's a quote or double-quote string: find the end.
        let escapes = 0;
        do {
          cursor = source.indexOf(stop, cursor + 1);
          if (cursor == -1) { // No closing quote found
            break parsing;
          }
          escapes = 0;
          // Handle escaped quotes
          while (source[cursor - 1 - escapes] == "\\") {
            escapes++;
          }
        } while (escapes % 2 != 0);
        cursor++;
        break;
      }

      case "{": {
        // It's an opening brace: yield if it's in the top-level scope.
        if (depth < 0) yield [cursor, "{", variables];
        cursor++;
        // Handle `{}`
        if (source[cursor] == "}") cursor++;
        // Push the opening brace onto the stack.
        else brackets[++depth] = "{";
        break;
      }

      case "[": {
        // It's an opening brace: yield if it's in the top-level scope.
        if (depth < 0) yield [cursor, "[", variables];
        cursor++;

        // Handle `[]`
        if (source[cursor] == "]") cursor++;
        // Push the opening brace onto the stack.
        else brackets[++depth] = "[";
        break;
      }

      case "]": {
        // Close the last opened bracket if it matches.
        if (brackets[depth] == "[") depth--;

        // Yield if it's in the top-level scope.
        if (depth < 0) yield [cursor, "]", variables];
        cursor++;
        break;
      }

      case "}": {
        // Close the last opened brace if it matches.
        if (brackets[depth] == "{") {
          depth--;
          // Yield if it's in the top-level scope.
          if (depth < 0) yield [cursor, "}", variables];
          cursor++;
          break;
        }

        // If it doesn't match, but we're in the top-level scope, yield anyway.
        if (depth < 0) {
          yield [cursor, "}", variables];
          cursor++;
          break;
        }

        // Break if we're not inside in a template literal.
        // otherwise, continue parsing.
        if (brackets[depth] != "`") {
          cursor++;
          break;
        }

        depth--;
      } /* falls through */

      case "`": {
        // Search for template literal part or end.
        TEMPLATE_PART.lastIndex = cursor;
        const match = TEMPLATE_PART.exec(source);

        // If we don't find anything, return end of the string.
        if (!match) return [max, ""];

        const [part] = match;
        cursor += part.length;

        // We found the end of the template literal
        if (source[cursor - 1] == "`") break;

        // Otherwise, we found a template literal part.
        // Store the opening backtick in the stack.
        brackets[++depth] = "`";
        break;
      }

      case "/": {
        // It's a line comment
        if (source[cursor + 1] == "/") {
          cursor = source.indexOf("\n", cursor + 2);
          if (cursor == -1) break parsing;
          break;
        }

        // It's a block comment
        if (source[cursor + 1] == "*") {
          cursor = source.indexOf("*/", cursor + 2);
          if (cursor == -1) break parsing;
          break;
        }

        // Check if it's a regex literal.
        REGEX_LITERAL_START.lastIndex = cursor;
        if (!REGEX_LITERAL_START.test(source)) {
          cursor++;
          break;
        }

        // It's a regex literal: find the end.
        let inCharClass = false;
        cursor++;
        do {
          const character = source[cursor];
          cursor++;
          switch (character) {
            case "\\":
              cursor++;
              break;
            case "[":
              inCharClass = true;
              break;
            case "]":
              inCharClass = false;
              break;
            case "/":
              if (!inCharClass) continue parsing;
              break;
          }
        } while (cursor < max);
        break parsing;
      }
    }
  }
  return [max, "", variables];
}
