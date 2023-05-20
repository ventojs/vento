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

Deno.test("Include tag (with data)", async () => {
  await test({
    template: `
    {{ include "/my-file.tmpl" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello {{ =name }}",
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
      "/sub/other-file.tmpl": "Hello {{ =name }}",
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
      "/my-file.tmpl": "{{ =salute }} {{ =name }}",
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
      "/sub/other-file.tmpl": "{{= salute }} {{ =name }}",
    },
    data: {
      salute: "Hello",
      name: "world",
    },
  });
});
