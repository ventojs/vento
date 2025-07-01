import { runBenchmark } from "./setup.ts";

runBenchmark((initializer) => async () => {
  await initializer();
}, { exclude: ["Edge"] });
