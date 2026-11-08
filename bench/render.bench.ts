import { runBenchmark } from "./setup.ts";

await runBenchmark(
  "Render",
  async (initializer, data) => {
    const render = await initializer();
    return async () => {
      await render(data);
    };
  },
  { exclude: ["Edge"] },
);
