import type { Token } from "../tokenizer.ts";
import { compileFilters } from "../compiler.ts";

export default function printTag(
  code: string,
  output: string,
  tokens: Token[],
): string {
  code = compileFilters(tokens, code.replace(/^=/, "").trim());
  return `${output} += ${code};`;
}
