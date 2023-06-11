export type TokenType = "string" | "tag" | "filter";
export type Token = [TokenType, string, string?];

const KEYWORDS = {
  start: "{{",
  end: "}}",
  filter: "|>",
};

export default function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let type: TokenType = "string";

  while (source.length > 0) {
    if (type === "string") {
      const index = source.indexOf(KEYWORDS.start);

      if (index === -1) {
        tokens.push([type, source]);
        break;
      }

      tokens.push([type, source.slice(0, index)]);
      source = source.slice(index);
      type = "tag";
      continue;
    }

    if (type === "tag") {
      const index = indexEndTag(source);

      if (index === undefined) {
        throw new Error(`Unclosed tag: ${source}`);
      }

      const tagSource = source.slice(2, index - 2);
      source = source.slice(index);

      // Save code and detect filters
      const filters = tagSource.split(KEYWORDS.filter);
      const code = filters.shift()!.trim();
      tokens.push([type, code]);

      filters.forEach((filter) => {
        const match = filter.trim().match(/^(\w+)(?:\((.*)\))?$/);

        if (!match) {
          throw new Error(`Invalid filter: ${filter}`);
        }

        const [_, filterName, filterArgs] = match;
        tokens.push(["filter", filterName, filterArgs]);
      });

      type = "string";
      continue;
    }
  }

  return tokens;
}

type status =
  | "single-quote"
  | "double-quote"
  | "literal"
  | "bracket"
  | "comment";

function indexEndTag(source: string): number | undefined {
  const length = source.length;
  const statuses: status[] = [];
  let index = 0;

  while (index < length) {
    const char = source.charAt(index++);

    switch (char) {
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
      case "}": {
        const status = statuses[0];

        if (status === "bracket") {
          statuses.shift();

          if (statuses.length === 0) {
            return index;
          }
        }
        break;
      }

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
    }
  }
}
