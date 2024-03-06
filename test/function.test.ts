import { test } from "./utils.ts";

Deno.test("Function tag", async () => {
  await test({
    template: `
    {{ export function hello }}
    Hello world
    {{ /export }}

    {{ hello() }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{ function hello }}
    Hello {{ name }}
    {{ /function }}

    {{ hello() }}
    `,
    expected: "Hello world",
    data: {
      name: "world",
    },
  });

  await test({
    template: `
    {{ function hello (name = "World") }}Hello {{ name }}{{ /function }}

    {{ hello() }} / {{ hello("Vento") }}
    `,
    expected: "Hello World / Hello Vento",
  });
});

Deno.test("Function tag (async)", async () => {
  await test({
    template: `
    {{ async function hello }}
    {{ > const text = await Promise.resolve("Hello world") }}
    {{ text }}
    {{ /function }}

    {{ await hello() }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{ async function file }}
    {{ include "/my-file.tmpl" }}
    {{ /function }}

    {{ await file() }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.tmpl": "Hello world",
    },
  });
});

Deno.test("Function scope is respected", async () => {
  await test({
    template: `
    {{ export function hello }}
    {{ > const message = "Hello world" }}
    {{ /export }}

    {{ message }}
    `,
    expected: "",
  });

  await test({
    template: `
    {{ function hello }}
    {{ > const message = "I shouldn't print" }}
    {{ /function }}

    {{> const message = "Hello world" }}

    {{ message }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{ function hello }}
      {{ function inner }}
        {{> const message = "I shouldn't print" }}
      {{ /function }}
    {{ /function }}

    {{> const message = "Hello world" }}

    {{ message }} / {{ inner ?? "Doesn't exist" }} / {{ hello ? "Exists" : "Doesn't exist" }}
    `,
    expected: "Hello world / Doesn't exist / Exists",
  });

  await test({
    template: `
    {{ function hello(name) -}}
    {{> name = "Hello world!" }}
    {{- name -}}
    {{ /function }}

    {{ name ?? "No name" }} / {{ hello("world") }}
    `,
    expected: "No name / Hello world!",
  });
});
