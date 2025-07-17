import type { Loader, TemplateSource } from "./environment.ts";

export class UrlLoader implements Loader {
  #root: URL;

  constructor(root: URL) {
    this.#root = root;
  }

  async load(file: string): Promise<TemplateSource> {
    const url = new URL(join(this.#root.pathname, file), this.#root);
    const source = await (await fetch(url)).text();

    return { source };
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
