import { runBenchmark } from "./setup.ts";

runBenchmark(async initializer => async () => {
  await initializer()
}, { exclude: ["Edge"] });
