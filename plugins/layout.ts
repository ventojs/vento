import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(layoutTag);
  };
}

function layoutTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("layout ")) {
    return;
  }

  const match = code?.match(
    /^layout\s+([^{]+|`[^`]+`)+(?:\{([\s|\S]*)\})?$/,
  );

  if (!match) {
    throw new Error(`Invalid wrap: ${code}`);
  }

  const [_, file, data] = match;

  const varname = output.startsWith("__layout")
    ? output + "_layout"
    : "__layout";

  const compiled: string[] = [];
  const compiledFilters = env.compileFilters(tokens, varname);

  compiled.push("{");
  compiled.push(`let ${varname} = "";`);
  compiled.push(...env.compileTokens(tokens, varname, ["/layout"]));

  if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/layout")) {
    throw new Error(`Missing closing tag for layout tag: ${code}`);
  }

  tokens.shift();

  compiled.push(`${varname} = ${compiledFilters};`);
  const { dataVarname } = env.options;

  compiled.push(
    `const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ${data}` : ""}, content: ${
      env.compileFilters(tokens, varname)
    }},
      __file
    );
    ${output} += __tmp.content;`,
  );

  compiled.push("}");
  return compiled.join("\n");
}
