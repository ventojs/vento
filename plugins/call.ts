// import { TokenError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(callTag);
  };
}

function callTag(
  env: Environment,
  token: Token,
  output: string,
  tokens: Token[],
): string | undefined {
  const [, code] = token;
  if (code.startsWith("slot ")) {
    const name = code.slice(5);
    const compiled: string[] = [];
    const subvarName = `__slots[${name}]`;
    const compiledFilters = env.compileFilters(tokens, subvarName);
    compiled.push(`${compiledFilters} ??= ''`);
    compiled.push(...env.compileTokens(tokens, subvarName, "/slot"));
    return compiled.join("\n");
  }

  const tagMatch = code.match(/^(await\s+)?call\s/);
  if (!tagMatch) return;
  const [full, isAsync] = tagMatch;
  const parts = code
    .slice(full.length)
    .trim()
    .match(/^(\w+)\s*(?:\(([^]*)\))?$/);
  if (!parts) throw Error("Malformed arguments to {{ call }} tag");
  const [, name, args = ""] = parts;
  const compiled = [`const __slots = { content: "" }`];
  const result = `${isAsync ? "await " : ""}${name}.call(__slots, ${args})`;
  const compiledFilters = env.compileFilters(tokens, result);
  compiled.push(...env.compileTokens(tokens, "__slots.content", "/call"));
  compiled.push(`${output} += ${compiledFilters}`);
  return `{${compiled.join("\n")}}`;
}
