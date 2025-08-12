import { TokenError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(ifTag);
    env.tags.push(elseTag);
  };
}

function ifTag(
  env: Environment,
  [, code]: Token,
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
  compiled.push(...env.compileTokens(tokens, output, "/if"));
  compiled.push("}");

  return compiled.join("\n");
}

function elseTag(
  _env: Environment,
  token: Token,
): string | undefined {
  const [, code] = token;

  if (!code.startsWith("else ") && code !== "else") {
    return;
  }
  const match = code.match(/^else(\s+if\s+(.*))?$/);

  if (!match) {
    throw new TokenError("Invalid else tag", token);
  }

  const [_, ifTag, condition] = match;

  if (ifTag) {
    return `} else if (${condition}) {`;
  }

  return "} else {";
}
