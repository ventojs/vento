import { test } from "./utils.ts";

Deno.test("Include tag", async () => {
  await test({
    template: `
    {{ include "/my-file.vto" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.vto" }}
    `,
    expected: "Hello world",
    includes: {
      "/sub/my-file.vto": "{{ include './other-file.vto' }}",
      "/sub/other-file.vto": "Hello world",
    },
  });
});

Deno.test("Include tag (autoescaped enabled)", async () => {
  await test({
    options: {
      autoescape: true,
    },
    template: `
    {{ include "/my-file.vto" }}
    `,
    expected: "<strong>Hello world</strong>",
    includes: {
      "/my-file.vto": "<strong>Hello world</strong>",
    },
  });

  await test({
    options: {
      autoescape: true,
    },
    template: `
    {{ include "/sub/my-file.vto" }}
    `,
    expected: "<strong>Hello world</strong>",
    includes: {
      "/sub/my-file.vto": "{{ include './other-file.vto' }}",
      "/sub/other-file.vto": "<strong>Hello world</strong>",
    },
  });
});

Deno.test("Include tag (with filters)", async () => {
  await test({
    template: `
    {{ include "/my-file.vto" |> toUpperCase }}
    `,
    expected: "HELLO WORLD",
    includes: {
      "/my-file.vto": "Hello world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.vto" |> replace(" ", "-") }}
    `,
    expected: "HELLO-WORLD",
    includes: {
      "/sub/my-file.vto": "{{ include './other-file.vto' |> toUpperCase }}",
      "/sub/other-file.vto": "Hello world",
    },
  });
});

Deno.test("Include tag (with data)", async () => {
  await test({
    template: `
    {{ include "/my-file.vto" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
    },
    data: {
      name: "world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.vto" }}
    `,
    expected: "Hello world",
    includes: {
      "/sub/my-file.vto": "{{ include './other-file.vto' }}",
      "/sub/other-file.vto": "Hello {{ name }}",
    },
    data: {
      name: "world",
    },
  });

  await test({
    template: `
    {{ set data = { name } }}
    {{ include "/my-file.vto" data }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
    },
    data: {
      name: "world",
    },
  });

  await test({
    template: `
    {{ set data = { name } }}
    {{ include "/my-file" + ext data }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
    },
    data: {
      ext: ".vto",
      name: "world",
    },
  });
});

Deno.test("Include tag (with custom data)", async () => {
  await test({
    template: `
    {{ include "/my-file.vto" {salute: "Good bye"} }}
    `,
    expected: "Good bye world",
    includes: {
      "/my-file.vto": "{{ salute }} {{ name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.vto" { salute: "Very" + " " + "Welcome"} }}
    `,
    expected: "Very Welcome world Óscar",
    includes: {
      "/sub/my-file.vto":
        "{{ include './other-file.vto' { name: `${name} Óscar`} }}",
      "/sub/other-file.vto": "{{ salute }} {{ name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });

  await test({
    template: `
    {{ include "/sub/my-file.vto" {
      salute: "Very" + " " + "Welcome"
    } }}
    `,
    expected: "Very Welcome world Óscar",
    includes: {
      "/sub/my-file.vto":
        "{{ include './other-file.vto' { name: `${name} Óscar`} }}",
      "/sub/other-file.vto": "{{ salute }} {{ name }}",
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
    {{ include "/my-file.vto" {salute: "Good bye"} |> toUpperCase }}
    `,
    expected: "GOOD BYE WORLD",
    includes: {
      "/my-file.vto": "{{ salute }} {{ name }}",
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
    {{ include "/my-file.vto" {salute: "Hello from include"} }}
    `,
    expected: "Hello from include",
    includes: {
      "/my-file.vto": `---
salute: Hello from front matter
---
      {{ salute }}
      `,
    },
  });

  await test({
    template: `
    {{ include "/my-file.vto" }}
    `,
    expected: "Hello from front matter",
    includes: {
      "/my-file.vto": `---
salute: Hello from front matter
---
      {{ salute }}
      `,
    },
  });
});

Deno.test("Include tag (with global-conflicting data)", async () => {
  await test({
    template: `
    {{ include "/my-file.vto" {performance: 'good'} }}
    `,
    expected: "[object Performance]",
    includes: {
      "/my-file.vto": "{{ performance }}",
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
      "/my-file.vto": "Hello world",
    },
    data: {
      file: "/my-file.vto",
    },
  });

  await test({
    template: `
    {{ include file + ".vto" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello world",
    },
    data: {
      file: "/my-file",
    },
  });

  await test({
    template: `
    {{ include \`/\${file}.vto\` }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello world",
    },
    data: {
      file: "my-file",
    },
  });
  await test({
    template: `
    {{ include \`/\${file}.vto\` { name: name } }}
    `,
    expected: "Hello World",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
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
    {{ include "/my-file.vto" { name } }}
    `,
    expected: "Hello Vento",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
    },
    data: {
      name: "Vento",
    },
  });
});

Deno.test("Include tag with semi-ambiguous JS objects", async () => {
  await test({
    template: `
    {{> const resolve = ({path}) => path; }}
    {{ include resolve({ path: "/my-file.vto" }) { name } }}
    `,
    expected: "Hello Vento",
    includes: {
      "/my-file.vto": "Hello {{ name }}",
    },
    data: {
      name: "Vento",
    },
  });
});
