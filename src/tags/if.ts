import type { Token } from "../tokenizer.ts";
import type Environment from "../environment.ts";

export default function ifTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("if ")) {
    return;
  }
  const condition = code.replace(/^if\s+/, "");
  const compiled: string[] = [];

  compiled.push(`if (${condition}) {`);
  compiled.push(...env.compile(tokens, output, ["/if", "else"]));
  let last = tokens.shift();

  while (last && last[0] === "tag" && last[1] === "else") {
    if (last[2]) { // It's a "else if"
      const condition = last[2].replace(/^if\s+/, "");
      compiled.push(`} else if (${condition}) {`);
      compiled.push(...env.compile(tokens, output, ["/if", "else"]));
      last = tokens.shift();
      continue;
    }

    compiled.push("} else {");
    compiled.push(...env.compile(tokens, output, ["/if"]));
    last = tokens.shift();
  }

  if (last && last[0] === "tag" && last[1] === "/if") {
    compiled.push("}");
  }

  return compiled.join("\n");
}
