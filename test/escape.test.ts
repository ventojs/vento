import { test, testSync } from "./utils.ts";

Deno.test("Escape filter", async () => {
  await test({
    template: `
    {{ "<h1>Hello world</h1>" |> escape }}
    `,
    expected: "&lt;h1&gt;Hello world&lt;/h1&gt;",
  });
  testSync({
    template: `
    {{ "<h1>Hello world</h1>" |> escape }}
    `,
    expected: "&lt;h1&gt;Hello world&lt;/h1&gt;",
  });
});
