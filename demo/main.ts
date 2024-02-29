import tmpl from "../mod.ts";
import autoTrim from "../plugins/auto_trim.ts";

const env = tmpl();
env.use(autoTrim());

const template = await env.load("./one.vto");

const result = await template({
  title: "This is an example",
  tags: [
    "template",
    "HTML",
  ],
});

console.log(result.content);
