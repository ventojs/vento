import { TokenError } from "../core/errors.ts";
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
  const [, code] = token;

  if (!code.startsWith("set ")) {
    return;
  }

  const expression = code.replace(/^set\s+/, "");
  const { dataVarname } = env.options;

  // Value is set (e.g. {{ set foo = "bar" }})
  if (expression.includes("=")) {
    const match = code.match(/^set\s+([\w]+)\s*=\s*([\s\S]+)$/);

    if (!match) {
      throw new TokenError("Invalid set tag", token);
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
  compiled.push(...env.compileTokens(tokens, subvarName, ["/set"]));

  if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/set")) {
    throw new TokenError("Missing closing tag for set tag", token);
  }

  tokens.shift();
  compiled.push(`var ${varName} = ${subvarName} = ${compiledFilters};`);
  return compiled.join("\n");
}
