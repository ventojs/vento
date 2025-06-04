import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(functionTag);
  };
}

function functionTag(
  env: Environment,
  code: string,
  _output: string,
  tokens: Token[],
): string | undefined {
  if (!code.match(/^(export\s+)?(async\s+)?function\s/)) {
    return;
  }

  const match = code.match(
    /^(export\s+)?(async\s+)?function\s+(\w+)\s*(\([^)]+\))?$/,
  );

  if (!match) {
    throw new Error(`Invalid function: ${code}`);
  }

  const [_, exp, as, name, args] = match;

  const compiled: string[] = [];
  compiled.push(`${as || ""} function ${name} ${args || "()"} {`);
  compiled.push(`let __output = "";`);
  const result = env.compileFilters(tokens, "__output");

  if (exp) {
    compiled.push(...env.compileTokens(tokens, "__output", ["/export"]));

    if (
      tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/export")
    ) {
      throw new Error(`Missing closing tag for export function tag: ${code}`);
    }
  } else {
    compiled.push(...env.compileTokens(tokens, "__output", ["/function"]));

    if (
      tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/function")
    ) {
      throw new Error(`Missing closing tag for function tag: ${code}`);
    }
  }

  tokens.shift();

  compiled.push(`return ${result};`);
  compiled.push(`}`);

  if (exp) {
    compiled.push(`__exports["${name}"] = ${name}`);
  }

  return compiled.join("\n");
}
