import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Escape", () => {
  it("Escape filter", async () => {
    await test({
      template: `
      {{ "<h1>Hello world</h1>" |> escape }}
      `,
      expected: "&lt;h1&gt;Hello world&lt;/h1&gt;",
    });
  });

  it("Escape by default", async () => {
    await test({
      options: {
        autoescape: true,
      },
      template: `
      {{ "<h1>Hello world</h1>" }}
      `,
      expected: "&lt;h1&gt;Hello world&lt;/h1&gt;",
    });
  });

  it("Escape non-string", async () => {
    await test({
      template: `
      {{ 100 |> escape }}
      `,
      expected: "100",
    });
  });

  it("Escape undefined", async () => {
    await test({
      template: `
      {{ undefined |> escape }}
      `,
      expected: "",
    });
  });

  it("Escape JSON", async () => {
    await test({
      template: `
      {{ object |> JSON.stringify |> escape }}
      `,
      expected: "{&quot;bar&quot;:23}",
      data: {
        object: { bar: 23 },
      },
    });
  });
});
