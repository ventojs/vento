import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

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
  const compiled = [`let __tmp = "";`];
  const filters = env.compileFilters(tokens, "__tmp");
  compiled.push(...env.compileTokens(tokens, "__tmp", ["/echo"]));
  if (filters != "__tmp") {
    compiled.push(`__tmp = ${filters}`);
  }

  const closeToken = tokens.shift();
  if (!closeToken || closeToken[0] != "tag" || closeToken[1] != "/echo") {
    throw new Error("Unclosed echo tag");
  }

  return `{
    ${compiled.join("\n")}
    ${output} += __tmp;
  }`;
}
