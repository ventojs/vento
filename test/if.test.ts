import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("if", () => {
  it("If tag (true)", async () => {
    await test({
      template: `
      {{ if true }}
        <p>True</p>
      {{ /if }}
      `,
      expected: "<p>True</p>",
    });
  });

  it("If tag (defined value)", async () => {
    await test({
      template: `
      {{ if name }}
        <p>True</p>
      {{ /if }}
      `,
      expected: "<p>True</p>",
      data: { name: "Óscar" },
    });
    await test({
      template: `
      {{ if name }}
        <p>True</p>
      {{ /if }}
      `,
      expected: "",
      data: { name: false },
    });
  });
  it("If tag (multiline)", async () => {
    await test({
      template: `
      {{ if names
          .length > 0 }}
        <p>True</p>
      {{ /if }}
      `,
      expected: "<p>True</p>",
      data: { names: ["Óscar", "Laura"] },
    });
  });

  it("If / else condition", async () => {
    await test({
      template: `
      {{ if false }}
        <p>Is false</p>
      {{ else }}
        <p>Is true</p>
      {{ /if }}
      `,
      expected: "<p>Is true</p>",
    });
  });

  it("If / else if condition", async () => {
    await test({
      template: `
      {{ if name == "Óscar" }}
        <p>Is Óscar</p>
      {{ else if name == "Laura" }}
        <p>Is Laura</p>
      {{ /if }}
      `,
      expected: "<p>Is Laura</p>",
      data: { name: "Laura" },
    });
    await test({
      template: `
      {{ if name == "Óscar" }}
        <p>Is Óscar</p>
      {{ else if name != "Laura" }}
        <p>Is not Laura</p>
      {{ else }}
        <p>Is Laura</p>
      {{ /if }}
      `,
      expected: "<p>Is Laura</p>",
      data: { name: "Laura" },
    });
  });

  it("If tag with pipes", async () => {
    await test({
      template: `
      {{ if "one" |> isOne }}<p>True</p>{{ /if }}
      {{ if "two" |> isOne }}<p>True</p>{{ /if }}
      `,
      filters: {
        isOne: (value: string) => value === "one",
      },
      expected: "<p>True</p>",
    });
  });
});
