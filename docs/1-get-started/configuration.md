# Configuration

## Options

You can pass an Options object to the Vento instance with some options.

```js
import vento from "https://deno.land/x/vento@v0.5.0/mod.ts";

const env = vento({
  // Options here
});
```

### dataVarname

Data variables are exposed to the global scope. For example, the code
`{{ title }}` prints the variable `title` which is available globally. This can
cause an error if the variable doesn't exist _(ReferenceError: title is not
defined)_. To avoid this error you can check if the variable exists before printing it:

```
{{ if typeof title !== "undefined" }}
  {{ title }}
{{ /if }}
```

Or even simpler:

```
{{ typeof title === "string" ? title : "" }}
```

But Vento provides the `it` global object that contains all data available in
the template. So you can do simply:

```
{{ it.title }}
```

The `dataVarname` option allows changing the name of this global object.

```js
const env = vento({
  dataVarname: "g", // change "it" to "g".
});
```

### includes

The path of the directory that Vento will use to look for includes templates.

## Filters

Filters are custom functions to transform the content. For example, let's create
a filter to put text in italic:

```ts
function italic(text: string) {
  return `<em>${text}</em>`;
}

// Register the filter
env.filters.italic = italic;
```

Now you can use this filter anywhere:

```html
<p>Welcome to {{ title |> italic }}</p>
```
