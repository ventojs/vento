import { test, testSync } from "./utils.ts";

Deno.test("Comment tag", async () => {
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
  testSync({
    template: `
    <h1> {{# {{ title }} {{#}}
    `,
    expected: "<h1> ",
  });
});

Deno.test("Comment tag with trimming", async () => {
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
