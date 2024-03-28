import { test } from "./utils.ts";

Deno.test("Include tag", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.tmpl" }}
    `,
    expected: "Hello world",
    includes: {
      "/sub/my-file.tmpl": "{{ include './other-file.tmpl' }}",
      "/sub/other-file.tmpl": "Hello world",
    },
  });
});

Deno.test("Include tag (autoescaped enabled)", async () => {
  await test({
    options: {
      autoescape: true,
    },
    template: `
    {{ include "/my-file.tmpl" }}
    `,
    expected: "<strong>Hello world</strong>",
    includes: {
      "/my-file.tmpl": "<strong>Hello world</strong>",
    },
  });

  await test({
    options: {
      autoescape: true,
    },
    template: `
    {{ include "/sub/my-file.tmpl" }}
    `,
    expected: "<strong>Hello world</strong>",
    includes: {
      "/sub/my-file.tmpl": "{{ include './other-file.tmpl' }}",
      "/sub/other-file.tmpl": "<strong>Hello world</strong>",
    },
  });
});

Deno.test("Include tag (with filters)", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" |> toUpperCase }}
    `,
    expected: "HELLO WORLD",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.tmpl" |> replace(" ", "-") }}
    `,
    expected: "HELLO-WORLD",
    includes: {
      "/sub/my-file.tmpl": "{{ include './other-file.tmpl' |> toUpperCase }}",
      "/sub/other-file.tmpl": "Hello world",
    },
  });
});

Deno.test("Include tag (with data)", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello {{ name }}",
    },
    data: {
      name: "world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.tmpl" }}
    `,
    expected: "Hello world",
    includes: {
      "/sub/my-file.tmpl": "{{ include './other-file.tmpl' }}",
      "/sub/other-file.tmpl": "Hello {{ name }}",
    },
    data: {
      name: "world",
    },
  });
});

Deno.test("Include tag (with custom data)", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" {salute: "Good bye"} }}
    `,
    expected: "Good bye world",
    includes: {
      "/my-file.tmpl": "{{ salute }} {{ name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.tmpl" { salute: "Very" + " " + "Welcome"} }}
    `,
    expected: "Very Welcome world Óscar",
    includes: {
      "/sub/my-file.tmpl":
        "{{ include './other-file.tmpl' { name: `${name} Óscar`} }}",
      "/sub/other-file.tmpl": "{{ salute }} {{ name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.tmpl" {
      salute: "Very" + " " + "Welcome"
    } }}
    `,
    expected: "Very Welcome world Óscar",
    includes: {
      "/sub/my-file.tmpl":
        "{{ include './other-file.tmpl' { name: `${name} Óscar`} }}",
      "/sub/other-file.tmpl": "{{ salute }} {{ name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });
});

Deno.test("Include tag (with custom data and filters)", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" {salute: "Good bye"} |> toUpperCase }}
    `,
    expected: "GOOD BYE WORLD",
    includes: {
      "/my-file.tmpl": "{{ salute }} {{ name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });
});

Deno.test("Include tag (with front matter)", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" {salute: "Hello from include"} }}
    `,
    expected: "Hello from include",
    includes: {
      "/my-file.tmpl": `---
salute: Hello from front matter
---
      {{ salute }}
      `,
    },
  });

  await test({
    template: `
    {{ include "/my-file.tmpl" }}
    `,
    expected: "Hello from front matter",
    includes: {
      "/my-file.tmpl": `---
salute: Hello from front matter
---
      {{ salute }}
      `,
    },
  });
});

Deno.test("Include tag dynamically", async () => {
  await test({
    template: `
    {{ include file }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
    data: {
      file: "/my-file.tmpl",
    },
  });

  await test({
    template: `
    {{ include file + ".tmpl" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
    data: {
      file: "/my-file",
    },
  });

  await test({
    template: `
    {{ include \`/\${file}.tmpl\` }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
    data: {
      file: "my-file",
    },
  });
  await test({
    template: `
    {{ include \`/\${file}.tmpl\` { name: name } }}
    `,
    expected: "Hello World",
    includes: {
      "/my-file.tmpl": "Hello {{ name }}",
    },
    data: {
      file: "my-file",
      name: "World",
    },
  });
});

// Test for https://github.com/ventojs/vento/issues/49
Deno.test("Include tag with object shorthand syntax", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" { name } }}
    `,
    expected: "Hello Vento",
    includes: {
      "/my-file.tmpl": "Hello {{ name }}",
    },
    data: {
      name: "Vento",
    },
  });
});
