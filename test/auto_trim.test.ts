import tmpl from "../mod.ts";
import autoTrim from "../plugins/auto_trim.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";

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
    <a {{ if true }}rel="me"{{ /if }} href="#">text</a>`;

  const env = tmpl();
  env.use(autoTrim());

  const tokens = env.tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>Hello!</h1>\n\n", 0],
    ["tag", "if true", 21],
    ["string", "      <h2>", 34],
    ["tag", "message", 45],
    ["string", "</h2>\n      ", 58],
    ["tag", 'include "footer.vto"', 70],
    ["string", "\n", 96],
    ["tag", "set test = 100", 103],
    ["string", "", 123],
    ["tag", '> let x = "fish"', 130],
    ["string", "      ", 151],
    ["tag", "x", 158],
    ["string", "\n", 165],
    ["tag", "/if", 169],
    ["string", "  \n    ", 178],
    ["tag", "description", 186],
    ["string", "   \n    <a ", 203],
    ["tag", "if true", 214],
    ["string", 'rel="me"', 227],
    ["tag", "/if", 235],
    ["string", ' href="#">text</a>', 244],
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
  ]);
});
