import { TokenError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(layoutTag);
  };
}

function layoutTag(
  env: Environment,
  token: Token,
  output: string,
  tokens: Token[],
): string | undefined {
  const [, code] = token;

  if (!code.startsWith("layout ")) {
    return;
  }

  const match = code?.match(
    /^layout\s+([^{]+|`[^`]+`)+(?:\{([\s|\S]*)\})?$/,
  );

  if (!match) {
    throw new TokenError("Invalid layout tag", token);
  }

  const [_, file, data] = match;

  const varname = output.startsWith("__layout")
    ? output + "_layout"
    : "__layout";

  const compiled: string[] = [];
  const compiledFilters = env.compileFilters(tokens, varname);

  compiled.push("{");
  compiled.push(`let ${varname} = "";`);
  compiled.push(...env.compileTokens(tokens, varname, "/layout"));
  compiled.push(`${varname} = ${compiledFilters};`);
  const { dataVarname } = env.options;

  compiled.push(
    `const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ${data}` : ""}, content: ${
      env.compileFilters(tokens, varname)
    }},
      __template.file
    );
    ${output} += __tmp.content;`,
  );

  compiled.push("}");
  return compiled.join("\n");
}
