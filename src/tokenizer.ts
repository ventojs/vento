import iterateTopLevel from "./js.ts";

export type TokenType = "string" | "tag" | "filter" | "comment";
export type Token = [TokenType, string, number?];

const ECHO_START = /^-?\s*echo\s*-?$/;
const ECHO_END = /{{-?\s*\/echo\s*-?}}/g;

export default function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  const max = source.length;
  while(cursor < max){
    const end = source.indexOf("{{", cursor);
    if(end == -1){
      tokens.push(["string", source.slice(cursor), cursor]);
      return tokens;
    }
    tokens.push(["string", source.slice(cursor, end), cursor]);
    cursor = end;
    // {{# comment #}}
    if(source[cursor + 2] == "#"){
      cursor += 3;
      const end = source.indexOf("#}}", cursor);
      if(end == -1){
        tokens.push(["comment", source.slice(cursor), cursor - 3]);
        return tokens;
      }
      tokens.push(["comment", source.slice(cursor, end), cursor - 3]);
      cursor = end + 3;
      continue;
    }
    // {{ arbitrary tag }}
    const indexes = parseTag(source, cursor);
    const tokenIndex = tokens.length;
    for(let index = 1; index < indexes.length; index++){
      if(index == 1){
        tokens.push(["tag", source.slice(indexes[0], indexes[1] - 2), indexes[0] - 2]);
      } else {
        const code = source.slice(indexes[index - 1], indexes[index] - 2);
        tokens.push(["filter", code]);
      }
    }
    cursor = indexes[indexes.length - 1];
    if (!ECHO_START.test(tokens[tokenIndex][1])) continue;
    ECHO_END.lastIndex = cursor;
    const match = ECHO_END.exec(source);
    if(!match){
      tokens.push(["string", source.slice(cursor), cursor]);
      return tokens;
    }
    tokens.push(["string", source.slice(cursor, match.index), cursor]);
    tokens.push(["tag", match[0].slice(2, -2), match.index + 2]);
    cursor = match.index + match[0].length;
  }
  return tokens;
}

/**
 * Parse a tag and return the indexes of the start and end brackets, and the filters between.
 * For example: {{ tag |> filter1 |> filter2 }} => [2, 9, 20, 31]
 */
export function parseTag(source: string, start: number = 0): number[] {
  const indexes = [start + 2];
  for (const [index, reason] of iterateTopLevel(source, start + 2)) {
    if (reason == "|>") {
      indexes.push(index + 2);
      continue;
    } else if (reason != "}" || source[index + 1] != "}") continue;
    indexes.push(index + 2);
    return indexes;
  }
  throw new Error("Unclosed tag");
}
