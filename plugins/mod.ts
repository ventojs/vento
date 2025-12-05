import type { Environment, Plugin } from "../core/environment.ts";

import ifTag from "./if.ts";
import forTag from "./for.ts";
import includeTag from "./include.ts";
import setTag from "./set.ts";
import defaultTag from "./default.ts";
import jsTag from "./js.ts";
import layoutTag from "./layout.ts";
import functionTag from "./function.ts";
import importTag from "./import.ts";
import exportTag from "./export.ts";
import echoTag from "./echo.ts";
import escape from "./escape.ts";
import unescape from "./unescape.ts";
import trim from "./trim.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.use(ifTag());
    env.use(forTag());
    env.use(jsTag());
    env.use(includeTag());
    env.use(setTag());
    env.use(defaultTag());
    env.use(layoutTag());
    env.use(functionTag());
    env.use(importTag());
    env.use(exportTag());
    env.use(echoTag());
    env.use(escape());
    env.use(unescape());
    env.use(trim());
  };
}
