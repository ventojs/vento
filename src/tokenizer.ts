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
  let trimNext = false;
  let position = 0;

  try {
    while (source.length > 0) {
      if (type === "string") {
        const index = source.indexOf("{{");
        const code = index === -1 ? source : source.slice(0, index);

        if (trimNext) {
          tokens.push([type, code.trimStart(), position]);
          trimNext = false;
        } else {
          tokens.push([type, code, position]);
        }

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
          let code = source.slice(prev, curr - 2);

          // Tag
          if (index === 1) {
            // Left trim
            if (code.startsWith("-")) {
              code = code.slice(1);
              const lastToken = tokens[tokens.length - 1];
              lastToken[1] = lastToken[1].trimEnd();
            }

            // Right trim
            if (code.endsWith("-") && index === lastIndex) {
              code = code.slice(0, -1);
              trimNext = true;
            }
            tag = [type, code.trim(), position];
            tokens.push(tag);
            return curr;
          }

          // Right trim
          if (index === lastIndex && code.endsWith("-")) {
            code = code.slice(0, -1);
            trimNext = true;
          }

          // Filters
          tokens.push(["filter", code.trim()]);
          return curr;
        });

        position += indexes[lastIndex];
        source = source.slice(indexes[lastIndex]);
        type = "string";

        // Search the closing echo tag {{ /echo }}
        if (tag?.[1] === "echo") {
          const end = source.match(/{{\s*\/echo\s*}}/);

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
    return { tokens, position, error };
  }

  return { tokens, position, error: undefined };
}

type status =
  | "single-quote"
  | "double-quote"
  | "regex"
  | "literal"
  | "bracket"
  | "comment"
  | "line-comment";

/**
 * Parse a tag and return the indexes of the start and end brackets, and the filters between.
 * For example: {{ tag |> filter1 |> filter2 }} => [2, 9, 20, 31]
 */
export function parseTag(source: string): number[] {
  const length = source.length;
  const statuses: status[] = [];
  const indexes: number[] = [2];

  let index = 0;

  while (index < length) {
    const char = source.charAt(index++);

    switch (char) {
      // Detect start brackets
      case "{": {
        const status = statuses[0];

        if (status === "literal" && source.charAt(index - 2) === "$") {
          statuses.unshift("bracket");
        } else if (
          status !== "comment" && status !== "single-quote" &&
          status !== "double-quote" && status !== "literal" &&
          status !== "regex" && status !== "line-comment"
        ) {
          statuses.unshift("bracket");
        }
        break;
      }

      // Detect end brackets
      case "}": {
        const status = statuses[0];

        if (status === "bracket") {
          statuses.shift();

          if (statuses.length === 0) {
            indexes.push(index);
            return indexes;
          }
        }
        break;
      }

      // Detect double quotes
      case '"': {
        const status = statuses[0];
        if (status === "double-quote") {
          statuses.shift();
        } else if (
          status !== "comment" &&
          status !== "single-quote" &&
          status !== "literal" &&
          status !== "regex" &&
          status !== "line-comment"
        ) {
          statuses.unshift("double-quote");
        }
        break;
      }

      // Detect single quotes
      case "'": {
        const status = statuses[0];
        if (status === "single-quote") {
          statuses.shift();
        } else if (
          status !== "comment" &&
          status !== "double-quote" &&
          status !== "literal" &&
          status !== "regex" &&
          status !== "line-comment"
        ) {
          statuses.unshift("single-quote");
        }
        break;
      }

      // Detect literals
      case "`": {
        const status = statuses[0];
        if (status === "literal") {
          statuses.shift();
        } else if (
          status !== "comment" &&
          status !== "double-quote" &&
          status !== "single-quote" &&
          status !== "regex" &&
          status !== "line-comment"
        ) {
          statuses.unshift("literal");
        }
        break;
      }

      // Detect comments and regex
      case "/": {
        const status = statuses[0];
        if (
          status === "single-quote" || status === "double-quote" ||
          status === "literal" || status === "line-comment"
        ) {
          break;
        }

        // We are in a comment: close or ignore
        if (status === "comment") {
          if (source.charAt(index - 2) === "*") {
            statuses.shift();
          }
          break;
        }

        // We are in a regex: close or ignore
        if (status === "regex") {
          if (source.charAt(index - 2) !== "\\") {
            statuses.shift();
          }
          break;
        }

        // Start a new comment
        if (source.charAt(index) === "*") {
          statuses.unshift("comment");
          break;
        }

        // Start a new line comment
        if (source.charAt(index - 2) === "/") {
          statuses.unshift("line-comment");
          break;
        }

        // Start a new regex
        const prev = prevChar(source, index - 1);
        if (prev === "(" || prev === "=" || prev === ":" || prev === ",") {
          statuses.unshift("regex");
        }
        break;
      }

      // Detect end of line comments
      case "\n": {
        const status = statuses[0];
        if (status === "line-comment") {
          statuses.shift();
        }
        break;
      }

      // Detect filters
      case "|": {
        const status = statuses[0];
        if (status === "bracket" && source.charAt(index) === ">") {
          indexes.push(index + 1);
        }
        break;
      }
    }
  }

  throw new Error("Unclosed tag");
}

// Get the previous character in a string ignoring spaces, line breaks and tabs
function prevChar(source: string, index: number) {
  while (index > 0) {
    const char = source.charAt(--index);
    if (char !== " " && char !== "\n" && char !== "\r" && char !== "\t") {
      return char;
    }
  }
  return "";
}
