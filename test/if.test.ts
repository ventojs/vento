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
});
Deno.test("If tag (multiline)", async () => {
  await test({
    template: `
    {{ if names
        .length > 0 }}
      <p>True</p>
    {{ /if }}
    `,
    expected: "<p>True</p>",
    data: { names: ["Óscar", "Laura"] },
  });
});

Deno.test("If / else condition", async () => {
  await test({
    template: `
    {{ if false }}
      <p>Is false</p>
    {{ else }}
      <p>Is true</p>
    {{ /if }}
    `,
    expected: "<p>Is true</p>",
  });
});

Deno.test("If / else if condition", async () => {
  await test({
    template: `
    {{ if name == "Óscar" }}
      <p>Is Óscar</p>
    {{ else if name == "Laura" }}
      <p>Is Laura</p>
    {{ /if }}
    `,
    expected: "<p>Is Laura</p>",
    data: { name: "Laura" },
  });
  await test({
    template: `
    {{ if name == "Óscar" }}
      <p>Is Óscar</p>
    {{ else if name != "Laura" }}
      <p>Is not Laura</p>
    {{ else }}
      <p>Is Laura</p>
    {{ /if }}
    `,
    expected: "<p>Is Laura</p>",
    data: { name: "Laura" },
  });
});

Deno.test("If tag with pipes", async () => {
  await test({
    template: `
    {{ if "one" |> isOne }}<p>True</p>{{ /if }}
    {{ if "two" |> isOne }}<p>True</p>{{ /if }}
    `,
    filters: {
      isOne: (value: string) => value === "one",
    },
    expected: "<p>True</p>",
  });
});
