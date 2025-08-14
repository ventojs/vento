import { SourceError } from "../core/errors.ts";
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
  const [, code, position] = token;

  if (code.startsWith("slot ")) {
    const name = code.slice(4).trim();
    if (!/[a-z_]\w+/i.test(name)) {
      throw new SourceError(`Invalid slot name "${name}"`, position);
    }

    const compiled: string[] = [];
    const subvarName = `__slots.${name}`;
    const compiledFilters = env.compileFilters(tokens, subvarName);
    compiled.push(`${compiledFilters} ??= ''`);
    compiled.push(...env.compileTokens(tokens, subvarName, "/slot"));
    return compiled.join("\n");
  }

  if (!code.startsWith("layout ")) {
    return;
  }

  const match = code?.match(/^layout\s+([^{]+|`[^`]+`)+(?:\{([^]*)\})?$/);
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
