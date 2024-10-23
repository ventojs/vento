import analyze from "./js.ts";

export type TokenType = "string" | "tag" | "filter" | "comment";
export type Token = [TokenType, string, number?];

export interface TokenizeResult {
  tokens: Token[];
  position: number;
  error: Error | undefined;
}

export default function tokenize(source: string): TokenizeResult {
  const tokens: Token[] = [];
  let type: TokenType = "string";
  let position = 0;

  try {
    while (source.length > 0) {
      if (type === "string") {
        const index = source.indexOf("{{");
        const code = index === -1 ? source : source.slice(0, index);

        tokens.push([type, code, position]);

        if (index === -1) {
          break;
        }

        position += index;
        source = source.slice(index);
        type = source.startsWith("{{#") ? "comment" : "tag";
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
          tokens.push(["filter", code]);
          return curr;
        });

        position += indexes[lastIndex];
        source = source.slice(indexes[lastIndex]);
        type = "string";

        // Search the closing echo tag {{ /echo }}
        if (tag?.[1].match(/^\-?\s*echo\s*\-?$/)) {
          const end = source.match(/{{\-?\s*\/echo\s*\-?}}/);

          if (!end) {
            throw new Error("Unclosed echo tag");
          }

          const rawCode = source.slice(0, end.index);
          tag[1] = `echo ${JSON.stringify(rawCode)}`;
          const length = Number(end.index) + end[0].length;
          source = source.slice(length);
          position += length;
        }

        continue;
      }
    }
  } catch (error) {
    return { tokens, position, error: error as Error | undefined };
  }

  return { tokens, position, error: undefined };
}

/**
 * Parse a tag and return the indexes of the start and end brackets, and the filters between.
 * For example: {{ tag |> filter1 |> filter2 }} => [2, 9, 20, 31]
 */
export function parseTag(source: string): number[] {
  const indexes: number[] = [2];

  analyze(source, (type, index) => {
    if (type === "close") {
      indexes.push(index);
      return false;
    }

    if (type === "new-filter") {
      indexes.push(index);
    } else if (type === "unclosed") {
      throw new Error("Unclosed tag");
    }
  });

  return indexes;
}
