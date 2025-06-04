import { posix } from "../deps.ts";

import type { Loader, TemplateSource } from "./environment.ts";

export class UrlLoader implements Loader {
  #root: URL;

  constructor(root: URL) {
    this.#root = root;
  }

  async load(file: string): Promise<TemplateSource> {
    const url = new URL(posix.join(this.#root.pathname, file), this.#root);
    const source = await (await fetch(url)).text();

    return { source };
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return posix.join("/", posix.dirname(from), file);
    }

    return posix.join("/", file);
  }
}
