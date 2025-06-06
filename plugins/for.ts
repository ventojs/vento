import analyze from "../src/js.ts";
import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
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
  if (code === "break" || code === "continue") {
    return `${code};`;
  }

  if (!code.startsWith("for ")) {
    return;
  }

  const compiled: string[] = [];

  const match = code.match(
    /^for\s+(await\s+)?([\s\S]*)$/,
  );

  if (!match) {
    throw new Error(`Invalid for loop: ${code}`);
  }

  let [, aw, tagCode] = match;
  let var1: string;
  let var2: string | undefined = undefined;
  let collection = "";

  if (tagCode.startsWith("[") || tagCode.startsWith("{")) {
    [var1, tagCode] = getDestructureContent(tagCode);
  } else {
    const parts = tagCode.match(/(^[^\s,]+)([\s|\S]+)$/);
    if (!parts) {
      throw new Error(`Invalid for loop variable: ${tagCode}`);
    }

    var1 = parts[1].trim();
    tagCode = parts[2].trim();
  }

  if (tagCode.startsWith(",")) {
    tagCode = tagCode.slice(1).trim();

    if (tagCode.startsWith("[") || tagCode.startsWith("{")) {
      [var2, tagCode] = getDestructureContent(tagCode);
      collection = tagCode.slice(3).trim(); // Remove "of " from the start
    } else {
      const parts = tagCode.match(/^([\w]+)\s+of\s+([\s|\S]+)$/);
      if (!parts) {
        throw new Error(`Invalid for loop variable: ${tagCode}`);
      }

      var2 = parts[1].trim();
      collection = parts[2].trim();
    }
  } else if (tagCode.startsWith("of ")) {
    collection = tagCode.slice(3).trim();
  }

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

function toIterator(
  // deno-lint-ignore no-explicit-any
  item: any,
  withKeys = false,
): Iterable<unknown> | AsyncIterable<unknown> | Array<unknown> {
  if (item === undefined || item === null) {
    return [];
  }

  if (Array.isArray(item)) {
    return withKeys ? item.map((value, i) => [i, value]) : item;
  }

  if (typeof item === "function") {
    return toIterator(item(), withKeys);
  }

  if (typeof item === "object" && item !== null) {
    if (typeof item[Symbol.iterator] === "function") {
      if (withKeys) {
        return iterableToEntries(item as Iterable<unknown>);
      }
      return item as Iterable<unknown>;
    }

    if (typeof item[Symbol.asyncIterator] === "function") {
      if (withKeys) {
        return asyncIterableToEntries(item as AsyncIterable<unknown>);
      }

      return item as AsyncIterable<unknown>;
    }

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

function* iterableToEntries(
  iterator: Iterable<unknown>,
): Generator<[number, unknown]> {
  let i = 0;
  for (const value of iterator) {
    yield [i++, value];
  }
}

async function* asyncIterableToEntries(
  iterator: AsyncIterable<unknown>,
): AsyncGenerator<[number, unknown]> {
  let i = 0;
  for await (const value of iterator) {
    yield [i++, value];
  }
}

function getDestructureContent(code: string): [string, string] {
  let index = 0;

  analyze(code, (type, i) => {
    if (type === "close") {
      index = i;
      return false;
    }
  });

  return [
    code.slice(0, index).trim(),
    code.slice(index + 1).trim(),
  ];
}
