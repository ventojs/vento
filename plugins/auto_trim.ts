import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export const defaultTags = [
  ">",
  "#",
  "set",
  "/set",
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
    const previous = tokens[i - 1];
    const token = tokens[i];
    const next = tokens[i + 1];

    const [type, code] = token;

    if (type === "tag" && options.tags.find((tag) => code.startsWith(tag))) {
      // Remove leading horizontal space
      previous[1] = previous[1].replace(/(^|\n)[ \t]*$/, "$1");

      // Remove trailing horizontal space + newline
      if (next) {
        next[1] = next[1].replace(/^[ \t]*(?:\r\n|\n)/, "");
      }
    } else if (type === "comment") {
      previous[1] = previous[1].replace(/(?:\r\n|\n)[ \t]*$/, "");
    }
  }
}
