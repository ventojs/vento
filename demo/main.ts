import Environment from "../src/mod.ts";

const env = new Environment();

const data = {
  title: "This is an example",
  tags: [
    "template",
    "HTML",
  ],
};

const result = await env.run("./main.tmpl", data);

console.log(result);
