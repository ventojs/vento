import tokenizerMain from "https://raw.githubusercontent.com/ventojs/vento/refs/heads/main/src/tokenizer.ts";
import tokenizerNext from "../src/tokenizer.ts";

const url = new URL("./assets/lorem-ipsum.txt", import.meta.url);
const source = await Deno.readTextFile(url);

Deno.bench("Vento's main branch", () => {
  tokenizerMain(source);
});

Deno.bench("Current branch", () => {
  tokenizerNext(source);
});
