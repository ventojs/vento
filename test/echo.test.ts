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

  await test({
    template: `
    {{ "title" |> fromData |> toUpperCase }}
    `,
    expected: "HELLO WORLD",
    data: {
      title: "Hello world",
    },
    filters: {
      fromData(key: string) {
        return this.data[key];
      },
    },
  });

  await test({
    template: `
    {{ "title" |> fromData }}
    `,
    expected: "#Hello world",
    data: {
      title: "Hello world",
      prefix: "#",
    },
    filters: {
      prefix(value: string) {
        return this.data.prefix + value;
      },
      fromData(key: string) {
        return this.env.filters.prefix.call(this, this.data[key]);
      },
    },
  });

  testThrows({
    options: {
      autoDataVarname: false,
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
