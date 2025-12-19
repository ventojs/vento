import { test } from "./utils.ts";

Deno.test("Escape filter", async () => {
  await test({
    template: `
    NaN: {{ NaN |> empty }}
    `,
    expected: "NaN: true",
  });

  await test({
    template: `
    Zero: {{ 0 |> empty }}
    `,
    expected: "Zero: true",
  });

  await test({
    template: `
    One: {{ 1 |> empty }}
    `,
    expected: "One: false",
  });

  await test({
    template: `
    Null: {{ null |> empty }}
    `,
    expected: "Null: true",
  });

  await test({
    template: `
    Empty object: {{ {} |> empty }}
    `,
    expected: "Empty object: false",
  });

  await test({
    template: `
    Empty array: {{ [] |> empty }}
    `,
    expected: "Empty array: true",
  });

  await test({
    template: `
    Array with empty slot: {{ Array(1) |> empty }}
    `,
    expected: "Array with empty slot: false",
  });

  await test({
    template: `
    Empty string: {{ "" |> empty }}
    `,
    expected: "Empty string: true",
  });

  await test({
    template: String.raw`
    Whitespace only: {{ " \n\t " |> empty }}
    `,
    expected: "Whitespace only: true",
  });

  await test({
    template: `
    String of zero: {{ "0" |> empty }}
    `,
    expected: "String of zero: false",
  });
});
