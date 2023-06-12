export type TokenType = "string" | "tag" | "filter";
export type Token = [TokenType, string, string?];

export default function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let type: TokenType = "string";

  while (source.length > 0) {
    if (type === "string") {
      const index = findTag(source);

      if (index === undefined) {
        tokens.push([type, source]);
        break;
      }

      tokens.push([type, source.slice(0, index)]);
      source = source.slice(index);
      type = "tag";
      continue;
    }

    if (type === "tag") {
      const indexes = parseTag(source);

      indexes.reduce((prev, curr, index) => {
        const code = source.slice(prev, curr - 2).trim();

        // Tag
        if (index === 1) {
          tokens.push([type, code]);
          return curr;
        }

        // Filters
        const match = code.match(/^(\w+)(?:\((.*)\))?$/);
        if (!match) {
          throw new Error(`Invalid filter: ${code}`);
        }

        const [_, filterName, filterArgs] = match;
        tokens.push(["filter", filterName, filterArgs]);
        return curr;
      });

      source = source.slice(indexes[indexes.length - 1]);
      type = "string";
      continue;
    }
  }

  return tokens;
}

/**
 * Find the index of the first tag in the source.
 * For example: <h1>{{ message }}</h1> => 4
 */
export function findTag(source: string): number | undefined {
  const index = source.indexOf("{{");
  return index === -1 ? undefined : index;
}

type status =
  | "single-quote"
  | "double-quote"
  | "literal"
  | "bracket"
  | "comment";

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
          status !== "double-quote" && status !== "literal"
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
          status !== "literal"
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
          status !== "literal"
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
          status !== "single-quote"
        ) {
          statuses.unshift("literal");
        }
        break;
      }

      // Detect comments
      case "/": {
        const status = statuses[0];

        if (
          status !== "single-quote" && status !== "double-quote" &&
          status !== "literal"
        ) {
          if (source.charAt(index) === "*") {
            statuses.unshift("comment");
          } else if (
            status === "comment" &&
            source.charAt(index - 2) === "*"
          ) {
            statuses.shift();
          }
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
