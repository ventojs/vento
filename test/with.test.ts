import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Key variables", () => {
  it("Print key variables", async () => {
    await test({
      template: `{{ message[key] }}`,
      expected: "It works!",
      data: {
        message: {
          foo: "It works!",
        },
        key: "foo",
      },
    });
  });

  it("Assign key variables", async () => {
    await test({
      template: `{{ set foo = "It works!" }}{{ foo }}`,
      expected: "It works!",
    });
    await test({
      template: `
        {{ function echo(message) }}
          {{ message }}
        {{ /function }}
        {{ set foo = "It works!" }}
        {{ echo(foo) }}
        `,
      expected: "It works!",
    });
  });
});
