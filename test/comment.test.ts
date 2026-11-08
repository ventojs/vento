import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Commens", () => {
  it("Comment tag", async () => {
    await test({
      template: `
      {{# "Hello world" #}}
      `,
      expected: "",
    });
    await test({
      template: `
      <h1> {{# {{ title }} {{#}}
      `,
      expected: "<h1> ",
    });
  });

  it("Comment tag with trimming", async () => {
    await test({
      template: `
      <h1> {{#- #}} </h1>
      `,
      expected: "<h1> </h1>",
    });
    await test({
      template: `
      <h1> {{#- -#}} </h1>
      `,
      expected: "<h1></h1>",
    });

    await test({
      template: `
      <h1> {{#-#}}    </h1>
      `,
      expected: "<h1>    </h1>",
    });
  });
});
