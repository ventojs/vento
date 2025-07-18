import { Environment, type Loader } from "./core/environment.ts";
import { FileLoader } from "./loaders/file.ts";
import defaultPlugins from "./plugins/mod.ts";

export interface Options {
  includes?: string | Loader;
  autoDataVarname?: boolean;
  dataVarname?: string;
  autoescape?: boolean;
}

export default function (options: Options = {}): Environment {
  // Determine the loader based on the includes option
  const loader = typeof options.includes === "object"
    ? options.includes
    : new FileLoader(options.includes);

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
