import { topLevel } from "../src/js.ts";
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
  let file = tagCode;
  let data = "";

  // includes { data }
  if (tagCode.endsWith("}")) {
    let bracketIndex = -1;
    for (const [index, reason] of topLevel(tagCode, 0)) {
      if (reason == "{") bracketIndex = index - 1;
    }
    if (bracketIndex == -1) {
      throw Error(`Invalid include tag: ${tagCode}`);
    }
    file = tagCode.slice(0, bracketIndex).trim();
    data = tagCode.slice(bracketIndex).trim();
  }

  const { dataVarname } = env.options;
  return `{
    const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ...${data}` : ""}},
      __file
    );
    ${output} += ${env.compileFilters(tokens, "__tmp.content")};
  }`;
}
