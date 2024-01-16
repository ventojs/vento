import tmpl from "../mod.ts";

const env = tmpl();

const template = await env.load("./one.vto");

const result = await template({
  title: "This is an example",
  tags: [
    "template",
    "HTML",
  ],
});

console.log(result.content);
