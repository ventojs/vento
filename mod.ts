import { Environment } from "./src/environment.ts";
import { FileLoader, Loader } from "./src/loader.ts";
import ifTag from "./src/plugins/if.ts";
import forTag from "./src/plugins/for.ts";
import includeTag from "./src/plugins/include.ts";
import setTag from "./src/plugins/set.ts";
import escape from "./src/plugins/escape.ts";

export interface Options {
  includes?: string | Loader;
}

export default function (options: Options = {}) {
  const loader = typeof options.includes === "object"
    ? options.includes
    : new FileLoader(options.includes || Deno.cwd());

  const env = new Environment(loader);

  // Register basic plugins
  env.use(ifTag());
  env.use(forTag());
  env.use(includeTag());
  env.use(setTag());
  env.use(escape());

  return env;
}
