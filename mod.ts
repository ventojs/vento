import Environment from "./src/environment.ts";
import { FileLoader } from "./src/loader.ts";
export type { Token } from "./src/tokenizer.ts";
export type { Filter, Tag, Template } from "./src/environment.ts";

export interface Options {
  includes?: string;
}

export default function (options: Options = {}) {
  const loader = new FileLoader(options.includes || Deno.cwd());
  return new Environment(loader);
}
