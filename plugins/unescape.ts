import { html } from "../deps.ts";
import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.filters.unescape = html.unescape;
  };
}
