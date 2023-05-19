import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.188.0/testing/asserts.ts";

export interface TestOptions {
  template: string;
  data?: Record<string, unknown>;
  expected: string;
}

export async function test(options: TestOptions) {
  const env = tmpl();
  const compiled = env.compile(options.template);
  const output = await compiled(options.data);
  assertEquals(output.trim(), options.expected.trim());
}
