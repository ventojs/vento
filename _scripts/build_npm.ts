import { build } from "jsr:@deno/dnt@0.41.2";
import { emptyDir } from "jsr:@std/fs@1.0.6/empty-dir";

await emptyDir("./_npm");

const version = Deno.args[0]?.replace(/^v/, "");

if (!version) {
  throw new Error("Version is required");
}

await build({
  entryPoints: [
    "./mod.ts",
    "./src/environment.ts",
    "./src/loader.ts",
    "./src/tokenizer.ts",
    "./plugins/auto_trim.ts",
  ],
  scriptModule: false,
  outDir: "./_npm",
  shims: { deno: true },
  compilerOptions: { target: "ES2022" },
  typeCheck: "both",
  package: {
    name: "ventojs",
    version,
    description: "🌬 A minimal but powerful template engine",
    license: "MIT",
    repository: "github:oscarotero/vento",
    homepage: "https://vento.js.org/",
    bugs: "https://github.com/oscarotero/vento/issues",
    devDependencies: {
      "@types/estree": "1.0.5",
    },
  },
  mappings: {
    "npm:@types/estree@1.0.6": "estree",
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "_npm/LICENSE");
    Deno.copyFileSync("README.md", "_npm/README.md");
  },
});
