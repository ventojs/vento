import { test } from "./utils.ts";

Deno.test("Print tag", async () => {
  await test({
    template: `
    {{ "Hello world" }}
    `,
    expected: "Hello world",
  });
});

Deno.test("Print tag with variable", async () => {
  await test({
    template: `
    {{ it.message }}
    `,
    expected: "Hello world",
    data: { message: "Hello world" },
  });
});

Deno.test("Print tag with condition", async () => {
  await test({
    template: `
    {{ message || "Hello world" }}
    `,
    expected: "Hello world",
    data: { message: false },
  });

  await test({
    template: `
    {{ message || "Hello world" }}
    `,
    expected: "yes",
    data: { message: "yes" },
  });
});

Deno.test("Print tag with filters", async () => {
  await test({
    template: `
    {{ message |> toUpperCase }}
    `,
    expected: "HELLO WORLD",
    data: { message: "Hello World" },
  });

  await test({
    template: `
    {{ message |> slugify }}
    `,
    expected: "hello-world",
    data: { message: "Hello World" },
    init(env) {
      env.filters.slugify = (value: string) =>
        value.toLowerCase().replace(/\s/g, "-");
    },
  });
});
