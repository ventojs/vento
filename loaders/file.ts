import path from "node:path";
import fs from "node:fs/promises";
import process from "node:process";
import type { Loader, TemplateSource } from "../core/environment.ts";

/**
 * Vento file loader for loading templates from the file system.
 * Used by Node-like runtimes (Node, Deno, Bun, ...)
 */
export class FileLoader implements Loader {
  #root: string;

  constructor(root: string = process.cwd()) {
    this.#root = root;
  }

  async load(file: string): Promise<TemplateSource> {
    return {
      source: await fs.readFile(file, "utf-8"),
    };
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file);
    }

    if (file.startsWith("/") || file.startsWith(this.#root)) {
      return file;
    }

    return path.join(this.#root, file);
  }
}
