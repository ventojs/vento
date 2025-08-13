import { test, testThrows } from "./utils.ts";

Deno.test("Strict variables", async () => {
  await testThrows({
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
  await testThrows({
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
    expected: "Hello world"
  });
  await test({
    options: { strict: true },
    template: `
      {{ message }}
    `,
    data: { message: "Hello world" },
    expected: "Hello world"
  });
  await testThrows({
    options: { strict: true },
    template: `
      {{> it.message = "Hello world" }}
    `,
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
