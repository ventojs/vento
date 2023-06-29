import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.tags.push(includeTag);
  };
}

function includeTag(
  _env: Environment,
  code: string,
  output: string,
): string | undefined {
  if (!code.startsWith("include ")) {
    return;
  }

  const match = code?.match(
    /^include\s+([^{]+|`[^`]+`)+(?:\{([\s|\S]*)\})?$/,
  );

  if (!match) {
    throw new Error(`Invalid include: ${code}`);
  }

  const [_, file, data] = match;

  return `${output} += await __env.run(${file}, {...__data${
    data ? `, ${data}` : ""
  }}, __file);`;
}
