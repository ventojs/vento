import { test } from "./utils.ts";

Deno.test("Imports and exports", async () => {
  await test({
    template: `
    {{ import { hello } from "/my-file.vto" }}
    {{ hello() }} / {{ hello("Vento") }}
    `,
    expected: "Hello world / Hello Vento",
    includes: {
      "/my-file.vto": `
      {{ export function hello (name = "world") }}Hello {{ name }}{{ /export }}
      `,
    },
  });
  await test({
    template: `
    {{ import { hello } from "/my-file.vto" }}
    {{ hello }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.vto": `
      {{ export hello }}Hello {{ name }}{{ /export }}
      `,
    },
  });
  await test({
    template: `
    {{ import { hello } from "/my-file.vto" }}
    {{ hello }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.vto": `
      {{ export hello = "Hello " + name }}
      `,
    },
  });
  await test({
    template: `
    {{ import vars from "/my-file.vto" }}
    {{ vars.hello }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.vto": `
      {{ export hello = "Hello " + name }}
      `,
    },
  });
  await test({
    template: `
    {{ import { hi as hey } from "/my-file.vto" }}
    {{ hey }}
    `,
    expected: "Hello Vento",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.vto": `
      {{ set hello = "Hello " + name }}
      {{ export { hello as hi } }}
      `,
    },
  });
});
