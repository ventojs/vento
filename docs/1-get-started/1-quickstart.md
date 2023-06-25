# Quickstart

## Install

Vento is a template engine for Deno, so you can import it in your project as a
ESM module:

```js
import vento from "https://deno.land/x/vento@v0.5.0/mod.ts";

// Create an instance
const env = vento();

// Compile and run a template
const result = await env.runString(
  "<h1>{{ title }}</h1>",
  { title: "Hello world" },
);

console.log(result);
// <h1>Hello world</h1>
```

## Load and compile a template

To load and compile a template, use the `load()` function:

```js
const template = env.load("my-template.vto");

// Now you can use it passing the data
const result = await template({ title: "Hello world" });
```

The compiled templates are stored in an internal cache, so they are compiled
only once.

Alternatively, you can load and run the template file in a single call with
`run`:

```js
const result = await env.run("my-template.vto", { title: "Hello world" });
```
