import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export const defaultTags = [
  ">",
  "set",
  "/set",
  "default",
  "/default",
  "if",
  "/if",
  "else",
  "for",
  "/for",
  "function",
  "async",
  "/function",
  "export",
  "/export",
  "import",
];

const LEADING_WHITESPACE = /(^|\n)[ \t]+$/;
const TRAILING_WHITESPACE = /^[ \t]*\r?\n/;

export type AutoTrimOptions = { tags: string[] };

export default function (
  options: AutoTrimOptions = { tags: defaultTags },
): Plugin {
  return (env: Environment) => {
    env.tokenPreprocessors.push((_, tokens) => autoTrim(tokens, options));
  };
}

export function autoTrim(tokens: Token[], options: AutoTrimOptions) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const [type, code] = token;

    let needsTrim = false;
    if (type === "comment") {
      needsTrim = true;
    } else if (type === "tag") {
      needsTrim = options.tags.some((tag) => {
        if (!code.startsWith(tag)) return false;
        return /\s/.test(code[tag.length] ?? " ");
      });
    }

    if (!needsTrim) continue;

    // Remove leading horizontal space
    const previous = tokens[i - 1];
    previous[1] = previous[1].replace(LEADING_WHITESPACE, "$1");

    // Skip "filter" tokens to find the next "string" token
    for (let j = i + 1; j < tokens.length; j++) {
      if (tokens[j][0] === "filter") continue;
      if (tokens[j][0] !== "string") break;
      // Remove trailing horizontal space + newline
      const next = tokens[j];
      next[1] = next[1].replace(TRAILING_WHITESPACE, "");
      break;
    }
  }
}
