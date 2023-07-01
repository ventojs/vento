import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: { deno: true },
  compilerOptions: { target: "ES2022" },
  scriptModule: false,
  package: {
    name: "ventojs",
    version: Deno.args[0]?.replace(/^v/, ""),
    description: "🌬 A minimal but powerful template engine",
    license: "MIT",
    repository: "github:oscarotero/vento",
    homepage: "https://oscarotero.github.io/vento/",
    bugs: "https://github.com/oscarotero/vento/issues",
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
