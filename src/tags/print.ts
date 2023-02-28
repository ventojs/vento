import type { Token } from "../tokenizer.ts";
import type Environment from "../environment.ts";

export default function printTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("=")) {
    return;
  }

  const expression = code.replace(/^=\s*/, "");

  code = env.compileFilters(tokens, expression);
  return `${output} += ${code};`;
}
