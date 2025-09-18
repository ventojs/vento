import { SourceError } from "../core/errors.ts";
import type { Token } from "../core/tokenizer.ts";
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
  token: Token,
): string | undefined {
  const [, code, position] = token;
  if (!code.startsWith("import ")) {
    return;
  }

  const match = code.match(IMPORT_STATEMENT);
  if (!match) {
    throw new SourceError("Invalid import tag", position);
  }

  const compiled: string[] = [];
  const variables: string[] = [];
  const [, identifiers, specifier] = match;

  const defaultImport = identifiers.match(DEFAULT_IMPORT);
  const tmp = env.getTempVariable()
  if (defaultImport) {
    const [name] = defaultImport;
    variables.push(name);
    compiled.push(`${name} = ${tmp};`);
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
          throw new SourceError("Invalid named import", position);
        }
      });
      compiled.push(`({${chunks.join(",")}} = ${tmp});`);
    } else {
      throw new SourceError("Invalid import tag", position);
    }
  }

  const { dataVarname } = env.options;
  return `let ${variables.join(",")}; {
    let ${tmp} = await __env.run(${specifier}, {...${dataVarname}}, __template.path, ${position});
    ${compiled.join("\n")}
  }`;
}
