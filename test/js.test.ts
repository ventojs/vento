import { test } from "./utils.ts";

Deno.test("> tag", async () => {
  await test({
    template: `
    {{> const message = "Hello world" }}
    {{ message }}
    `,
    expected: "Hello world",
  });
});
