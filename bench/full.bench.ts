import { runBenchmark } from "./setup.ts";

await runBenchmark((initializer, data) => async () => {
  const render = await initializer();
  await render(data);
});
