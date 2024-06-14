import analyze from "../src/js.ts";
import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
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

  const tagCode = code.substring(7).trim();
  let index: number | undefined = undefined;
  analyze(tagCode, (type, i) => {
    if (type === "open-bracket") {
      index = i - 1;
      return false;
    }
  });

  const file = index === undefined
    ? tagCode.trim()
    : tagCode.slice(0, index).trim();
  const data = index === undefined ? "" : tagCode.slice(index).trim();
  const { dataVarname } = env.options;
  return `{
    const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ...${data}` : ""}},
      __file
    );
    ${output} += ${env.compileFilters(tokens, "__tmp.content")};
  }`;
}
