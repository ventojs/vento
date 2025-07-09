import type { Token } from "../src/tokenizer.ts";
import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(exportTag);
  };
}

const EXPORT_START = /^export\b\s*/;
const BLOCK_EXPORT = /^([a-zA-Z_]\w*)\s*$/;
const INLINE_DEFAULT_EXPORT = /^default\b([^]*)$/;
const INLINE_NAMED_EXPORT = /^([a-zA-Z_]\w*)\s*=([^]*)$/;
const NAMED_EXPORTS = /^{[^]*?}$/;
const AS = /\s+\bas\b\s+/;

function exportTag(
  env: Environment,
  code: string,
  _output: string,
  tokens: Token[],
): string | undefined {
  const exportStart = code.match(EXPORT_START);
  if (!exportStart) {
    return;
  }

  const source = code.slice(exportStart[0].length);
  const compiled: string[] = [];
  const { dataVarname } = env.options;

  // {{ export foo }}content{{ /export }}
  const blockExport = source.match(BLOCK_EXPORT);
  if (blockExport) {
    const [, name] = blockExport;
    const safeName = name == "default" ? "__default" : name;
    const compiledFilters = env.compileFilters(tokens, safeName);
    compiled.push(`var ${safeName} = "";`);
    compiled.push(...env.compileTokens(tokens, safeName, ["/export"]));
    if (tokens[0]?.[0] !== "tag" || tokens[0]?.[1] !== "/export") {
      throw new Error(`Missing closing tag for export tag: ${code}`);
    }
    tokens.shift();
    compiled.push(`${safeName} = ${compiledFilters}`);
    if (name != "default") {
      compiled.push(`${dataVarname}["${name}"] = ${safeName};`);
    }
    compiled.push(`__exports["${name}"] = ${safeName};`);
    return compiled.join("\n");
  }

  // {{ export default "content" }}
  const inlineDefaultExport = source.match(INLINE_DEFAULT_EXPORT);
  if (inlineDefaultExport) {
    const content = inlineDefaultExport[1].trim();
    if (content.startsWith("=")) {
      throw new Error(`Invalid "=" in default export tag: ${code}`);
    }
    const value = env.compileFilters(tokens, content);
    return `__exports["default"] = ${value};`;
  }

  // {{ export foo = "content" }}
  const inlineNamedExport = source.match(INLINE_NAMED_EXPORT);
  if (inlineNamedExport) {
    const [, name, content] = inlineNamedExport;
    compiled.push(`var ${name} = "";`);
    compiled.push(`${name} = ${env.compileFilters(tokens, content)};`);
    compiled.push(`${dataVarname}["${name}"] = ${name};`);
    compiled.push(`__exports["${name}"] = ${name};`);
    return compiled.join("\n");
  }

  // {{ export { foo, bar as baz, qux as default } }}
  const namedExports = source.match(NAMED_EXPORTS);
  if (namedExports) {
    const [full] = namedExports;
    const chunks = full.slice(1, -1).split(",");
    for (const chunk of chunks) {
      const names = chunk.trim().split(AS);
      if (names.length == 1) {
        const [name] = names;
        const value = `${dataVarname}["${name}"] ?? ${name}`;
        compiled.push(`__exports["${name}"] = ${value};`);
      } else if (names.length == 2) {
        const [name, rename] = names;
        const value = `${dataVarname}["${name}"] ?? ${name}`;
        compiled.push(`__exports["${rename}"] = ${value};`);
      } else {
        throw new Error(`Invalid import: ${code}`);
      }
    }
    return compiled.join("\n");
  }
}
