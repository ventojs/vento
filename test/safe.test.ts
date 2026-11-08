import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Safe filter", () => {
  it("Safe filter does not transform input", async () => {
    await test({
      template: `
      {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
      `,
      expected: "<h1>Hello world&lt;/h1&gt;",
    });
  });

  it("Safe filter overrides autoescaping", async () => {
    await test({
      options: {
        autoescape: true,
      },
      template: `
      {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
      `,
      expected: "<h1>Hello world&lt;/h1&gt;",
    });
  });
});
