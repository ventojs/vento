import type { Token } from "../tokenizer.ts";
import type Environment from "../environment.ts";

export default function setTag(
  env: Environment,
  code: string,
  _output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("set ")) {
    return;
  }

  const expression = code.replace(/^set\s+/, "");

  // Value is set (e.g. {{ set foo = "bar" }})
  if (expression.includes("=")) {
    const match = code.match(/^(.+)\s*=\s*(.+)$/);

    if (!match) {
      throw new Error(`Invalid set tag: ${code}`);
    }

    const [, variable, value] = match;
    return `let ${variable} = ${env.compileFilters(tokens, value)};`;
  }

  // Value is captured (eg: {{ set foo }}bar{{ /set }})
  const compiled: string[] = [];
  const compiledFilters = env.compileFilters(tokens, expression);

  compiled.push(`let ${expression} = "";`);
  compiled.push(...env.compile(tokens, expression, ["/set"]));

  if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/set")) {
    throw new Error(`Missing closing tag for set tag: ${code}`);
  }

  tokens.shift();
  compiled.push(`${expression} = ${compiledFilters};`);
  return compiled.join("\n");
}
