import { test } from "./utils.ts";

Deno.test("Layout tag", async () => {
  await test({
    template: `
    {{ layout "/my-file.tmpl" }}Hello world{{ /layout }}
    `,
    expected: "<h1>Hello world</h1>",
    includes: {
      "/my-file.tmpl": "<h1>{{ content }}</h1>",
    },
  });
});

Deno.test("Layout tag (with filters)", async () => {
  await test({
    template: `
    {{ layout "/my-file.tmpl" |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>HELLO WORLD</h1>",
    includes: {
      "/my-file.tmpl": "<h1>{{ content }}</h1>",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.tmpl" |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>hello world</h1>",
    includes: {
      "/my-file.tmpl": "<h1>{{ content |> toLowerCase }}</h1>",
    },
  });
});

Deno.test("Layout tag (with extra data)", async () => {
  await test({
    template: `
    {{ layout "/my-file.tmpl" {
      tag: "h1"
    } }}Hello world{{ /layout }}
    `,
    expected: "<h1>Hello world</h1>",
    includes: {
      "/my-file.tmpl": "<{{ tag }}>{{ content }}</{{ tag }}>",
    },
  });
});

Deno.test("Layout tag (with extra data and filters)", async () => {
  await test({
    template: `
    {{ layout "/my-file.tmpl" {
      tag: "h1"
    } |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>HELLO WORLD</h1>",
    includes: {
      "/my-file.tmpl": "<{{ tag }}>{{ content }}</{{ tag }}>",
    },
  });
});

Deno.test("Nested layout tags", async () => {
  await test({
    template: `
    {{ layout "/my-file.tmpl" }}{{ layout "/my-file.tmpl" }}Hello world{{ /layout }}{{ /layout }}
    `,
    expected: "<h1><h1>Hello world</h1></h1>",
    includes: {
      "/my-file.tmpl": "<h1>{{ content }}</h1>",
    },
  });
});
