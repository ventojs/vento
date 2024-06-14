import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(exportTag);
  };
}

function exportTag(
  env: Environment,
  code: string,
  _output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("export ")) {
    return;
  }

  const expression = code.replace(/^export\s+/, "");
  const { dataVarname } = env.options;

  // Value is set (e.g. {{ export foo = "bar" }})
  if (expression.includes("=")) {
    const match = code.match(/^export\s+([\w]+)\s*=\s*([\s\S]+)$/);

    if (!match) {
      throw new Error(`Invalid export tag: ${code}`);
    }

    const [, variable, value] = match;
    const val = env.compileFilters(tokens, value);

    return `if (${dataVarname}.hasOwnProperty("${variable}")) {
      ${variable} = ${val};
    } else {
      var ${variable} = ${val};
    }
    ${dataVarname}["${variable}"] = ${variable};
    __exports["${variable}"] = ${variable};
    `;
  }

  // Value is captured (eg: {{ export foo }}bar{{ /export }})
  const compiled: string[] = [];
  const compiledFilters = env.compileFilters(tokens, expression);

  compiled.push(`if (${dataVarname}.hasOwnProperty("${expression}")) {
    ${expression} = "";
  } else {
    var ${expression} = "";
  }
  `);

  compiled.push(...env.compileTokens(tokens, expression, ["/export"]));

  if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/export")) {
    throw new Error(`Missing closing tag for export tag: ${code}`);
  }

  tokens.shift();
  compiled.push(`${expression} = ${compiledFilters};`);
  compiled.push(`${dataVarname}["${expression.trim()}"] = ${expression};`);
  compiled.push(`__exports["${expression.trim()}"] = ${expression};`);
  return compiled.join("\n");
}
