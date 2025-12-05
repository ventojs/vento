import { test } from "./utils.ts";

Deno.test("Default tag", async () => {
  await test({
    template: `
    {{ set greeting = "Hello" }}
    {{ default message = "Hi" }}
    {{ default target = "world" }}
    {{ greeting }} {{ target }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{ default message -}}
      Hi
    {{- /default }}
    {{ default target -}}
      world
    {{- /default }}
    {{ greeting }} {{ target }}
    `,
    expected: "Hello world",
    data: {
      greeting: "Hello",
      target: null,
    },
  });
});

Deno.test("Default tag in strict mode", async () => {
  await test({
    options: { strict: true },
    template: `
    {{ set greeting = "Hello" }}
    {{ default message = "Hi" }}
    {{ default target = "world" }}
    {{ greeting }} {{ target }}
    `,
    expected: "Hello world",
  });

  await test({
    options: { strict: true },
    template: `
    {{ default message -}}
      Hi
    {{- /default }}
    {{ default target -}}
      world
    {{- /default }}
    {{ greeting }} {{ target }}
    `,
    expected: "Hello world",
    data: {
      greeting: "Hello",
      target: null,
    },
  });
});
