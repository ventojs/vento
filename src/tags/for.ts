import type { Token } from "../tokenizer.ts";
import type Environment from "../environment.ts";

export default function forTag(
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("for ")) {
    return;
  }

  const compiled: string[] = [];
  const match = code?.match(/^for (\w+)(?:,\s*(\w+))?\s+of\s+(.*)$/);

  if (!match) {
    throw new Error(`Invalid for loop: ${code}`);
  }
  const [_, variable, key, collection] = match;

  compiled.push(`if (!__env.utils.isEmpty(${collection})) {`);

  if (key) {
    compiled.push(
      `for await (let [${key}, ${variable}] of __env.utils.toIterator(${
        env.compileFilters(tokens, collection)
      }, true)) {`,
    );
  } else {
    compiled.push(
      `for await (let ${variable} of __env.utils.toIterator(${
        env.compileFilters(tokens, collection)
      })) {`,
    );
  }

  compiled.push(...env.compileTokens(tokens, output, ["/for"]));
  tokens.shift();
  compiled.push("}");
  compiled.push("}");
  console.log(compiled);
  return compiled.join("\n");
}
