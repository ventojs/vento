import type { Token } from "../tokenizer.ts";
import compile, { compileFilters } from "../compiler.ts";

export default function forTag(
  code: string,
  output: string,
  tokens: Token[],
): string {
  const compiled: string[] = [];
  const match = code?.match(/^for (\w+)(?:,\s*(\w+))?\s+of\s+(.*)$/);

  if (!match) {
    throw new Error(`Invalid for loop: ${code}`);
  }
  const [_, variable, key, collection] = match;

  compiled.push(`if (!__env.utils.isEmpty(${collection})) {`);

  if (key) {
    compiled.push(
      `for await (let [${key}, ${variable}] of __env.utils.toIterator(${collection}, true)) {`,
    );
  } else {
    compiled.push(
      `for await (let ${variable} of __env.utils.toIterator(${collection})) {`,
    );
  }

  compiled.push(`${variable} = ${compileFilters(tokens, variable)};`);
  compiled.push(...compile(tokens, output, ["/for"]));
  tokens.shift();
  compiled.push("}");
  compiled.push("}");

  return compiled.join("\n");
}
