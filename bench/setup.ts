import vento from "../mod.ts";
import nunjucks from "npm:nunjucks@3.2.4";
import { Liquid } from "npm:liquidjs@10.20.1";
import { Eta } from "https://deno.land/x/eta@v3.5.0/src/index.ts";
import { Edge } from "npm:edge.js@6.2.1";
import pug from "npm:pug@3.0.3";
import * as preact from "npm:preact-render-to-string@6.5.13";
import ejs from "npm:ejs@3.1.10";

type Renderer = (data: Record<string, unknown>) => string | Promise<string>;

const data = {
  title: "Benchmarking templating languages",
  description: "Benchmarking templating languages; who's fastest?",
  mainNavItems: [
    { url: "#foo", text: "Foo" },
    { url: "#bar", text: "Bar" },
    { url: "#baz", text: "Baz" },
    { url: "#qux", text: "Qux" },
  ],
  searchArray: [...Array(1_000).keys()],
};

export async function runBenchmark(
  setupThenRun: (
    initializer: () => Renderer | Promise<Renderer>,
    data: Record<string, unknown>,
  ) => (() => Promise<void>) | Promise<() => Promise<void>>,
  { exclude }: { exclude: string[] } = { exclude: [] },
) {
  for (const [name, initializer] of Object.entries(initializers)) {
    if (exclude.includes(name)) continue;
    const run = await setupThenRun(initializer, data);
    Deno.bench(name, async () => {
      await run();
    });
  }
}

const dir = Deno.cwd() + "/bench/templates/";
let uniqueInt = 1;
const getUniqueInt = () => uniqueInt++;

const initializers = {
  async Vento(): Promise<Renderer> {
    const env = vento({ autoDataVarname: true });
    const render = await env.load(dir + "tmp.vto");
    return async (data: Record<string, unknown>) => {
      const { content } = await render(data);
      return content;
    };
  },

  Nunjucks(): Renderer {
    const loader = new nunjucks.FileSystemLoader(Deno.cwd());
    const env = new nunjucks.Environment(loader);
    const template = env.getTemplate(dir + "tmp.njk", true);
    return template.render.bind(template);
  },

  async Liquid(): Promise<Renderer> {
    const engine = new Liquid({ cache: true });
    const template = await engine.parseFile(dir + "tmp.liquid");
    return engine.render.bind(engine, template);
  },

  Eta(): Renderer {
    const eta = new Eta({ cache: true, useWith: true });
    const template = eta.compile(eta.readFile(dir + "tmp.eta"));
    return template.bind(eta) as Renderer;
  },

  Pug(): Renderer {
    return pug.compileFile(dir + "tmp.pug");
  },

  async Preact(): Promise<Renderer> {
    const hash = "#" + getUniqueInt();
    const { default: render } = await import(dir + "tmp.jsx" + hash);
    return (data: Record<string, unknown>) => {
      return preact.render(render(data));
    };
  },

  async EJS(): Promise<Renderer> {
    const source = await Deno.readTextFile(dir + "tmp.ejs");
    return ejs.compile(source, { async: true });
  },

  // Edge cannot compile separately from rendering
  Edge(): Renderer {
    const edge = Edge.create();
    edge.mount(dir);
    return edge.render.bind(edge, "tmp");
  },
};
