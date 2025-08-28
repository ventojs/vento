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
  #extension: string;

  constructor(root: URL, extension = ".js") {
    this.#root = root;
    this.#extension = extension;
  }

  async load(file: string): Promise<PrecompiledTemplate> {
    const url = new URL(
      join(this.#root.pathname, file + this.#extension),
      this.#root,
    );
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
  extension?: ".js" | ".mjs";
}

/**
 * Exports a template as a string that can be used in an ES module.
 * This is useful for precompiled templates.
 * @returns A tuple with the path and the content of the module.
 */
export function exportTemplate(
  template: Template,
  options?: ExportOptions,
): [string, string] {
  if (!template.source) {
    throw new Error("Template source is not defined");
  }
  if (!template.path) {
    throw new Error("Template path is not defined");
  }

  const content = `export default function (__env) {
    ${template.toString()};

    ${
    options?.source
      ? `__template.path = ${JSON.stringify(template.path)};
        __template.code = ${JSON.stringify(template.code)};
        __template.source = ${JSON.stringify(template.source)};`
      : ""
  }
    __template.defaults = ${JSON.stringify(template.defaults || {})};

    return __template;
  }`;

  return [`${template.path}${options?.extension ?? ".js"}`, content];
}
