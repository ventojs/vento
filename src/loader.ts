import { path } from "../deps.ts";

export interface Loader {
  load(file: string): string | Promise<string>;
  resolve(from: string, file: string): string;
}

export class FileLoader implements Loader {
  #root: string;

  constructor(root: string) {
    this.#root = root;
  }

  load(file: string): Promise<string> {
    return Deno.readTextFile(file);
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file);
    }

    return path.join(this.#root, file);
  }
}
