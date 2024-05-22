import { build } from "jsr:@deno/dnt@0.41.1";
import { emptyDir } from "jsr:@std/fs@0.229.1/empty-dir";

await emptyDir("./npm");

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
  outDir: "./npm",
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
    "npm:@types/estree@1.0.5": "estree",
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
