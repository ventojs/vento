import type { Token } from "../core/tokenizer.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(jsTag);
  };
}

function jsTag(
  _env: Environment,
  [, code]: Token,
): string | undefined {
  if (!code.startsWith(">")) {
    return;
  }

  return code.replace(/^>\s+/, "");
}
