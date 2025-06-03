import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(setTag);
  };
}

function setTag(
  env: Environment,
  code: string,
  _output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("set ")) {
    return;
  }

  const expression = code.replace(/^set\s+/, "");
  const { dataVarname } = env.options;

  // Value is set (e.g. {{ set foo = "bar" }})
  if (expression.includes("=")) {
    const match = code.match(/^set\s+([\w]+)\s*=\s*([\s\S]+)$/);

    if (!match) {
      throw new Error(`Invalid set tag: ${code}`);
    }

    const [, variable, value] = match;
    const val = env.compileFilters(tokens, value);

    return `${dataVarname}["${variable}"] = ${val};`;
  }

  // Value is captured (eg: {{ set foo }}bar{{ /set }})
  const compiled: string[] = [];
  const subvarName = `${dataVarname}["${expression.trim()}"]`;
  const compiledFilters = env.compileFilters(tokens, subvarName);

  compiled.push(`${subvarName} = "";`);
  compiled.push(...env.compileTokens(tokens, subvarName, ["/set"]));

  if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/set")) {
    throw new Error(`Missing closing tag for set tag: ${code}`);
  }

  tokens.shift();
  compiled.push(`${subvarName} = ${compiledFilters};`);
  return compiled.join("\n");
}
