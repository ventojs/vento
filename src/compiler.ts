import forTag from "./tags/for.ts";
import ifTag from "./tags/if.ts";
import includeTag from "./tags/include.ts";
import setTag from "./tags/set.ts";
import printTag from "./tags/print.ts";

import type { Token } from "./tokenizer.ts";

export default function compile(
  tokens: Token[],
  output: string,
  stopAt?: string[],
): string[] {
  const compiled: string[] = [];

  while (tokens.length > 0) {
    if (stopAt && tokens[0][0] === "block" && stopAt.includes(tokens[0][1])) {
      break;
    }

    const [type, code] = tokens.shift()!;

    if (type === "string") {
      compiled.push(`${output} += \`${code}\`;`);
    }

    if (type === "block") {
      if (code.startsWith("=")) {
        compiled.push(printTag(code, output, tokens));
        continue;
      }

      if (code.startsWith("for ")) {
        compiled.push(forTag(code, output, tokens));
        continue;
      }

      if (code.startsWith("if ")) {
        compiled.push(ifTag(code, output, tokens));
        continue;
      }

      if (code.startsWith("include ")) {
        compiled.push(includeTag(code, output));
        continue;
      }

      if (code.startsWith("set ")) {
        compiled.push(setTag(code, output, tokens));
        continue;
      }

      throw new Error(`Unknown block: ${code}`);
    }
  }

  return compiled;
}

export function compileFilters(tokens: Token[], output: string) {
  while (tokens.length > 0 && tokens[0][0] === "filter") {
    const [, name, args] = tokens.shift()!;
    output = `await __env.filters.${name}(${output}${args ? `, ${args}` : ""})`;
  }

  return output;
}
