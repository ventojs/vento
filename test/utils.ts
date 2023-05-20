import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.188.0/testing/asserts.ts";
import { path } from "../deps.ts";

import type { Environment } from "../src/environment.ts";
import type { Loader } from "../src/loader.ts";

export interface TestOptions {
  template: string;
  data?: Record<string, unknown>;
  expected: string;
  init?: (env: Environment) => void;
  includes?: Record<string, string>;
}

export async function test(options: TestOptions) {
  const env = tmpl({
    includes: new FileLoader(options.includes || {}),
  });

  if (options.init) {
    options.init(env);
  }
  const compiled = env.compile(options.template);
  const output = await compiled(options.data);
  assertEquals(output.trim(), options.expected.trim());
}

export class FileLoader implements Loader {
  files: Record<string, string> = {};

  constructor(files: Record<string, string>) {
    this.files = files;
  }

  load(file: string): string {
    return this.files[file] || "";
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file);
    }

    return path.join("/", file);
  }
}
