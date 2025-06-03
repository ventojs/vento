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
  await test({
    template: `
    {{> url = 'abc' }}
    {{ if path }}{{ set url = path }}{{ /if }}
    My url value is {{ url }}
    `,
    expected: "My url value is abc",
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

Deno.test("Set tag in a loop", async () => {
  await test({
    template: `
    {{- for item of items -}}
    <div>
      {{- set description -}}
        <p>{{ item.description }}</p>
      {{- /set -}}

      <h1>{{ item.name }}</h1>
      {{- description -}}
    </div>
    {{- /for -}}
    `,
    expected:
      "<div><h1>Name 1</h1><p>Description 1</p></div><div><h1>Name 2</h1><p>Description 2</p></div><div><h1>Name 3</h1><p>Description 3</p></div>",
    data: {
      items: [
        { name: "Name 1", description: "Description 1" },
        { name: "Name 2", description: "Description 2" },
        { name: "Name 3", description: "Description 3" },
      ],
    },
  });
});
