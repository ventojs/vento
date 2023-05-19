import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.188.0/testing/asserts.ts";

import type { Environment } from "../src/environment.ts";

export interface TestOptions {
  template: string;
  data?: Record<string, unknown>;
  expected: string;
  init?: (env: Environment) => void;
}

export async function test(options: TestOptions) {
  const env = tmpl();
  if (options.init) {
    options.init(env);
  }
  const compiled = env.compile(options.template);
  const output = await compiled(options.data);
  assertEquals(output.trim(), options.expected.trim());
}
