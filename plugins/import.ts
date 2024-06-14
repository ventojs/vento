import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(importTag);
  };
}

function importTag(
  env: Environment,
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

  const [, vars, file] = match;
  const { dataVarname } = env.options;
  return `let ${vars} = await __env.run(${file}, {...${dataVarname}}, __file);`;
}
