import { runBenchmark } from "./setup.ts";

await runBenchmark(async (initializer, data) => async () => {
  const render = await initializer()
  await render(data)
});
