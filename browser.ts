import { Environment, type Loader } from "./src/environment.ts";
import { UrlLoader } from "./src/url_loader.ts";
import defaultPlugins from "./plugins/mod.ts";

export interface Options {
  includes: URL | Loader;
  autoDataVarname?: boolean;
  dataVarname?: string;
  autoescape?: boolean;
}

export default function (options: Options): Environment {
  // Determine the loader based on the includes option
  const loader = options.includes instanceof URL
    ? new UrlLoader(options.includes)
    : options.includes;

  // Create a new Environment instance with the provided options
  const env = new Environment({
    loader,
    dataVarname: options.dataVarname || "it",
    autoescape: options.autoescape ?? false,
    autoDataVarname: options.autoDataVarname ?? true,
  });

  // Register the default plugins
  env.use(defaultPlugins());

  return env;
}
