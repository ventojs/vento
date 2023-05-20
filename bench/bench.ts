import tmpl from "../mod.ts";
import nunjucks from "npm:nunjucks@3.2.4";
import { Liquid } from "npm:liquidjs@10.7.1";

const env = tmpl();
const engine = new Liquid({
  cache: true,
});

Deno.bench({
  name: "Tmpl",
  async fn() {
    await env.run(Deno.cwd() + "/bench/tmp.tmpl", { hello: "Hello" });
  },
});
Deno.bench({
  name: "Nunjucks",
  fn() {
    nunjucks.render(Deno.cwd() + "/bench/tmp.njk", { hello: "Hello" });
  },
});
Deno.bench({
  name: "Liquid",
  async fn() {
    await engine
      .renderFile(Deno.cwd() + "/bench/tmp.liquid", { hello: "Hello" });
  },
});
