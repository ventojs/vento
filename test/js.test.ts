import { test } from "./utils.ts";

Deno.test("> tag", async () => {
  await test({
    template: `
    {{> const message = "Hello world" }}
    {{ message }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{>
      const message = "Hello world"
    }}
    {{ message }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{>
      // This is a {{ comment
      const message = "Hello world"
    }}
    {{ message }}
    `,
    expected: "Hello world",
  });
  await test({
    template: `
    {{> // This is a comment }}
      const message = "Hello world"
    }}
    {{ message }}
    `,
    expected: "Hello world",
  });

  await test({
    template: `
    {{> const message = "{{Hello world}}" }}
    {{ message }}
    `,
    expected: "{{Hello world}}",
  });

  await test({
    template: `
    {{> const message = "Hello's" }}
    {{ message }}
    `,
    expected: "Hello's",
  });

  await test({
    template: `
    {{> const message = "Hello" /* Comment */ }}
    {{ message }}
    `,
    expected: "Hello",
  });
  await test({
    template: `
    {{> const message = "Hello" /* Comment /* other */ }}
    {{ message }}
    `,
    expected: "Hello",
  });

  await test({
    template: `
    {{> const message = "Hello's".replace(/['"]/, " ") }}
    {{ message }}
    `,
    expected: "Hello s",
  });

  await test({
    template: `
    {{> const message = "Hello's".replace(
      /['"]/,
      " "
    ) }}
    {{ message }}
    `,
    expected: "Hello s",
  });

  await test({
    template: `
    {{> const { a = 2 } = {}; }}
    {{ JSON.stringify(a) }}
    `,
    expected: "2",
  });
});
