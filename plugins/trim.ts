import type { Token } from "../src/tokenizer.ts";
import type { Environment } from "../src/environment.ts";

export type TrimType = "all" | false;
export type TrimTagOptions = { left: TrimType; right: TrimType };

export default function (options: TrimType | TrimTagOptions = false) {
  const trimOptions = typeof options === "object"
    ? options
    : { left: options, right: options };

  return (env: Environment) => {
    env.tokenPreprocessors.push((e, tokens) => trim(e, tokens, trimOptions));
  };
}

export function trim(
  _: Environment,
  tokens: Token[],
  options: TrimTagOptions,
) {
  for (let i = 0; i < tokens.length; i++) {
    const previous = tokens[i - 1];
    const token = tokens[i];
    const next = tokens[i + 1];

    let [type, code] = token;

    if (type === "tag") {
      const trimLeft = !code.startsWith("+") &&
        (code.startsWith("-") || options.left);
      const trimRight = !code.endsWith("+") &&
        (code.endsWith("-") || (options.right));

      code = code.replace(/^[\+\-]/, "").replace(/[\+\-]$/, "");

      if (trimLeft) {
        previous[1] = previous[1].trimEnd();
      }

      if (trimRight) {
        next[1] = next[1].trimStart();
      }
    }

    // Trim tag and filter code
    switch (type) {
      case "tag":
      case "filter":
        token[1] = code.trim();
        break;
    }
  }
}
