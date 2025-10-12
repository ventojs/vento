import tmpl from "../mod.ts";
import autoTrim from "../plugins/auto_trim.ts";
import { assertEquals } from "./utils.ts";
import { test } from "./utils.ts";

Deno.test("Autotrim (removes newlines correctly)", () => {
  const code = `<h1>Hello!</h1>

    {{ if true }}
      <h2>{{ message }}</h2>
      {{ include "footer.vto" }}
      {{ set test = 100 }}
      {{> let x = "fish" }}
      {{ x }}
   {{ /if }}
  
    {{ description }}   
    {{ form }}
    <a {{ if true }}rel="me"{{ /if }} href="#">text</a>`;

  const env = tmpl();
  env.use(autoTrim());

  const tokens = env.tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>Hello!</h1>\n\n", 0],
    ["tag", "if true", 21],
    ["string", "      <h2>", 34],
    ["tag", "message", 45],
    ["string", "</h2>\n      ", 58], // Removed spaces
    ["tag", 'include "footer.vto"', 70],
    ["string", "\n", 96], // Remove newline
    ["tag", "set test = 100", 103],
    ["string", "", 123],
    ["tag", '> let x = "fish"', 130],
    ["string", "      ", 151],
    ["tag", "x", 158],
    ["string", "\n", 165],
    ["tag", "/if", 169],
    ["string", "  \n    ", 178],
    ["tag", "description", 186],
    ["string", "   \n    ", 203],
    ["tag", "form", 211],
    ["string", "\n    <a ", 221],
    ["tag", "if true", 229],
    ["string", 'rel="me"', 242],
    ["tag", "/if", 250],
    ["string", ' href="#">text</a>', 259],
  ]);
});

// https://github.com/ventojs/vento/issues/73
Deno.test("Autotrim (no next tokens)", () => {
  const code = "{{ if 1 }}it works{{ /if }}";

  const env = tmpl();
  env.use(autoTrim());

  const tokens = env.tokenize(code);
  assertEquals(tokens, [
    ["string", "", 0],
    ["tag", "if 1", 0],
    ["string", "it works", 10],
    ["tag", "/if", 18],
    ["string", "", 27],
  ]);
});

Deno.test("Autotrim usage", async () => {
  await test({
    init: env => env.use(autoTrim()),
    template: `
    Hello
    {{ set name = "world" }}
    {{ if true }}
      {{ name }}!
    {{ /if }}
    `,
    expected: "Hello\n      world!",
  });
  await test({
    init: env => env.use(autoTrim()),
    template: `
    Hello
    {{ set name = "world" }}
    {{ name }}
    {{# Hello world #}}
    `,
    expected: "Hello\n    world",
  });
  await test({
    init: env => env.use(autoTrim()),
    template: `
    Hello
    {{# Hello world #}} {{ set name = "world" }}
    {{ name }}
    `,
    expected: "Hello\n    world",
  });
  await test({
    init: env => env.use(autoTrim()),
    template: `
    Hello
    {{ set name = "world" |> trim }}
    {{ name }}
    `,
    expected: "Hello\n    world",
  });
});
