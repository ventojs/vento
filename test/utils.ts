import tmpl from "../mod.ts";
import matter from "@11ty/gray-matter";
import { MemoryLoader } from "../loaders/memory.ts";
import { expect } from "vitest";

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

function getTest(options: TestOptions) {
  const env = tmpl({
    includes: new TestLoader(options.includes || {}),
    ...options.options,
  });

  options.init?.(env);

  if (options.filters) {
    for (const [name, filter] of Object.entries(options.filters)) {
      env.filters[name] = filter;
    }
  }
  return async () => await env.runString(options.template, options.data);
}

export async function testThrows(options: Omit<TestOptions, "expected">) {
  await expect(getTest({ ...options, expected: "" })).rejects.toThrow();
}

export async function test(options: TestOptions) {
  const run = getTest(options);
  const result = await run();
  expect(result.content.trim()).toBe(options.expected.trim());
}

export class TestLoader extends MemoryLoader {
  override async load(file: string) {
    const template = await super.load(file);

    // Extract the YAML front matter if present
    if (matter.test(template.source)) {
      const { content, data } = matter(template.source);

      return {
        source: content,
        data: { ...template.data, ...data },
      };
    }

    return template;
  }
}
