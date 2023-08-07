import { test } from "./utils.ts";

Deno.test("Function tag", async () => {
  await test({
    template: `
    {{ export function hello }}
    Hello world
    {{ /function }}

    {{ hello() }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{ function hello }}
    Hello {{ name }}
    {{ /function }}

    {{ hello() }}
    `,
    expected: "Hello world",
    data: {
      name: "world",
    },
  });

  await test({
    template: `
    {{ function hello (name = "World") }}Hello {{ name }}{{ /function }}

    {{ hello() }} / {{ hello("Vento") }}
    `,
    expected: "Hello World / Hello Vento",
  });
});

Deno.test("Function tag (async)", async () => {
  await test({
    template: `
    {{ async function hello }}
    {{ > const text = await Promise.resolve("Hello world") }}
    {{ text }}
    {{ /function }}

    {{ await hello() }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{ async function file }}
    {{ include "/my-file.tmpl" }}
    {{ /function }}

    {{ await file() }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
  });
});
