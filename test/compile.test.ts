import { describe, it } from "vitest";
import { test } from "./utils.ts";

describe("Compiler", () => {
  it("Strings with dangerous characters", async () => {
    await test({
      template: "<h1>Test</h1><script>let name = 'Gandalf'; console.log(`Hi ${name}.`);</script>",
      expected: "<h1>Test</h1><script>let name = 'Gandalf'; console.log(`Hi ${name}.`);</script>",
    });
    await test({
      template: '<h1>Test</h1><script>let name = "Gandalf"; console.log(`Hi ${name}.`);</script>',
      expected: '<h1>Test</h1><script>let name = "Gandalf"; console.log(`Hi ${name}.`);</script>',
    });
    await test({
      template: '<h1>Test</h1><script>let name = "Gandalf"; console.log(`Hi ${name}.`);</script>',
      expected: '<h1>Test</h1><script>let name = "Gandalf"; console.log(`Hi ${name}.`);</script>',
    });
    await test({
      template: "\\`",
      expected: "\\`",
    });
  });

  it("Empty string", async () => {
    await test({
      template: "",
      expected: "",
    });
    await test({
      template: "{{> /* empty */}}",
      expected: "",
    });
    await test({
      template: "{{# empty #}}",
      expected: "",
    });
  });
});
