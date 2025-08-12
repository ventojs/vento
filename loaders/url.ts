import { join } from "./utils.ts";
import type { Loader, TemplateSource } from "../core/environment.ts";

/**
 * Vento URL loader for loading templates from a URL.
 * Used by browser environments.
 */
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
      return join(from, "..", file);
    }

    return join(file);
  }
}
