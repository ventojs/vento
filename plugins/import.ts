import type { Environment, Plugin } from "../src/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(importTag);
  };
}

const LEADING_COMMA = /^\s*,\s*/;
const IMPORT_STATEMENT = /^import\b\s*([^]*?)\s*\bfrom\b([^]*)$/;
const DEFAULT_IMPORT = /^\b[a-zA-Z_]\w*\b/i;
const NAMESPACE_IMPORT = /^\*\s*as\s+([a-zA-Z_]\w*)/;
const NAMED_IMPORTS = /^{[^]*?}/;
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
  let source = identifiers;

  const defaultImport = source.match(DEFAULT_IMPORT);
  if (defaultImport) {
    const [name] = defaultImport;
    source = source.slice(name.length).replace(LEADING_COMMA, "");
    variables.push(name);
    compiled.push(`${name} = __tmp.default;`);
  }
  const namespaceImport = source.match(NAMESPACE_IMPORT);
  let namedImports;
  if (namespaceImport) {
    const [full, name] = namespaceImport;
    source = source.slice(full.length).replace(LEADING_COMMA, "");
    variables.push(name);
    compiled.push(`${name} = __tmp;`);
  } else {
    namedImports = source.match(NAMED_IMPORTS);
    if (namedImports) {
      const [full] = namedImports;
      source = source.slice(full.length).trim();
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
    }
  }

  if (source) {
    throw new Error(`Invalid import: ${code}`);
  }

  // For backwards compatibility, if there is only a default import, then it
  // is doing the same as a namespace import. That is, `import foo from '…'` is
  // equivalent to `import * as foo from '…'`.
  if (defaultImport && !namespaceImport && !namedImports) {
    compiled[0] = compiled[0].replace(".default;", ";");
  }

  const { dataVarname } = env.options;
  return `let ${variables.join(",")}; {
    let __tmp = await __env.run(${specifier}, {...${dataVarname}}, __file);
    ${compiled.join("\n")}
  }`;
}
