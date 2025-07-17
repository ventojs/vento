import { copy, walk } from "jsr:@std/fs@1.0.19";

// Remove the previous code
try {
  await Deno.remove("./_browser", { recursive: true });
} catch {
  // Ignore if the directory does not exist
}
await Deno.mkdir("./_browser");

// Copy the files
const paths: string[] = [
  "browser.ts",
  "src",
  "plugins",
];

for (const path of paths) {
  await copy(path, `./_browser/${path}`);
}

// Run tsc to compile Typescript files
await Deno.writeTextFile(
  "_browser/tsconfig.json",
  JSON.stringify(
    {
      compilerOptions: {
        target: "es2022",
        allowImportingTsExtensions: true,
        moduleResolution: "NodeNext",
      },
    },
    null,
    2,
  ),
);

await new Deno.Command("deno", {
  args: ["run", "-A", "npm:typescript/tsc", "-p", "."],
  cwd: "./_browser",
}).output();

await Deno.remove("_browser/tsconfig.json");

// Replace .ts extensions with .js in the imports of JavaScript files
for await (const { path } of walk("_browser", { exts: [".js"] })) {
  const code = await Deno.readTextFile(path);
  Deno.writeTextFile(path, code.replaceAll(/\.ts";/g, '.js";'));
}

// Remove the TypeScript files
for await (const { path } of walk("_browser", { exts: [".ts"] })) {
  await Deno.remove(path);
}

// Add files to test the browser environment
Deno.mkdirSync("_browser/demo");
await Deno.writeTextFile(
  "_browser/demo/index.html",
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>title</title>
</head>
<body>
  <script type="module">
    import Vento from "../browser.js";
    const env = Vento({
      includes: new URL(import.meta.resolve("./"))
    });
    const { content } = await env.run("demo.vto");
    const container = document.createElement("div");
    container.innerHTML = content;
    document.body.append(container);
  </script>
</body>
</html>`,
);

// Add a demo template
await Deno.writeTextFile(
  "_browser/demo/demo.vto",
  `{{ set title = "It works" }}
<p>
  <h1>{{ title }}</h1>
  {{ for number of 10 }}
    {{ number}}
  {{ /for }}
</p>
`,
);

// Run Deno to format the code
await new Deno.Command("deno", {
  args: ["fmt", "--unstable-components", "."],
  cwd: "./_browser",
}).output();
