import { Environment } from "./src/environment.ts";
import { FileLoader, type Loader } from "./src/loader.ts";

export interface Options {
  includes?: string | Loader;
  autoDataVarname?: boolean;
  dataVarname?: string;
  autoescape?: boolean;
}

export default function (options: Options = {}): Environment {
  const loader = typeof options.includes === "object"
    ? options.includes
    : new FileLoader(options.includes);

  const env = new Environment({
    loader,
    dataVarname: options.dataVarname || "it",
    autoescape: options.autoescape ?? false,
    autoDataVarname: options.autoDataVarname ?? true,
  });

  return env;
}
