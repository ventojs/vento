import { path } from "../deps.ts";

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

  constructor(root: string) {
    this.#root = root;
  }

  async load(file: string): Promise<TemplateSource> {
    return {
      source: await Deno.readTextFile(file),
    };
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file);
    }

    return path.join(this.#root, file);
  }
}
