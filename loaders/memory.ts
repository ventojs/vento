import path from "node:path";
import type { Loader, TemplateSource } from "../core/environment.ts";

/**
 * Vento loader for loading templates from an in-memory object.
 * Used for testing or in-memory operations.
 */
export class MemoryLoader implements Loader {
  files: Record<string, string> = {};

  constructor(files: Record<string, string>) {
    this.files = files;
  }

  load(file: string): Promise<TemplateSource> {
    if (!(file in this.files)) {
      throw new Error(`File not found: ${file}`);
    }

    const source = this.files[file];

    return Promise.resolve({ source });
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file).replace(/\\/g, "/");
    }

    return path.join("/", file).replace(/\\/g, "/");
  }
}
