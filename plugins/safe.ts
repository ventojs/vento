import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    /**
     * This filter has no behavior -- its feature is implemented in
     * {@linkcode compileFilters}.
     */
    env.filters.safe = <T>(v: T) => v;
  };
}
