import type { Token } from "../src/tokenizer.ts";
import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.tags.push(functionTag);
  };
}

function functionTag(
  env: Environment,
  code: string,
  _output: string,
  tokens: Token[],
): string | undefined {
  if (!code.startsWith("function ") && !code.startsWith("async function ")) {
    return;
  }

  const match = code?.match(
    /^(async\s+)?function\s+(\w+)\s*(\([^)]+\))?$/,
  );

  if (!match) {
    throw new Error(`Invalid function: ${code}`);
  }

  const [_, as, name, args] = match;

  const body = env.compileTokens(tokens, "__output", ["/function"]);

  if (
    tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/function")
  ) {
    throw new Error(`Missing closing tag for function tag: ${code}`);
  }

  tokens.shift();

  return `${as || ""} function ${name} ${args || "()"} {
    let __output = "";
    ${body.join("\n")}
    return __output;
  }`;
}
