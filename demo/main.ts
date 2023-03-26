import Environment from "../mod.ts";

const env = new Environment();

const template = await env.load("./main.tmpl");

const result = await template({
  title: "This is an example",
  tags: [
    "template",
    "HTML",
  ],
});

console.log(result);
