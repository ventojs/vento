import { readFileSync, writeFileSync } from "node:fs";

const file = "dist/package.json";
const pkg = JSON.parse(readFileSync(file, "utf-8"));

// Generate the exports entries (support for .js and .ts)
const exports = pkg.exports as Record<string, string> | undefined;
if (exports) {
  pkg.exports = {};

  for (const [key, value] of Object.entries(exports)) {
    const jsKey = key.replace(/\.ts$/, ".js");
    const jsValue = {
      types: value.replace(/^\.\//, "./build/").replace(/\.ts$/, ".d.ts"),
      import: value.replace(/^\.\//, "./build/").replace(/\.ts$/, ".js"),
    };
    pkg.exports[key] = jsValue;
    pkg.exports[jsKey] = jsValue;
  }
}

// Remove dev stuff
delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.devEngines;

writeFileSync(file, JSON.stringify(pkg, null, 2));
