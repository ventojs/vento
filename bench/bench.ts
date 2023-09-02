import vento from "../mod.ts";
import nunjucks from "npm:nunjucks@3.2.4";
import { Liquid } from "npm:liquidjs@10.9.2";
import { Eta } from "https://deno.land/x/eta@v3.1.1/src/index.ts";

const env = vento();
const engine = new Liquid({
  cache: true,
});
const eta = new Eta({
  cache: true,
  useWith: true,
  views: Deno.cwd() + "/bench",
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
    await eta.renderAsync("/tmp.eta", { hello: "Hello" });
  },
});
