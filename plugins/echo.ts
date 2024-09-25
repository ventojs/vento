import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(echoTag);
  };
}

function echoTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("echo ")) {
    return;
  }

  const value = code.replace(/^echo\s+/, "");
  const val = env.compileFilters(tokens, value, env.options.autoescape);

  return `${output} += ${val};`;
}
