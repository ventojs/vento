import { test } from "./utils.ts";

Deno.test("Function tag (async)", async () => {
  await test({
    template: `
    {{ import { hello } from "/my-file.tmpl" }}
    {{ hello() }} / {{ hello("Vento") }}
    `,
    expected: "Hello world / Hello Vento",
    includes: {
      "/my-file.tmpl": `
      {{ export function hello (name = "world") }}Hello {{ name }}{{ /export }}
      `,
    },
  });
  await test({
    template: `
    {{ import { hello } from "/my-file.tmpl" }}
    {{ hello }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.tmpl": `
      {{ export hello }}Hello {{ name }}{{ /export }}
      `,
    },
  });
  await test({
    template: `
    {{ import { hello } from "/my-file.tmpl" }}
    {{ hello }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.tmpl": `
      {{ export hello = "Hello " + name }}
      `,
    },
  });
  await test({
    template: `
    {{ import vars from "/my-file.tmpl" }}
    {{ vars.hello }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.tmpl": `
      {{ export hello = "Hello " + name }}
      `,
    },
  });
});
