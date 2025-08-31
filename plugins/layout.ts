import { SourceError } from "../core/errors.ts";
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

  const match = code?.match(LAYOUT_TAG);
  if (!match) {
    throw new SourceError("Invalid layout tag", position);
  }

  const [_, file, data] = match;

  const compiledFilters = env.compileFilters(tokens, "__slots.content");
  const { dataVarname } = env.options;
  return `${output} += (await (async () => {
    const __slots = { content: "" };
    ${env.compileTokens(tokens, "__slots.content", "/layout").join("\n")}
    __slots.content = __env.utils.safeString(${compiledFilters});
    return __env.run(${file}, {
      ...${dataVarname},
      ...__slots,
      ${data ?? ""}
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

  const compiledFilters = env.compileFilters(tokens, "__tmp");
  return `{
    let __tmp = '';
    ${env.compileTokens(tokens, "__tmp", "/slot").join("\n")}
    __slots.${name} ??= '';
    __slots.${name} += ${compiledFilters};
    __slots.${name} = __env.utils.safeString(__slots.${name});
  }`;
}
