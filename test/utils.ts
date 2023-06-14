import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  extract,
  test as fmTest,
} from "https://deno.land/std@0.190.0/front_matter/yaml.ts";

import { path } from "../deps.ts";

import type { Environment, Filter } from "../src/environment.ts";
import type { Loader } from "../src/loader.ts";

export interface TestOptions {
  template: string;
  data?: Record<string, unknown>;
  filters?: Record<string, Filter>;
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

  if (options.filters) {
    for (const [name, filter] of Object.entries(options.filters)) {
      env.filters[name] = filter;
    }
  }

  const output = await env.runString(options.template, options.data);
  assertEquals(output.trim(), options.expected.trim());
}

export class FileLoader implements Loader {
  files: Record<string, string> = {};

  constructor(files: Record<string, string>) {
    this.files = files;
  }

  load(file: string) {
    const source = this.files[file] || "";

    if (fmTest(source)) {
      const { body, attrs } = extract(source);
      return {
        source: body,
        data: attrs,
      };
    }

    return { source };
  }

  resolve(from: string, file: string): string {
    if (file.startsWith(".")) {
      return path.join(path.dirname(from), file);
    }

    return path.join("/", file);
  }
}
