import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Unescape test", () => {
  it("Unescape filter", async () => {
    await test({
      template: `
      {{ "&lt;h1&gt;Hello world&lt;/h1&gt;" |> unescape }}
      `,
      expected: "<h1>Hello world</h1>",
    });
    await test({
      template: `
      {{ "&#x3C;h1&#X03e;Hello world&#60;/h1&#062;" |> unescape }}
      `,
      expected: "<h1>Hello world</h1>",
    });
  });

  it("Unescape with escape by default", async () => {
    await test({
      options: {
        autoescape: true,
      },
      template: `
      {{ "<h1>Hello world</h1>" |> unescape |> safe }}
      `,
      expected: "<h1>Hello world</h1>",
    });
  });

  it("Unescape non-string", async () => {
    await test({
      template: `
      {{ 100 |> unescape }}
      `,
      expected: "100",
    });
  });

  it("Unescape undefined", async () => {
    await test({
      template: `
      {{ undefined |> unescape }}
      `,
      expected: "",
    });
  });
});
