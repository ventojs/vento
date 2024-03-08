import { Environment } from "./src/environment.ts";
import { FileLoader, Loader } from "./src/loader.ts";
import ifTag from "./plugins/if.ts";
import forTag from "./plugins/for.ts";
import includeTag from "./plugins/include.ts";
import setTag from "./plugins/set.ts";
import jsTag from "./plugins/js.ts";
import layoutTag from "./plugins/layout.ts";
import functionTag from "./plugins/function.ts";
import importTag from "./plugins/import.ts";
import exportTag from "./plugins/export.ts";
import echoTag from "./plugins/echo.ts";
import escape from "./plugins/escape.ts";
import unescape from "./plugins/unescape.ts";
import trim from "./plugins/trim.ts";

export interface Options {
  includes?: string | Loader;
  /** @deprecated */
  useWith?: boolean;
  dataVarname?: string;
  autoescape?: boolean;
}

export default function (options: Options = {}) {
  const loader = typeof options.includes === "object"
    ? options.includes
    : new FileLoader(options.includes || Deno.cwd());

  const env = new Environment({
    loader,
    dataVarname: options.dataVarname || "it",
    autoescape: options.autoescape ?? false,
    useWith: options.useWith ?? true,
  });

  // Register basic plugins
  env.use(ifTag());
  env.use(forTag());
  env.use(jsTag());
  env.use(includeTag());
  env.use(setTag());
  env.use(layoutTag());
  env.use(functionTag());
  env.use(importTag());
  env.use(exportTag());
  env.use(echoTag());
  env.use(escape());
  env.use(unescape());
  env.use(trim());

  return env;
}
