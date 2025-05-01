import path from "node:path";
import fs from "node:fs/promises";
import process from "node:process";

export interface TemplateSource {
  source: string;
  data?: Record<string, unknown>;
}

export interface Loader {
  load(file: string): TemplateSource | Promise<TemplateSource>;
  resolve(from: string, file: string): string;
}

export class FileLoader implements Loader {
  #root: string;

  constructor(root = process.cwd()) {
    this.#root = root;
  }

  async load(file: string): Promise<TemplateSource> {
    return {
      source: await fs.readFile(file, { encoding: "utf-8" }),
    };
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file);
    }

    if (file.startsWith(this.#root)) {
      return file;
    }

    return path.join(this.#root, file);
  }
}
