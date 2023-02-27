import type { Token } from "../tokenizer.ts";
import compile, { compileFilters } from "../compiler.ts";

export default function setTag(
  code: string,
  _output: string,
  tokens: Token[],
): string {
  code = code.replace(/^set\s+/, "");
  // Value is set (e.g. {{ set foo = "bar" }})
  if (code.includes("=")) {
    const match = code.match(/^(.*?)\s*=\s*(.*)$/);
    if (!match) {
      throw new Error(`Invalid set tag: ${code}`);
    }
    const [, variable, value] = match;
    return `let ${variable} = ${compileFilters(tokens, value)};`;
  }

  // Value is captured (eg: {{ set foo }}bar{{ /set }})
  const compiled: string[] = [];
  const variable = code.trim();
  const compiledFilters = compileFilters(tokens, variable);

  compiled.push(`let ${variable} = "";`);
  compiled.push(...compile(tokens, variable, ["/set"]));

  if (tokens.length && (tokens[0][0] !== "block" || tokens[0][1] !== "/set")) {
    throw new Error(`Missing closing tag for set tag: ${code}`);
  }

  tokens.shift();
  compiled.push(`${variable} = ${compiledFilters};`);
  return compiled.join("\n");
}
