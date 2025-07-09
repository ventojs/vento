import { test } from "./utils.ts";

Deno.test("Imports and exports", async () => {
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
  await test({
    template: `
    {{ import * as vars from "/my-file.tmpl" }}
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
  await test({
    template: `
    {{ import { hello as hi } from "/my-file.tmpl" }}
    {{ hi }}
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
    {{ import target, { greeting } from "/my-file.tmpl" }}
    {{ greeting }} {{ target }}
    `,
    expected: "Hello Vento",
    includes: {
      "/my-file.tmpl": `
      {{ export greeting = "Hello" }}
      {{ export default "Vento" }}
      `,
    },
  });
  await test({
    template: `
    {{ import hello, { punctuation } from "/my-file.tmpl" }}
    {{ hello }}{{ punctuation }}
    `,
    expected: "Hello Vento!",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.tmpl": `
      {{ export punctuation }}!{{ /export }}
      {{ export default }}Hello {{ name }}{{ /export }}
      `,
    },
  });
  await test({
    template: `
    {{ import target, * as tmpl from "/my-file.tmpl" }}
    {{ tmpl.greeting }} {{ target }}
    `,
    expected: "Hello Vento",
    includes: {
      "/my-file.tmpl": `
      {{ export greeting = "Hello" }}
      {{ export default "Vento" }}
      `,
    },
  });
  await test({
    template: `
    {{ import target, { greeting, punc } from "/my-file.tmpl" }}
    {{ greeting }} {{ target }}{{ punc }}
    `,
    expected: "Hello Vento!",
    data: {
      name: "Vento",
    },
    includes: {
      "/my-file.tmpl": `
      {{> const greeting = "Hello" }}
      {{ set punctuation = "!" }}
      {{ export { greeting, name as default, punctuation as punc } }}
      `,
    },
  });
});
