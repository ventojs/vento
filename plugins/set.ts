import type { Token } from "../src/tokenizer.ts";
import type { Environment } from "../src/environment.ts";

export default function () {
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

    return `
    ${dataVarname}["${variable}"] = ${val};
    var ${variable} = ${val};
    `;
  }

  // Value is captured (eg: {{ set foo }}bar{{ /set }})
  const compiled: string[] = [];
  const compiledFilters = env.compileFilters(tokens, expression);

  compiled.push(`if (${dataVarname}.hasOwnProperty("${expression}")) {
    ${expression} = "";
  } else {
    var ${expression} = "";
  }
  `);

  compiled.push(...env.compileTokens(tokens, expression, ["/set"]));

  if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/set")) {
    throw new Error(`Missing closing tag for set tag: ${code}`);
  }

  tokens.shift();
  compiled.push(`${expression} = ${compiledFilters};`);
  compiled.push(`${dataVarname}["${expression.trim()}"] = ${expression};`);
  return compiled.join("\n");
}
