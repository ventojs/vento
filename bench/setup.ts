import vento from "../mod.ts";
import nunjucks from "nunjucks";
// @ts-expect-error: no types available
import nunjucks4 from "@11ty/nunjucks";
import { Liquid } from "liquidjs";
import { Eta } from "eta";
import { Edge } from "edge.js";
import pug from "pug";
import ejs from "ejs";
import { Bench } from "tinybench";
import process from "node:process";
import { readFile } from "node:fs/promises";

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
  name: string,
  setupThenRun: (
    initializer: () => Renderer | Promise<Renderer>,
    data: Record<string, unknown>,
  ) => (() => Promise<void>) | Promise<() => Promise<void>>,
  { exclude }: { exclude: string[] } = { exclude: [] },
) {
  const bench = new Bench({ name });
  for (const [name, initializer] of Object.entries(initializers)) {
    if (exclude.includes(name)) continue;
    const run = await setupThenRun(initializer, data);
    bench.add(name, async () => {
      await run();
    });
  }
  await bench.run();
  console.log(bench.name);
  console.table(bench.table());
}

const dir = process.cwd() + "/bench/templates/";
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

  async VentoAutoescape(): Promise<Renderer> {
    const env = vento({ autoDataVarname: true, autoescape: true });
    const render = await env.load(dir + "tmp.vto");
    return async (data: Record<string, unknown>) => {
      const { content } = await render(data);
      return content;
    };
  },

  async VentoStrict(): Promise<Renderer> {
    const env = vento({ autoDataVarname: true, strict: true });
    const render = await env.load(dir + "tmp.strict.vto");
    return async (data: Record<string, unknown>) => {
      const { content } = await render(data);
      return content;
    };
  },

  Nunjucks(): Renderer {
    const loader = new nunjucks.FileSystemLoader(process.cwd());
    const env = new nunjucks.Environment(loader);
    const template = env.getTemplate(dir + "tmp.njk", true);
    return template.render.bind(template);
  },

  Nunjucks4(): Renderer {
    const loader = new nunjucks4.FileSystemLoader(process.cwd());
    const env = new nunjucks4.Environment(loader);
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

  async EJS(): Promise<Renderer> {
    const source = await readFile(dir + "tmp.ejs", "utf-8");
    return ejs.compile(source, { async: true });
  },

  // Edge cannot compile separately from rendering
  Edge(): Renderer {
    const edge = Edge.create();
    edge.mount(dir);
    return edge.render.bind(edge, "tmp");
  },
};
