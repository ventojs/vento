import { test } from "./utils.ts";

Deno.test("Raw tag", async () => {
  await test({
    template: `
    {{raw}} Hello world {{/raw}}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{raw}} Hello {{ world }} {{/raw}}
    `,
    expected: "Hello {{ world }}",
  });
});
