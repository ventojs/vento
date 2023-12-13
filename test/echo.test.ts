import { test, testThrows } from "./utils.ts";

Deno.test("Echo tag", async () => {
  await test({
    template: `
    {{echo}} Hello world {{/echo}}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{echo}} Hello {{ world }} {{/echo}}
    `,
    expected: "Hello {{ world }}",
  });

  await test({
    template: `
    {{ echo "Hello {{ world }}" }}
    `,
    expected: "Hello {{ world }}",
  });

  await test({
    template: `
    {{ echo "Hello {{ world }}" |> toUpperCase }}
    `,
    expected: "HELLO {{ WORLD }}",
  });

  await test({
    template: `
    {{echo |> toUpperCase }} Hello {{ world }} {{/echo}}
    `,
    expected: "HELLO {{ WORLD }}",
  });

  testThrows({
    options: {
      useWith: false,
    },
    template: `
    Hello {{ world }}
    `,
    expected: "Hello world",
    data: {
      world: "world",
    },
  });
});
