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
