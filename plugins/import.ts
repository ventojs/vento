import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.tags.push(importTag);
  };
}

function importTag(
  _env: Environment,
  code: string,
): string | undefined {
  if (!code.startsWith("import ")) {
    return;
  }

  const match = code?.match(
    /^import\s+(\{[\s|\S]*\})\s+from\s+(.+)$/,
  );

  if (!match) {
    throw new Error(`Invalid import: ${code}`);
  }

  const [_, vars, file] = match;

  return `
    __tmp = await __env.run(${file}, {...__data}, __file);
    let ${vars} = __tmp;
  `;
}
