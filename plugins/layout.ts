import { SourceError } from "../core/errors.ts";
import iterateTopLevel from "../core/js.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(layoutTag);
    env.tags.push(slotTag);
  };
}

const LAYOUT_TAG = /^layout\s+([^{]+|`[^`]+`)+(?:\{([^]*)\})?$/;
const SLOT_NAME = /^[a-z_]\w*$/i;
const DIRECT_DATA = /["'`\w]\s+([a-z_$][\w$]*)$/i;

function layoutTag(
  env: Environment,
  token: Token,
  output: string,
  tokens: Token[],
): string | undefined {
  const [, code, position] = token;

  if (!code.startsWith("layout ")) {
    return;
  }

  const tagCode = code.slice(6).trim();
  let file = tagCode;
  let data = "";

  // Includes { data }
  if (tagCode.endsWith("}")) {
    let bracketIndex = -1;
    for (const [index, reason] of iterateTopLevel(tagCode)) {
      if (reason == "{") bracketIndex = index;
    }
    if (bracketIndex == -1) {
      throw new SourceError("Invalid layout tag", position);
    }
    file = tagCode.slice(0, bracketIndex).trim();
    data = tagCode.slice(bracketIndex).trim();
  }

  // Includes data directly (e.g. {{ layout "template.vto" data }})
  const directDataMatch = tagCode.match(DIRECT_DATA);
  if (directDataMatch) {
    data = directDataMatch[1];
    file = tagCode.slice(0, -data.length).trim();
  }

  const compiledFilters = env.compileFilters(tokens, "__slots.content");
  const { dataVarname } = env.options;
  return `${output} += (await (async () => {
    const __slots = { content: "" };
    ${env.compileTokens(tokens, "__slots.content", "/layout", true).join("\n")}
    __slots.content = __env.utils.safeString(${compiledFilters});
    return __env.run(${file}, {
      ...${dataVarname},
      ...__slots,
      ${data ? "..." + data : ""}
    }, __template.path, ${position});
  })()).content;`;
}

function slotTag(
  env: Environment,
  token: Token,
  _output: string,
  tokens: Token[],
): string | undefined {
  const [, code, position] = token;

  if (!code.startsWith("slot ")) {
    return;
  }

  const name = code.slice(4).trim();
  if (!SLOT_NAME.test(name)) {
    throw new SourceError(`Invalid slot name "${name}"`, position);
  }

  const tmp = env.getTempVariable();
  const compiledFilters = env.compileFilters(tokens, tmp);
  return `{
    let ${tmp} = '';
    ${env.compileTokens(tokens, tmp, "/slot").join("\n")}
    __slots.${name} ??= '';
    __slots.${name} += ${compiledFilters};
    __slots.${name} = __env.utils.safeString(__slots.${name});
  }`;
}
