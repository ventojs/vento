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

  // Value is set (e.g. {{ set foo = "bar" }})
  if (expression.includes("=")) {
    const match = code.match(/^set\s+(.+)\s*=\s*(.+)$/);

    if (!match) {
      throw new Error(`Invalid set tag: ${code}`);
    }

    const [, variable, value] = match;
    const val = env.compileFilters(tokens, value);

    return `if (__data.hasOwnProperty("${variable}")) {
      ${variable} = ${val};
    } else {
      var ${variable} = ${val};
    }
    __data["${variable.trim()}"] = ${variable};
    `;
  }

  // Value is captured (eg: {{ set foo }}bar{{ /set }})
  const compiled: string[] = [];
  const compiledFilters = env.compileFilters(tokens, expression);

  compiled.push(`if (__data.hasOwnProperty("${expression}")) {
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
  compiled.push(`__data["${expression.trim()}"] = ${expression};`);
  return compiled.join("\n");
}
