import { join } from "./utils.ts";
import type { Loader, TemplateSource } from "../core/environment.ts";

/**
 * Vento FileSystem API loader for loading templates.
 * Used by browser environments.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
 */
export class FileSystemLoader implements Loader {
  #handle: FileSystemDirectoryHandle;

  constructor(handle: FileSystemDirectoryHandle) {
    this.#handle = handle;
  }

  async load(file: string): Promise<TemplateSource> {
    const parts = file.split("/");
    let currentHandle: FileSystemDirectoryHandle = this.#handle;

    while (parts.length > 1) {
      const part = parts.shift();
      if (part) {
        currentHandle = await currentHandle.getDirectoryHandle(part, {
          create: false,
        });
      }
    }

    const entry = await currentHandle.getFileHandle(parts[0], {
      create: false,
    });
    const fileHandle = await entry.getFile();
    const source = await fileHandle.text();

    return { source };
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return join(from, "..", file);
    }

    return join(file);
  }
}
