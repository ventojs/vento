export default function includeTag(code: string, output: string): string {
  return `${output} += await __env.run(${
    code.replace(/^include\s+/, "")
  }, __data, __file);`;
}
