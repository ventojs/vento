import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(importTag);
  };
}

const IMPORT_STATEMENT = /^import\b\s*([^]*?)\s*\bfrom\b([^]*)$/;
const DEFAULT_IMPORT = /^\b[a-zA-Z_]\w*\b$/i;
const NAMED_IMPORTS = /^{[^]*?}$/;
const AS = /\s+\bas\b\s+/;

function importTag(
  env: Environment,
  code: string,
): string | undefined {
  if (!code.startsWith("import ")) {
    return;
  }

  const match = code.match(IMPORT_STATEMENT);
  if (!match) {
    throw new Error(`Invalid import: ${code}`);
  }

  const compiled: string[] = [];
  const variables: string[] = [];
  const [, identifiers, specifier] = match;

  const defaultImport = identifiers.match(DEFAULT_IMPORT);
  if (defaultImport) {
    const [name] = defaultImport;
    variables.push(name);
    compiled.push(`${name} = __tmp;`);
  } else {
    const namedImports = identifiers.match(NAMED_IMPORTS);
    if (namedImports) {
      const [full] = namedImports;
      const chunks = full.slice(1, -1).split(",").map((chunk) => {
        const names = chunk.trim().split(AS);
        if (names.length == 1) {
          const [name] = names;
          variables.push(name);
          return name;
        } else if (names.length == 2) {
          const [name, rename] = names;
          variables.push(rename);
          return `${name}: ${rename}`;
        } else {
          throw new Error(`Invalid import: ${code}`);
        }
      });
      compiled.push(`({${chunks.join(",")}} = __tmp);`);
    } else {
      throw new Error(`Invalid import: ${code}`);
    }
  }

  const { dataVarname } = env.options;
  return `let ${variables.join(",")}; {
    let __tmp = await __env.run(${specifier}, {...${dataVarname}}, __file);
    ${compiled.join("\n")}
  }`;
}
