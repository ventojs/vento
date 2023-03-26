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
      const index = source.indexOf(KEYWORDS.end);

      if (index === -1) {
        console.log(tokens);
        throw new Error(`Unclosed tag: ${source}`);
      }

      // Save code and detect filters
      const filters = source.slice(2, index).split(KEYWORDS.filter);
      const code = filters.shift()!.trim();
      tokens.push([type, code]);

      filters.forEach((filter) => {
        const match = filter.trim().match(/^(\w+)(?::(.*))?$/);

        if (!match) {
          throw new Error(`Invalid filter: ${filter}`);
        }

        const [_, filterName, filterArgs] = match;
        tokens.push(["filter", filterName, filterArgs]);
      });

      source = source.slice(index + 2);
      type = "string";
      continue;
    }
  }

  return tokens;
}
