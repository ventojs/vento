import { join } from "./utils.ts";
import type { Loader, TemplateSource } from "../core/environment.ts";

/**
 * Vento loader for loading templates from an in-memory object.
 * Used for testing or in-memory operations.
 */
export class MemoryLoader implements Loader {
  files: Map<string, string>;

  constructor(files: Record<string, string>) {
    this.files = new Map(Object.entries(files));
  }

  load(file: string): Promise<TemplateSource> {
    const source = this.files.get(file);
    if (source === undefined) {
      throw new Error(`File not found: ${file}`);
    }

    return Promise.resolve({ source });
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return join(from, "..", file);
    }

    return join(file);
  }
}
