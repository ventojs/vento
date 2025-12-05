import { SourceError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(defaultTag);
  };
}

const VARNAME = /^[a-zA-Z_$][\w$]*$/;
const VALID_TAG = /^([a-zA-Z_$][\w$]*)\s*=\s*([^]+)$/;

function defaultTag(
  env: Environment,
  token: Token,
  _output: string,
  tokens: Token[],
): string | undefined {
  const [, code, position] = token;
  const { dataVarname } = env.options;

  if (!code.startsWith("default ")) {
    return;
  }

  const expression = code.replace("default", "").trim();
  // Setting a value (e.g. {{ default foo = "bar" }}
  if (expression.includes("=")) {
    const match = expression.match(VALID_TAG);
    if (!match) {
      throw new SourceError("Invalid default tag", position);
    }
    const variable = match[1];
    const value = env.compileFilters(tokens, match[2]);
    return `
      if (typeof ${variable} == "undefined" || ${variable} === null) {
        var ${variable} = ${dataVarname}["${variable}"] = ${value};
      }
    `;
  }

  // Capture a value (e.g. {{ default foo }}bar{{ /default }}
  if (!VARNAME.test(expression)) {
    throw new SourceError("Invalid default tag", position);
  }
  const subvarName = `${dataVarname}["${expression}"]`;
  const compiledFilters = env.compileFilters(tokens, subvarName);
  return `
    if (typeof ${expression} == "undefined" || ${expression} === null) {
      ${subvarName} = "";
      ${env.compileTokens(tokens, subvarName, "/default").join("")}
      var ${expression} = ${subvarName} = ${compiledFilters};
    }
  `;
}
