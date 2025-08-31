import { SourceError } from "../core/errors.ts";
import iterateTopLevel from "../core/js.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(includeTag);
  };
}

function includeTag(
  env: Environment,
  token: Token,
  output: string,
  tokens: Token[],
): string | undefined {
  const [, code, position] = token;
  if (!code.startsWith("include ")) {
    return;
  }

  const tagCode = code.substring(7).trim();
  let file = tagCode;
  let data = "";

  // includes { data }
  if (tagCode.endsWith("}")) {
    let bracketIndex = -1;
    for (const [index, reason] of iterateTopLevel(tagCode)) {
      if (reason == "{") bracketIndex = index;
    }
    if (bracketIndex == -1) {
      throw new SourceError("Invalid include tag", position);
    }
    file = tagCode.slice(0, bracketIndex).trim();
    data = tagCode.slice(bracketIndex).trim();
  }

  const { dataVarname } = env.options;
  return `{
    const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ...${data}` : ""}},
      __template.path,
      ${position}
    );
    ${output} += ${env.compileFilters(tokens, "__tmp.content")};
  }`;
}
