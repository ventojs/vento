import { describe, it, expect } from "vitest";
import tmpl from "../mod.ts";
import autoTrim from "../plugins/auto_trim.ts";
import { test } from "./utils.ts";
import dedent from "dedent";

describe("Auto trim", () => {
  it("Autotrim (removes newlines correctly)", () => {
    const code = dedent`<h1>Hello!</h1>
  
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
    expect(tokens).toStrictEqual([
      ["string", "<h1>Hello!</h1>\n\n", 0],
      ["tag", "if true", 17],
      ["string", "  <h2>", 30],
      ["tag", "message", 37],
      ["string", "</h2>\n  ", 50],
      ["tag", 'include "footer.vto"', 58],
      ["string", "\n", 84],
      ["tag", "set test = 100", 87],
      ["string", "", 107],
      ["tag", '> let x = "fish"', 110],
      ["string", "  ", 131],
      ["tag", "x", 134],
      ["string", "\n", 141],
      ["tag", "/if", 142],
      ["string", "\n", 151],
      ["tag", "description", 153],
      ["string", "   \n", 170],
      ["tag", "form", 174],
      ["string", "\n<a ", 184],
      ["tag", "if true", 188],
      ["string", 'rel="me"', 201],
      ["tag", "/if", 209],
      ["string", ' href="#">text</a>', 218],
    ]);
  });

  // https://github.com/ventojs/vento/issues/73
  it("Autotrim (no next tokens)", () => {
    const code = "{{ if 1 }}it works{{ /if }}";

    const env = tmpl();
    env.use(autoTrim());

    const tokens = env.tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "", 0],
      ["tag", "if 1", 0],
      ["string", "it works", 10],
      ["tag", "/if", 18],
      ["string", "", 27],
    ]);
  });

  it("Autotrim usage", async () => {
    await test({
      init: (env) => env.use(autoTrim()),
      template: dedent`
      Hello
      {{ set name = "world" }}
      {{ if true }}
        {{ name }}!
      {{ /if }}
      `,
      expected: "Hello\n  world!",
    });
    await test({
      init: (env) => env.use(autoTrim()),
      template: dedent`
      Hello
      {{ set name = "world" }}
      {{ name }}
      {{# Hello world #}}
      `,
      expected: "Hello\nworld",
    });
    await test({
      init: (env) => env.use(autoTrim()),
      template: dedent`
      Hello
      {{# Hello world #}} {{ set name = "world" }}
      {{ name }}
      `,
      expected: "Hello\nworld",
    });
    await test({
      init: (env) => env.use(autoTrim()),
      template: dedent`
      Hello
      {{ set name = "world" |> trim }}
      {{ name }}
      `,
      expected: "Hello\nworld",
    });
    await test({
      init: (env) => env.use(autoTrim()),
      template: dedent`
      -
      {{ for n of [1,2,3] }}
        {{ if n }}
          {{ continue }}
        {{ /if }}
        {{ n }}
      {{ /for }}
      -
      `,
      expected: "-\n-",
    });
    await test({
      init: (env) => env.use(autoTrim()),
      template: dedent`
      -
      {{ for n of [1,2,3] }}
        {{ if n }}
          {{ break }}
        {{ /if }}
        {{ n }}
      {{ /for }}
      -
      `,
      expected: "-\n-",
    });
  });
});
