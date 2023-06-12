import vento from "../mod.ts";
import nunjucks from "npm:nunjucks@3.2.4";
import { Liquid } from "npm:liquidjs@10.7.1";
import * as eta from "https://deno.land/x/eta@v2.2.0/mod.ts";

const env = vento();
const engine = new Liquid({
  cache: true,
});

Deno.bench({
  name: "Vento",
  async fn() {
    await env.run(Deno.cwd() + "/bench/tmp.vto", { hello: "Hello" });
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
Deno.bench({
  name: "Eta",
  async fn() {
    await eta.renderFile(Deno.cwd() + "/bench/tmp.eta", { hello: "Hello" }, {
      cache: true,
      useWith: true,
    });
  },
});
