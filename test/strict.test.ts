import { assertEquals, test, TestLoader, testThrows } from "./utils.ts";
import vento from "../mod.ts";

Deno.test("Strict variables", async () => {
  await testThrows({
    options: { strict: true },
    template: `
      {{ hello }}
    `,
  });
  await test({
    options: { strict: true },
    template: `
    {{ if false }}{{ hello }}{{ /if }}
    `,
    expected: "",
  });
  await testThrows({
    options: { strict: true },
    template: `
    {{ if true }}
      {{> const hello = 'world' }}
    {{ /if }}
    {{ hello }}
    `,
  });
  await test({
    options: { strict: true },
    template: `
    {{ if true }}
      {{> const hello = 'world' }}
      Hello {{ hello }}
    {{ /if }}
    `,
    expected: "Hello world",
  });
  await test({
    options: { strict: true },
    template: `
      {{ message }}
    `,
    data: { message: "Hello world" },
    expected: "Hello world",
  });
  await test({
    options: { strict: true },
    template: `
      {{ set message = "Hello world" }}
      {{ message }}
    `,
    expected: "Hello world",
  });
});

Deno.test("Includes still work", async () => {
  await test({
    options: { strict: true },
    template: `
    {{ include "/my-file.vto" }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "Hello world",
    },
  });
});

Deno.test("Templates are cached by their keys", async () => {
  const source = `
    {{- default punc = '.' -}}
    Hello {{ name }}{{ punc -}}
  `;
  const env = vento({
    strict: true,
    includes: new TestLoader({ "/tmpl.vto": source }),
  });
  const template = await env.load("/tmpl.vto");
  const result1 = await template({ name: "world" });
  assertEquals(result1.content, "Hello world.");
  assertEquals(Object.keys(template.strictCache), ["{name}"]);
  const result2 = await template({ name: "Óscar", punc: "!" });
  assertEquals(result2.content, "Hello Óscar!");
  assertEquals(Object.keys(template.strictCache), ["{name}", "{name,punc}"]);
  const result3 = await template({ punc: "?", name: "Laura" });
  assertEquals(result3.content, "Hello Laura?");
  assertEquals(Object.keys(template.strictCache), ["{name}", "{name,punc}"]);
});
