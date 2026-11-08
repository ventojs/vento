import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Print tag", () => {
  it("Print tag", async () => {
    await test({
      template: `
      {{ "Hello world" }}
      `,
      expected: "Hello world",
    });
    await test({
      template: `
      {{ undefined }}
      `,
      expected: "",
    });
    await test({
      template: `
      {{ null }}
      `,
      expected: "",
    });
  });

  it("Print tag with variable", async () => {
    await test({
      template: `
      {{ it.message }}
      `,
      expected: "Hello world",
      data: { message: "Hello world" },
    });
    await test({
      template: `
      {{ message }}
      `,
      expected: "Hello world",
      data: { message: "Hello world" },
    });
    await test({
      template: `
      {{ m }}
      `,
      expected: "Hello world",
      data: { m: "Hello world" },
    });
  });

  it("Print tag with condition", async () => {
    await test({
      template: `
      {{ message || "Hello world" }}
      `,
      expected: "Hello world",
      data: { message: false },
    });

    await test({
      template: `
      {{ message || "Hello world" }}
      `,
      expected: "yes",
      data: { message: "yes" },
    });
  });

  it("Print tag with filters", async () => {
    await test({
      template: `
      {{ message |> toUpperCase }}
      `,
      expected: "HELLO WORLD",
      data: { message: "Hello World" },
    });

    await test({
      template: `
      {{ message |> toString |> toUpperCase }}
      `,
      expected: "12",
      data: { message: 12 },
    });

    await test({
      template: `
      {{ message |> toString |> toUpperCase }}
      `,
      expected: "",
    });

    await test({
      template: `
      {{ message |> slugify }}
      `,
      expected: "hello-world",
      data: { message: "Hello World" },
      init(env) {
        env.filters.slugify = (value: string) => value.toLowerCase().replace(/\s/g, "-");
      },
    });
  });

  it("Print trim", async () => {
    await test({
      template: `Hello {{- "World" }} !`,
      expected: "HelloWorld !",
    });

    await test({
      template: `Hello {{ "World" -}} !`,
      expected: "Hello World!",
    });

    await test({
      template: `Hello {{- "World" -}} !`,
      expected: "HelloWorld!",
    });

    await test({
      template: `
      {{> let foo = -2 }}
      1 + 1 = {{--foo}}
      `,
      expected: "1 + 1 =2",
    });
  });

  it("Print trim with filter", async () => {
    await test({
      template: `Hello {{- "World" |> toUpperCase }} !`,
      expected: "HelloWORLD !",
    });

    await test({
      template: `Hello {{ "World" |> toUpperCase -}} !`,
      expected: "Hello WORLD!",
    });

    await test({
      template: `Hello {{- "World" |> toUpperCase -}} !`,
      expected: "HelloWORLD!",
    });
  });

  // Test for https://github.com/oscarotero/vento/issues/26
  it("Print ternary", async () => {
    await test({
      template: `{{ message ? "yes" : "no" }}`,
      expected: "yes",
      data: { message: "yes" },
    });

    await test({
      template: `{{ message ? "yes" : "no" }}`,
      expected: "no",
      data: { message: false },
    });

    await test({
      template: `{{ message ? "yes" : "no" }}`,
      expected: "no",
      data: { message: null },
    });

    await test({
      template: `{{ message ? "yes" : "no" }}`,
      expected: "no",
      data: {},
    });
  });

  // Test for https://github.com/oscarotero/vento/issues/26
  it("Print nullish coalescing", async () => {
    await test({
      template: `{{ message ?? "no" }}`,
      expected: "yes",
      data: { message: "yes" },
    });

    await test({
      template: `{{ message ?? "no" }}`,
      expected: "no",
      data: {},
    });
  });

  it("Print array", async () => {
    await test({
      template: `{{ messages[0] }}`,
      expected: "yes",
      data: { messages: ["yes", "no"] },
    });
  });

  it("Print undeclared variable", async () => {
    await test({
      template: `{{ foo }}`,
      expected: "",
    });
  });
});
