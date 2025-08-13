import { test } from "./utils.ts";

Deno.test("Layout tag", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}Hello world{{ /layout }}
    `,
    expected: "<h1>Hello world</h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
});

Deno.test("Layout tag (with filters)", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>HELLO WORLD</h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>hello world</h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content |> toLowerCase }}</h1>",
    },
  });
});

Deno.test("Layout tag (with extra data)", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" {
      tag: "h1"
    } }}Hello world{{ /layout }}
    `,
    expected: "<h1>Hello world</h1>",
    includes: {
      "/my-file.vto": "<{{ tag }}>{{ content }}</{{ tag }}>",
    },
  });
});

Deno.test("Layout tag (with extra data and filters)", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" {
      tag: "h1"
    } |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>HELLO WORLD</h1>",
    includes: {
      "/my-file.vto": "<{{ tag }}>{{ content }}</{{ tag }}>",
    },
  });
});

Deno.test("Nested layout tags", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}{{ layout "/my-file.vto" }}Hello world{{ /layout }}{{ /layout }}
    `,
    expected: "<h1><h1>Hello world</h1></h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
});

Deno.test("Layout with autoescape", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}Hello <strong>world</strong>{{ /layout }}
    `,
    expected: "<h1>Hello <strong>world</strong></h1>",
    options: {
      autoescape: false,
    },
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" |> toUpperCase }}Hello <strong>world</strong>{{ /layout }}
    `,
    expected: "<h1>HELLO <STRONG>WORLD</STRONG></h1>",
    options: {
      autoescape: true,
    },
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
});
