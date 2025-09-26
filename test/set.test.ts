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
    {{ include "/my-file.vto" }}
    `,
    expected: "Hello World",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
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
    {{- include "/my-file.vto" -}}
    `,
    expected: "Hello WorldHello World",
    includes: {
      "/my-file.vto": `
      {{- set text = "Hello World" -}}
      {{- text -}}
      {{- if it.recursive -}}
      {{- set recursive = false -}}
      {{- include "./my-file.vto" -}}
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

Deno.test("Set with destructuring variables", async () => {
  await test({
    template: `
    {{ set { foo, bar } = { foo: "foo", bar: "bar" } }}
    {{ foo }} {{ bar }}
    `,
    expected: "foo bar",
  });

  await test({
    template: `
    {{ set { one, ...other } = { one: 1, two: 2, three: 3 } }}
    {{ one }} {{ other.two }} {{ other.three }}
    `,
    expected: "1 2 3",
  });

  await test({
    template: `
    {{ set { foo, bar: bar2 } = { foo: "foo", bar: "bar" } }}
    {{ foo }} {{ bar2 }}
    `,
    expected: "foo bar",
  });

  await test({
    template: `
    {{ set [one, two] = ["one", "two"] }}
    {{ one }} {{ two }}
    `,
    expected: "one two",
  });

  await test({
    template: `
    {{ set { a, b: { c, d } } = { a: "A", b: { c: "C", d: "D" } } }}
    {{ a }} {{ c }} {{ d }}
    `,
    expected: "A C D",
  });

  await test({
    template: `
    {{ set [x, [y, z]] = ["X", ["Y", "Z"]] }}
    {{ x }} {{ y }} {{ z }}
    `,
    expected: "X Y Z",
  });

  await test({
    template: `
    {{ set { a, b: { c, d } } = { a: "A", b: { c: "C", d: "D" } } }}
    {{ a }} {{ c }} {{ d }}
    `,
    options: {
      autoDataVarname: false,
    },
    expected: "A C D",
  });

  await test({
    template: `
      {{> const foo = 'local' }}
      {{ set { foo: [bar] } = { foo: [23] } }}
      {{ include "./maybe-foo.vto" }}
    `,
    includes: {
      "/maybe-foo.vto": `Should not print anything: {{ foo }}`,
    },
    expected: "Should not print anything:",
  });
});
