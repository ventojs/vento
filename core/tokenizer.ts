import iterateTopLevel from "./js.ts";

export type TokenType = "string" | "tag" | "filter" | "comment";
export type Token = [TokenType, string, number];

export default function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let type: TokenType = "string";
  let position = 0;

  while (source.length > 0) {
    if (type === "string") {
      const index = source.indexOf("{{");
      const code = index === -1 ? source : source.slice(0, index);

      tokens.push([type, code, position]);

      position += index;
      source = source.slice(index);
      type = source.startsWith("{{#") ? "comment" : "tag";

      if (index === -1) {
        break;
      }

      continue;
    }

    if (type === "comment") {
      source = source.slice(3);
      const index = source.indexOf("#}}");
      const comment = index === -1 ? source : source.slice(0, index);
      tokens.push([type, comment, position]);

      if (index === -1) {
        break;
      }

      position += index + 3;
      source = source.slice(index + 3);
      type = "string";
      continue;
    }

    if (type === "tag") {
      const indexes = parseTag(source);
      const lastIndex = indexes.length - 1;
      let tag: Token | undefined;

      indexes.reduce((prev, curr, index) => {
        const code = source.slice(prev, curr - 2);

        // Tag
        if (index === 1) {
          tag = [type, code, position];
          tokens.push(tag);
          return curr;
        }

        // Filters
        tokens.push(["filter", code, position + prev]);
        return curr;
      });

      if (indexes[lastIndex] == Infinity) return tokens;

      position += indexes[lastIndex];
      source = source.slice(indexes[lastIndex]);
      type = "string";

      // Search the closing echo tag {{ /echo }}
      if (tag?.[1].match(/^\-?\s*echo\s*\-?$/)) {
        const end = /{{\-?\s*\/echo\s*\-?}}/.exec(source);

        if (!end) {
          tokens.push(["string", source, position]);
          return tokens;
        }

        tokens.push(["string", source.slice(0, end.index), position]);
        position += end.index;
        tokens.push(["tag", end[0].slice(2, -2), position]);
        position += end[0].length;
        source = source.slice(end.index + end[0].length);
      }

      continue;
    }
  }
  if (type == "string") {
    tokens.push([type, "", position]);
  }
  return tokens;
}

/**
 * Parse a tag and return the indexes of the start and end brackets, and the filters between.
 * For example: {{ tag |> filter1 |> filter2 }} => [2, 9, 20, 31]
 */
export function parseTag(source: string): number[] {
  const indexes = [2];
  for (const [index, reason] of iterateTopLevel(source, 2)) {
    if (reason == "|>") {
      indexes.push(index + 2);
      continue;
    } else if (!source.startsWith("}}", index)) continue;
    indexes.push(index + 2);
    return indexes;
  }
  indexes.push(Infinity);
  return indexes;
}
