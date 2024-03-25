import { test } from "./utils.ts";

Deno.test("Set tag", async () => {
  await test({
    template: `
    {{ set message = "Hello world" }}
    {{ message }}
    `,
    expected: "Hello world",
  });
  await test({
    template: `
    {{ set message }}
      Hello world
    {{ /set }}

    {{ message }}
    `,
    expected: "Hello world",
  });
});

Deno.test("Set tag with complex", async () => {
  await test({
    template: `
    {{ set message = ["Hello", "world"].join(" ") }}
    {{ message }}
    `,
    expected: "Hello world",
  });
  await test({
    template: `
    {{ set message }}
      Hello {{ if true }}world{{ /if }}
    {{ /set }}

    {{ message }}
    `,
    expected: "Hello world",
  });
});

Deno.test("Set tag with filters", async () => {
  await test({
    template: `
    {{ set message = ["Hello", "world"] |> join(" ") }}
    {{ message }}
    `,
    expected: "Hello world",
  });
  await test({
    template: `
    {{ set message |> toUpperCase }}
      Hello {{ if true }}world{{ /if }}
    {{ /set }}

    {{ message }}
    `,
    expected: "HELLO WORLD",
  });
  // Test for https://github.com/oscarotero/vento/issues/8
  await test({
    template: `
    {{ set foo = arr.filter(a => a !== 'bar') |> filt }}

    {{ foo }}
    `,
    expected: "FOO BAZ",
    data: {
      arr: ["foo", "bar", "baz"],
    },
    filters: {
      filt: (arr: string[]) => arr.map((a) => a.toUpperCase()).join(" "),
    },
  });
});

Deno.test("Set tag with includes", async () => {
  await test({
    template: `
    {{ set name = "World" }}
    {{ include "/my-file.tmpl" }}
    `,
    expected: "Hello World",
    includes: {
      "/my-file.tmpl": "Hello {{ name }}",
    },
  });
  await test({
    template: `
    {{ set text = toUpperCase(\`type=tag\`) }}
    {{ text }}
    `,
    expected: "TYPE=TAG",
    data: {
      toUpperCase: (text: string) => text.toUpperCase(),
    },
  });
  await test({
    template: `
    {{ set text = toUpperCase(
      \`type=tag\`
    ) }}
    {{ text }}
    `,
    expected: "TYPE=TAG",
    data: {
      toUpperCase: (text: string) => text.toUpperCase(),
    },
  });
  await test({
    template: `
    {{- set recursive = true -}}
    {{- include "/my-file.tmpl" -}}
    `,
    expected: "Hello WorldHello World",
    includes: {
      "/my-file.tmpl": `
      {{- set text = "Hello World" -}}
      {{- text -}}
      {{- if it.recursive -}}
      {{- set recursive = false -}}
      {{- include "./my-file.tmpl" -}}
      {{- /if -}}
      `,
    },
  });
});
