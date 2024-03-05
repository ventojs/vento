import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";

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
  shims: {
    deno: true,
    custom: [{
      package: {
        name: "@types/estree",
        version: "^1.0.0",
      },
      globalNames: [],
    }],
  },
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
  },
  mappings: {
    "npm:@types/estree": "estree",
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
