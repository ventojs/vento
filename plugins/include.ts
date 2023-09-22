import type { Token } from "../src/tokenizer.ts";
import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.tags.push(includeTag);
  };
}

function includeTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("include ")) {
    return;
  }

  const match = code?.match(
    /^include\s+([^{]+|`[^`]+`)+(?:\{([\s|\S]*)\})?$/,
  );

  if (!match) {
    throw new Error(`Invalid include: ${code}`);
  }

  const [_, file, data] = match;
  const { dataVarname } = env.options;

  return `{
    const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ${data}` : ""}},
      __file
    );
    ${output} += ${env.compileFilters(tokens, "__tmp.content")};
  }`;
}
