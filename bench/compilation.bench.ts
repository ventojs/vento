import { runBenchmark } from "./setup.ts";

runBenchmark(
  "Compilation",
  (initializer) => async () => {
    await initializer();
  },
  { exclude: ["Edge"] },
);
