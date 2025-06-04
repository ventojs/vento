import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(ifTag);
    env.tags.push(elseTag);
  };
}

function ifTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("if ")) {
    return;
  }
  const condition = code.replace(/^if\s+/, "").trim();
  const compiled: string[] = [];

  const val = env.compileFilters(tokens, condition);
  compiled.push(`if (${val}) {`);
  compiled.push(...env.compileTokens(tokens, output, ["/if"]));
  tokens.shift();
  compiled.push("}");

  return compiled.join("\n");
}

function elseTag(
  _env: Environment,
  code: string,
): string | undefined {
  if (!code.startsWith("else ") && code !== "else") {
    return;
  }
  const match = code.match(/^else(\s+if\s+(.*))?$/);

  if (!match) {
    throw new Error(`Invalid else: ${code}`);
  }

  const [_, ifTag, condition] = match;

  if (ifTag) {
    return `} else if (${condition}) {`;
  }

  return "} else {";
}
