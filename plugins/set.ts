import { SourceError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(setTag);
  };
}

function setTag(
  env: Environment,
  token: Token,
  _output: string,
  tokens: Token[],
): string | undefined {
  const [, code, position] = token;

  if (!code.startsWith("set ")) {
    return;
  }

  const expression = code.replace(/^set\s+/, "");
  const { dataVarname } = env.options;

  // Value is set (e.g. {{ set foo = "bar" }})
  if (expression.includes("=")) {
    const match = code.match(/^set\s+([\w]+)\s*=\s*([\s\S]+)$/);

    if (!match) {
      throw new SourceError("Invalid set tag", position);
    }

    const [, variable, value] = match;
    const val = env.compileFilters(tokens, value);

    return `var ${variable} = ${dataVarname}["${variable}"] = ${val};`;
  }

  // Value is captured (eg: {{ set foo }}bar{{ /set }})
  const compiled: string[] = [];
  const varName = expression.trim();
  const subvarName = `${dataVarname}["${varName}"]`;
  const compiledFilters = env.compileFilters(tokens, subvarName);

  compiled.push(`${subvarName} = "";`);
  compiled.push(...env.compileTokens(tokens, subvarName, "/set"));
  compiled.push(`var ${varName} = ${subvarName} = ${compiledFilters};`);
  return compiled.join("\n");
}
