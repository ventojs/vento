import type {
  Loader,
  PrecompiledTemplate,
  Template,
} from "../core/environment.ts";

/**
 * Vento loader for loading templates from a ES modules.
 * Used to load precompiled templates.
 */
export class ModuleLoader implements Loader {
  #root: URL;

  constructor(root: URL) {
    this.#root = root;
  }

  async load(file: string): Promise<PrecompiledTemplate> {
    const url = new URL(join(this.#root.pathname, file + ".js"), this.#root);
    const module = await import(url.toString());

    return module.default as PrecompiledTemplate;
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return join("/", dirname(from), file);
    }

    return join("/", file);
  }
}

function join(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}

function dirname(path: string): string {
  const lastSlash = path.lastIndexOf("/");
  return lastSlash === -1 ? "." : path.slice(0, lastSlash);
}

export interface ExportOptions {
  source?: boolean;
}

/**
 * Exports a template as a string that can be used in an ES module.
 * This is useful for precompiled templates.
 */
export function exportTemplate(
  template: Template,
  options?: ExportOptions,
): string {
  if (!template.source) {
    throw new Error("Template source is not defined");
  }

  const exportCode = `export default function (__env) {
    ${template.toString()};

    ${
    options?.source
      ? `__template.path = ${
        JSON.stringify(template.path ? template.path + ".js" : undefined)
      };
        __template.code = ${JSON.stringify(template.code)};
        __template.source = ${JSON.stringify(template.source)};
        __template.tokens = ${JSON.stringify(template.tokens)};`
      : ""
  }
    __template.defaults = ${JSON.stringify(template.defaults || {})};

    return __template;
  }`;

  return exportCode;
}
