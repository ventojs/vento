import { html } from "../deps.ts";
import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    // deno-lint-ignore no-explicit-any
    env.filters.unescape = (value: any) =>
      value ? html.unescape(value.toString()) : "";
  };
}
