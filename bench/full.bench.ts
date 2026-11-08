import { runBenchmark } from "./setup.ts";

await runBenchmark("Full", (initializer, data) => async () => {
  const render = await initializer();
  await render(data);
});
