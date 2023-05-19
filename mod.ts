import { Environment } from "./src/environment.ts";
import { FileLoader } from "./src/loader.ts";
import ifTag from "./src/plugins/if.ts";
import printTag from "./src/plugins/print.ts";
import forTag from "./src/plugins/for.ts";

export interface Options {
  includes?: string;
}

export default function (options: Options = {}) {
  const loader = new FileLoader(options.includes || Deno.cwd());
  const env = new Environment(loader);

  // Register basic plugins
  env.use(ifTag());
  env.use(printTag());
  env.use(forTag());

  return env;
}
