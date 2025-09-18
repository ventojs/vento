import { SourceError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(functionTag);
  };
}

function functionTag(
  env: Environment,
  token: Token,
  _output: string,
  tokens: Token[],
): string | undefined {
  const [, code, position] = token;

  if (!code.match(/^(export\s+)?(async\s+)?function\s/)) {
    return;
  }

  const match = code.match(
    /^(export\s+)?(async\s+)?function\s+(\w+)\s*(\([^]*\))?$/,
  );

  if (!match) {
    throw new SourceError("Invalid function tag", position);
  }

  const [_, exp, as, name, args] = match;

  const compiled: string[] = [];
  compiled.push(`${as || ""} function ${name} ${args || "()"} {`);
  const tmp = env.getTempVariable();
  compiled.push(`let ${tmp} = "";`);
  const result = env.compileFilters(tokens, tmp);

  if (exp) {
    compiled.push(...env.compileTokens(tokens, tmp, "/export"));
  } else {
    compiled.push(...env.compileTokens(tokens, tmp, "/function"));
  }

  compiled.push(`return __env.utils.safeString(${result});`);
  compiled.push(`}`);

  if (exp) {
    compiled.push(`__exports["${name}"] = ${name}`);
  }

  return compiled.join("\n");
}
