import type { Token } from "../src/tokenizer.ts";
import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.tags.push(forTag);
    env.utils.toIterator = toIterator;
  };
}

function forTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("for ")) {
    return;
  }

  const compiled: string[] = [];
  const match = code.match(
    /^for\s+(await\s+)?(\w+)(?:,\s*(\w+))?\s+of\s+([\s|\S]+)$/,
  );

  if (!match) {
    throw new Error(`Invalid for loop: ${code}`);
  }
  const [_, aw, var1, var2, collection] = match;

  if (var2) {
    compiled.push(
      `for ${aw || ""}(let [${var1}, ${var2}] of __env.utils.toIterator(${
        env.compileFilters(tokens, collection)
      }, true)) {`,
    );
  } else {
    compiled.push(
      `for ${aw || ""}(let ${var1} of __env.utils.toIterator(${
        env.compileFilters(tokens, collection)
      })) {`,
    );
  }

  compiled.push(...env.compileTokens(tokens, output, ["/for"]));
  tokens.shift();
  compiled.push("}");

  return compiled.join("\n");
}

function toIterator(item: unknown, withKeys = false): Array<unknown> {
  if (item === undefined || item === null) {
    return [];
  }

  if (Array.isArray(item)) {
    return withKeys ? Object.entries(item) : item;
  }

  if (typeof item === "function") {
    return toIterator(item(), withKeys);
  }

  if (typeof item === "object" && item !== null) {
    return withKeys ? Object.entries(item) : Object.values(item);
  }

  if (typeof item === "string") {
    return toIterator(item.split(""), withKeys);
  }

  if (typeof item === "number") {
    return toIterator(new Array(item).fill(0).map((_, i) => i + 1), withKeys);
  }

  return toIterator([item], withKeys);
}
