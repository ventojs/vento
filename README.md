# VENTO

This is a minimal and experimental template engine inspired by other great
engines like Nunjucks, Liquid, Mustache or EJS.

## Why another template engine?

Because I couldn't find the "perfect" template engine for me (probably this one
neither is). The issues I found in existing template engines:

### Nunjucks

(It's my favorite template engine so far).

- I like:
  - I can invoke functions like `{{ user.getName() }}`.
  - Very flexible, with many built-in filters and features
- I don't like:
  - It's not well maintained. The last version was released in Jun 2022. And the
    previous version in 2020.
  - It's not async-friendly. For example, you have some tags to work with sync
    values (like `for` and `if`) and others for async values (like `asyncEach`
    and `ifAysnc`). Some features don't work in async contexts.
  - To me, it's very uncomfortable to have to type the delimiters `{%` and `%}`
    all the time (especially the `%` character).
  - By default, all variables are escaped, so you have to remember to use the
    `safe` filter everywhere. This is not very convenient for my use case
    (static site generators), where I can control all the content and the HTML
    generated.
  - Some filters are too specific.

### Liquid

- I like:
  - The support for async evaluation is less hacky than Nunjucks.
  - The variables are not escaped by default, there's an `escape` filter for
    that.

- I don't like:
  - It's not possible to invoke functions in a liquid template. For example
    `{{ user.getName() }}` fails.
  - It has the same problem as Nunjucks with the `%` character in the
    delimiters.

### EJS/Eta

- I like:
  - It allows running any javascript code in the template.
- I don't like:
  - It has the same problem with the `%` character. And I don't like the opening
    and closing delimiters (`<%` and `%>`).
  - Because it runs javascript, it's very verbose to do a simple `forEach` or
    `if`.

### Mustache

- I like:
  - Very simple, everything is inside `{{` and `}}`.
  - The closing tag is `{{/tagname}}`, very nice!
- I don't like:
  - Perhaps too simple and the syntax can be a bit confusing.
  - Partials. It's not easy to include them dynamically.
  - The data context is a bit confusing to me.
  - Very uncomfortable to work with filters.

### What this new template engine has to offer?

First, let's take a look at this syntax example:

```
{{ if printName }}
  {{ await user.getName("full") |> toUpperCase }}
{{ /if }}
```

- Everything is between `{{` and `}}` tags. Unlike Nunjucks or Liquid, there's
  no distinction between tags `{% tag %}` and printing variables `{{ var }}`.
- The closed tag is done by prepending the `/` character (like Mustache).
- Async friendly.
- Like EJS, you can use real JavaScript code everywhere.
  `await user.getName("full")` is real JS code that will be executed at runtime.
- Filters are applied using the
  [pipeline operator](https://github.com/tc39/proposal-pipeline-operator)
  (`|>`). Note: this is not exactly like the last proposal for JavaScript, it's
  inspired by
  ([the previous proposal](https://github.com/valtech-nyc/proposal-fsharp-pipelines)
  that was rejected but it's way more simple and fits better for filters.
- Filters can run prototype methods. In this example `users.getName("full")`
  returns a string, so the `toUpperCase` is a method of the `String` object.
  It's the same as `users.getName("full").toUpperCase()`.

## Getting started

This is a library for Deno. I'm planning to release an NPM version in the
future.

First, you need to import the library and create an instance:

```ts
import vento from "https://deno.land/x/vento@v0.2.0/mod.ts";

const vto = vento({
  // Resolve the non-relative includes paths
  includes: "./path/to/includes",
});
```

There are different ways to load, compile and run a template. For example, you
can use `load` to load and compile a template file and return it.

```ts
// Load and return a template
const template = vto.load("my-template.vto");

// Now you can use it passing the data
template({ title: "Hello world" });
```

Alternatively, you can load and run the template file in a single call:

```ts
vto.run("my-template.vto", { title: "Hello world" });
```

If the template code is not a file, you can run it directly:

```ts
vto.runString("<h1>{{ title }}</h1>", { title: "Hello world" });
```

## Visual Studio Code Support

[The Vento extension for VS Code](https://marketplace.visualstudio.com/items?itemName=oscarotero.vento-syntax)
enables syntax highlight and provides some useful snippets.

## API

### Print

Put a variable or expression between `{{ }}` to output the result.

- Print a variable:
  ```
  {{ name }}
  ```
- Print the result of an expression:
  ```
  {{ (name + " " + surname).toUpperCase() }}
  ```
- Apply pipes with `|>`:
  ```
  {{ name + " " + surname |> toUpperCase }}
  ```
- Print conditionally
  ```
  {{ name || "Unknown name" }}
  ```
- Trim content (use `-` character next to the opening tag or previous to the
  closing tag to remove white space):
  ```
  <h1>    {{- "Hello world" -}}    </h1>
  ```
  This outputs `<h1>Hello world</h1>`.

### For

Use `for [value] of [collection]` tag to iterate over arrays, dictionaries,
numbers, strings, etc:

- Arrays:
  ```
  {{ for number of [1, 2, 3] }}
    {{ number }}
  {{ /for }}
  ```
- Objects:
  ```
  {{ for person of [{name: "Óscar"}, {name: "Laura"}] }}
    {{ person.name }}
  {{ /for }}
  ```
- Numbers (to count from 1 to 10):
  ```
  {{ for count of 10 }}
    {{ count }}
  {{ /for }}
  ```
- Strings (to split by letters):
  ```
  {{ for letter of "Text" }}
    {{ letter }}
  {{ /for }}
  ```
- Use `await` for asynchronous iterators:
  ```
  {{ for await item of getItems() }}
    {{ item }}
  {{ /for }}
  ```
- Use `key, value` to get the key of the iterator
  ```
  {{ for key, value of { name: "Óscar", surname: "Otero" } }}
    Key: {{ key }}
    Value: {{ value }}
  {{ /for }}
  ```
- Apply filters to the collection before iterating it (in this example, filter
  the even numbers):
  ```
  {{ for evenNumber of [1, 2, 3] |> filter((n) => n % 2 === 0) }}
    {{ evenNumber }}
  {{ /for }}
  ```

### If

Use `if` to test a condition. The syntax for the condition is the same as
regular JavaScript `if`:

- A simple condition:
  ```
  {{ if user.is_active }}
    The user is active
  {{ /if }}
  ```

- If/else
  ```
  {{ if user.is_active && user.is_logged }}
    The user is active and logged
  {{ else }}
    The user is not active
  {{ /if }}
  ```

- If/else if
  ```
  {{ if user.active }}
    The user is active
  {{ else if user.logged }}
    The user is logged
  {{ else }}
    The user is not active
  {{ /if }}
  ```
- The variables are exposed to the global scope. If the variable doesn't exist,
  an error is thrown:
  ```
  {{ if non_existing_variable }}
    {{ non_existing_variable }}
  {{ /if }}
  ```
  This code returns the error
  `ReferenceError: non_existing_variable is not defined`. A way to avoid this in
  JavaScript:
  ```
  {{ if typeof non_existing_variable !== "undefined" }}
    {{ non_existing_variable }}
  {{ /if }}
  ```
  But a more easy way is using the global object `it`, which contains all
  variables:
  ```
  {{ if it.non_existing_variable }}
    {{ non_existing_variable }}
  {{ /if }}
  ```

### Include

To insert other templates in place. You can also include extra data.

- Include a template
  ```
  {{ include "filename.ven" }}
  ```
- Include a template dynamically
  ```
  {{ include `${filename}.ven` }}
  ```
- Add extra data
  ```
  {{ include `${filename}.ven` {name: "Value", name2: "Value2"} }}
  ```

### Set

Allows to create or modify a variable.

- Save a variable inline mode
  ```
  {{ set message = "Hello world" }}
  ```
- Save a variable block mode
  ```
  {{ set message }}
    Hello world
  {{ /set }}
  ```
- Use pipes
  ```
  {{ set message = "Hello world" |> toUpperCase }}
  ```
- Use pipes in block mode
  ```
  {{ set message |> toUpperCase }}
    Hello world
  {{ /set }}
  ```

### Comments

Use `{{#` to start a comment and `#}}` to end it. The commented code will be
ignored by Vento and won't be printed.

```
{{# This is a commented code #}}
```

### Raw

Use the `{{ raw }}` tag to disable the tag processing temporarily. This is
useful for generating content (ej Nunjucks, Liquid, Mustache, etc) with
conflicting syntax.

```
{{ raw }}
  In Handlebars, {{ this }} will be HTML-escaped, but
  {{{ that }}} will not.
{{ /raw }}
```

### Arbitrary JavaScript code

You can insert any JavaScript code in the templates, that will be evaluated at
runtime by starting the tag with `>` character. For example:

```
{{> console.log("Hello world") }}
```

## Available filters

- `escape`: To escape HTML code:
  ```
  {{ "<h1>Hello world</h1>" |> escape }}
  ```
- Any global function. For example:
  ```
  {{ {name: "Óscar", surname: "Otero"} |> JSON.stringify }}
  ```
  Because `JSON.stringify` is a function existing in the global scope, it's
  automatically used.
- If the filter name is not registered and it's not in the global scope, Vento
  will try to execute it as an object property. For example:
  ```
  {{ "https://example.com/data.json" |> await fetch |> await json |> JSON.stringify }}
  ```
  - Note that `fetch` is a global function so Vento will execute it by passing
    the url as the argument.
  - `json` is not in the global scope so it will be executed as a property of
    the response returned by fetch
  - `JSON.stringify` is a global function
  - The compiled code of this is equivalent to:
    ```js
    JSON.stringify(await (await fetch("https://example.com/data.json")).json());
    ```
