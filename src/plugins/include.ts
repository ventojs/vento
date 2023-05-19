import Environment from "../environment.ts";

export default function includeTag(
  _env: Environment,
  code: string,
  output: string,
): string | undefined {
  if (!code.startsWith("include ")) {
    return;
  }

  const expression = code.replace(/^include\s+/, "");
  return `${output} += await __env.run(${expression}, __data, __file);`;
}
