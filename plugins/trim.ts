import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tokenPreprocessors.push(trim);
  };
}

export function trim(_: Environment, tokens: Token[]) {
  for (let i = 0; i < tokens.length; i++) {
    const previous = tokens[i - 1];
    const token = tokens[i];
    const next = tokens[i + 1];

    let [type, code] = token;

    if (["tag", "comment"].includes(type) && code.startsWith("-")) {
      previous[1] = previous[1].trimEnd();
      code = code.slice(1);
    }

    if (["tag", "filter", "comment"].includes(type) && code.endsWith("-")) {
      next[1] = next[1].trimStart();
      code = code.slice(0, -1);
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
