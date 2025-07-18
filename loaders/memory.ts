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
    const source = this.files[file] || "";

    return Promise.resolve({ source });
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return join(dirname(from), file).replace(/\\/g, "/");
    }

    return join("/", file).replace(/\\/g, "/");
  }
}

function join(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}

function dirname(path: string): string {
  const lastSlash = path.lastIndexOf("/");
  return lastSlash === -1 ? "." : path.slice(0, lastSlash);
}
