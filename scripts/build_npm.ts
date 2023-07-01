import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
    undici: "dev",
  },
  compilerOptions: { target: "ES2022" },
  scriptModule: false,
  package: {
    name: "vento",
    version: Deno.args[0],
    description: "🌬 A minimal but powerful template engine",
    license: "MIT",
    repository: "github:oscarotero/vento",
    bugs: "https://github.com/oscarotero/vento/issues",
  },
  postBuild() {
    Deno.copyFileSync("deno.json", "npm/esm/deno.json");
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
