import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(echoTag);
  };
}

function echoTag(
  env: Environment,
  [, code]: Token,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!/^echo\b/.test(code)) {
    return;
  }

  const inline = code.slice(4).trim();
  // Inline value, e.g. {{ echo "foo" |> toUpperCase() }}
  if (inline) {
    const compiled = env.compileFilters(tokens, inline, env.options.autoescape);
    return `${output} += ${compiled};`;
  }

  // Captured echo, e.g. {{ echo |> toUpperCase }} foo {{ /echo }}
  const tmp = env.getTempVariable();
  const compiled = [`let ${tmp} = "";`];
  const filters = env.compileFilters(tokens, tmp);
  compiled.push(...env.compileTokens(tokens, tmp, "/echo"));

  if (filters != tmp) {
    compiled.push(`${tmp} = ${filters}`);
  }

  return `{
    ${compiled.join("\n")}
    ${output} += ${tmp};
  }`;
}
