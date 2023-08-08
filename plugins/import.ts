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
    /^import\s+(\{[\s|\S]*\}|\w+)\s+from\s+(.+)$/,
  );

  if (!match) {
    throw new Error(`Invalid import: ${code}`);
  }

  const [_, vars, file] = match;

  const compiled: string[] = [];
  compiled.push(`__tmp = await __env.run(${file}, {...__data}, __file);`);

  if (vars.startsWith("{")) {
    compiled.push(`let ${vars} = __tmp;`);
  } else {
    compiled.push(`let ${vars} = __tmp;`);
  }

  return compiled.join("\n");
}
