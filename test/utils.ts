import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { assertThrows } from "https://deno.land/std@0.224.0/assert/assert_throws.ts";
import { extract } from "https://deno.land/std@0.224.0/front_matter/yaml.ts";
import { test as fmTest } from "https://deno.land/std@0.224.0/front_matter/mod.ts";
import { MemoryLoader } from "../loaders/memory.ts";

import type { Options } from "../mod.ts";
import type { Environment, Filter } from "../core/environment.ts";

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
    includes: new TestLoader(options.includes || {}),
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

export class TestLoader extends MemoryLoader {
  override async load(file: string) {
    const tmpl = await super.load(file);

    // Extract the YAML front matter if present
    if (fmTest(tmpl.source, ["yaml"])) {
      const { body, attrs } = extract<Record<string, unknown>>(tmpl.source);
      return Promise.resolve({
        source: body,
        data: { attrs, ...tmpl.data },
      });
    }

    return tmpl;
  }
}
