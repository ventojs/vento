import iterateTopLevelMain from "https://raw.githubusercontent.com/ventojs/vento/refs/heads/main/src/js.ts";
import iterateTopLevelNext from "../src/js.ts";

const getSource = async (path: string) => {
  const url = new URL(path, import.meta.url);
  return await Deno.readTextFile(url);
};

const jQuery = await getSource("./assets/jquery-dev.js");
const Prism = await getSource("./assets/prism.js");
const VueJS = await getSource("./assets/vue.global.js");
const lodash = await getSource("./assets/jsfuck.js");
const jsfuck = await getSource("./assets/jsfuck.js");
const Yozo = await getSource("./assets/yozo-dev.js");

const libs = { jQuery, Prism, VueJS, lodash, jsfuck, Yozo };

for (const [name, source] of Object.entries(libs)) {
  Deno.bench(`Vento's main branch: ${name}`, () => {
    for (const _ of iterateTopLevelMain(source, 0));
  });
}

for (const [name, source] of Object.entries(libs)) {
  Deno.bench(`Current branch: ${name}`, () => {
    for (const _ of iterateTopLevelNext(source, 0));
  });
}
