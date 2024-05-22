import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { assertThrows } from "https://deno.land/std@0.224.0/assert/assert_throws.ts";
import { extract } from "https://deno.land/std@0.224.0/front_matter/yaml.ts";
import { test as fmTest } from "https://deno.land/std@0.224.0/front_matter/mod.ts";

import { path } from "../deps.ts";

import type { Options } from "../mod.ts";
import type { Environment, Filter } from "../src/environment.ts";
import type { Loader } from "../src/loader.ts";

export interface TestOptions {
  template: string;
  data?: Record<string, unknown>;
  filters?: Record<string, Filter>;
  expected: string;
  init?: (env: Environment) => void;
  includes?: Record<string, string>;
  options?: Options;
}

export function testThrows(options: TestOptions) {
  assertThrows(() => testSync(options));
}

export async function test(options: TestOptions) {
  const env = tmpl({
    includes: new FileLoader(options.includes || {}),
    ...options.options,
  });

  if (options.init) {
    options.init(env);
  }

  if (options.filters) {
    for (const [name, filter] of Object.entries(options.filters)) {
      env.filters[name] = filter;
    }
  }

  const result = await env.runString(options.template, options.data);
  assertEquals(result.content.trim(), options.expected.trim());
}

export function testSync(options: TestOptions) {
  const env = tmpl({
    ...options.options,
  });

  if (options.init) {
    options.init(env);
  }

  if (options.filters) {
    for (const [name, filter] of Object.entries(options.filters)) {
      env.filters[name] = filter;
    }
  }

  const result = env.runStringSync(options.template, options.data);
  assertEquals(result.content.trim(), options.expected.trim());
}

export class FileLoader implements Loader {
  files: Record<string, string> = {};

  constructor(files: Record<string, string>) {
    this.files = files;
  }

  load(file: string) {
    const source = this.files[file] || "";

    if (fmTest(source, ["yaml"])) {
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
      return path.join(path.dirname(from), file).replace(/\\/g, "/");
    }

    return path.join("/", file).replace(/\\/g, "/");
  }
}
