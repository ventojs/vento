import { test } from "./utils.ts";

Deno.test("Escape filter", async () => {
  await test({
    template: `
    {{ "<h1>Hello world</h1>" |> escape }}
    `,
    expected: "&lt;h1&gt;Hello world&lt;/h1&gt;",
  });
});

Deno.test("Escape by default", async () => {
  await test({
    options: {
      autoescape: true,
    },
    template: `
    {{ "<h1>Hello world</h1>" }}
    `,
    expected: "&lt;h1&gt;Hello world&lt;/h1&gt;",
  });
});

Deno.test("Escape non-string", async () => {
  await test({
    template: `
    {{ 100 |> escape }}
    `,
    expected: "100",
  });
});

Deno.test("Escape undefined", async () => {
  await test({
    template: `
    {{ undefined |> escape }}
    `,
    expected: "",
  });
});

Deno.test('Escape JSON', async () => {
  await test({
    template: `
    {{ object |> JSON.stringify |> escape }}
    `,
    expected: "{&quot;bar&quot;:23}",
    data: {
      object: { bar: 23 },
    },
  });
})
