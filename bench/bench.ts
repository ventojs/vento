import vento from "../mod.ts";
import nunjucks from "npm:nunjucks@3.2.4";
import { Liquid } from "npm:liquidjs@10.20.1";
import { Eta } from "https://deno.land/x/eta@v3.5.0/src/index.ts";
import { Edge } from "npm:edge.js@6.2.1";

const env = vento({
  autoDataVarname: true,
});
const engine = new Liquid({
  cache: true,
});
const eta = new Eta({
  cache: true,
  useWith: true,
  views: Deno.cwd() + "/bench",
});
const edge = Edge.create();
edge.mount(new URL("./", import.meta.url));

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
Deno.bench({
  name: "Edge.js",
  async fn() {
    await edge.render("tmp", { hello: "Hello" });
  },
});
