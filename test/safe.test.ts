import { test, testSync } from "./utils.ts";

Deno.test("Safe filter does not transform input", async () => {
  await test({
    template: `
    {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
    `,
    expected: "<h1>Hello world&lt;/h1&gt;",
  });
  testSync({
    template: `
    {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
    `,
    expected: "<h1>Hello world&lt;/h1&gt;",
  });
});

Deno.test("Safe filter overrides autoescaping", async () => {
  await test({
    options: {
      autoescape: true,
    },
    template: `
    {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
    `,
    expected: "<h1>Hello world&lt;/h1&gt;",
  });
  testSync({
    options: {
      autoescape: true,
    },
    template: `
    {{ "<h1>Hello world</h1>" |> safe }}
    `,
    expected: "<h1>Hello world</h1>",
  });
});
