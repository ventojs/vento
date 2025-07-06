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
    const target = tagCode.length - 1;
    let index = -1;
    for (const match of tagCode.matchAll(/{/g)) {
      if (topLevel(tagCode, match.index + 1) == target) {
        index = match.index;
        break;
      }
    }
    if (index == -1) {
      throw Error(`Invalid include tag: ${tagCode}`);
    }
    file = tagCode.slice(0, index).trim();
    data = tagCode.slice(index).trim();
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
