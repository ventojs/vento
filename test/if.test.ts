import { test } from "./utils.ts";

Deno.test("If tag (true)", async () => {
  await test({
    template: `
    {{ if true }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "<p>True</p>",
  });
});

Deno.test("If tag (undefined)", async () => {
  await test({
    template: `
    {{ if foo }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "",
  });
  await test({
    template: `
    {{ if foo?.foo }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "",
  });
});

Deno.test("If tag (undefined negative)", async () => {
  await test({
    template: `
    {{ if !foo }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "<p>True</p>",
  });
  await test({
    template: `
    {{ if !foo.foo }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "<p>True</p>",
  });
});

Deno.test("If tag (defined value)", async () => {
  await test({
    template: `
    {{ if name }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "<p>True</p>",
    data: { name: "Óscar" },
  });
  await test({
    template: `
    {{ if name }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "",
    data: { name: false },
  });
  await test({
    template: `
    {{ if !name.length }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "<p>True</p>",
    data: { name: [] },
  });
});
