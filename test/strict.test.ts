import { test, TestLoader, testThrows } from "./utils.ts";
import vento from "../mod.ts";
import { expect, it, describe } from "vitest";

describe("Strict mode", () => {
  it("Strict variables", async () => {
    testThrows({
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
    testThrows({
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

  it("Includes still work", async () => {
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

  it("Templates are cached by their keys", async () => {
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
    expect(result1.content).toBe("Hello world.");
    expect(Object.keys(template.strictCache)).toStrictEqual(["{name}"]);
    const result2 = await template({ name: "Óscar", punc: "!" });
    expect(result2.content).toBe("Hello Óscar!");
    expect(Object.keys(template.strictCache)).toStrictEqual(["{name}", "{name,punc}"]);
    const result3 = await template({ punc: "?", name: "Laura" });
    expect(result3.content).toBe("Hello Laura?");
    expect(Object.keys(template.strictCache)).toStrictEqual(["{name}", "{name,punc}"]);
  });
});
