import type { Token } from "../tokenizer.ts";
import compile from "../compiler.ts";

export default function ifTag(
  code: string,
  output: string,
  tokens: Token[],
): string {
  const compiled: string[] = [];

  compiled.push(`if (${code.replace(/^if\s+/, "")}) {`);
  compiled.push(...compile(tokens, output, ["/if", "else"]));
  let last = tokens.shift();

  while (last && last[0] === "block" && last[1] === "else") {
    if (last[2]) { // It's a "else if"
      const condition = last[2].replace(/^if\s+/, "");
      compiled.push(`} else if (${condition}) {`);
      compiled.push(...compile(tokens, output, ["/if", "else"]));
      last = tokens.shift();
      continue;
    }

    compiled.push("} else {");
    compiled.push(...compile(tokens, output, ["/if"]));
    last = tokens.shift();
  }

  if (last && last[0] === "block" && last[1] === "/if") {
    compiled.push("}");
  }

  return compiled.join("\n");
}
