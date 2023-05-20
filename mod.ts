import { Environment } from "./src/environment.ts";
import { FileLoader, Loader } from "./src/loader.ts";
import ifTag from "./src/plugins/if.ts";
import printTag from "./src/plugins/print.ts";
import forTag from "./src/plugins/for.ts";
import includeTag from "./src/plugins/include.ts";

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
  env.use(printTag());
  env.use(forTag());
  env.use(includeTag());

  return env;
}
