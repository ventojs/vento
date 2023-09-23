---
order: 2
---

# Configuration

## Options

Pass an options object to the `vento()` function to customize Vento.

```js
const env = vento({
	// Options here!
});
```

### `dataVarname`

Data variables are exposed to the global scope. For example, the code
`{{ title }}` prints the variable `title` which is available globally. This can
cause an error if the variable doesn't exist _(ReferenceError: title is not
defined)_. To avoid this error you can check if the variable exists before
printing it:

```vento
{{ if typeof title !== "undefined" }}
  {{ title }}
{{ /if }}
```

Or even simpler:

```vento
{{ typeof title === "string" ? title : "" }}
```

But Vento provides the `it` global object that contains all data available in
the template. So you can do simply:

```vento
{{ it.title }}
```

The `dataVarname` option allows changing the name of this global object.

```js
const env = vento({
	dataVarname: "global", // "it" -> "global"
});
```

### `includes`

The path of the directory that Vento will use to look for includes templates.

## Filters

Filters are custom functions to transform the content.

For example, let's create a function to make text italic:

```ts
function italic(text: string) {
	return `<em>${text}</em>`;
}
```

And we can register that with Vento:

```ts
env.filters.italic = italic;
```

Now you can use this filter anywhere:

```vento
<p>Welcome to {{ title |> italic }}</p>
```

## Autoescape

Set `true` to automatically escape printed variables:

```ts
const env = vento({
	autoescape: true,
});

const result = env.runString("{{ title }}", {
	title: "<h1>Hello, world!</h1>",
});
// &lt;h1&gt;Hello, world!&lt;/h1&gt;

// You can use the `safe` filter for trusted content:
const result = env.runString("{{ title |> safe }}", {
	title: "<h1>Hello world</h1>"
});
// <h1>Hello world</h1>

// The `unescape` filter also marks content as trusted:
const result = env.runString("{{ title |> unescape }}", {
	title: "&lt;h1&gt;Hello world&lt;/h1&gt;"
});
// <h1>Hello world</h1>
```
