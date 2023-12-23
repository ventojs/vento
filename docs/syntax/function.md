# Function

Functions are similar to JavaScript functions and allow you to define reusable
chunks of content.

```vento
{{ function hello }}
  Hello, world!
{{ /function }}

{{ hello() }}
```

You can specify arguments to the function just like in JavaScript:

```vento
{{ function hello(name = "world") }}
  Hello, {{ name }}!
{{ /function }}

{{ hello() }}

{{ hello("Vento") }}
```

Like in JavaScript, Vento functions can access to scoped variables of the
template, even if they are not passed to the function:

```vento
{{ set name = "world" }}

{{ function hello }}
  Hello, {{ name }}!
{{ /function }}

{{ hello() }}
```

## Async functions

Use the `async` keyword to create asynchronous functions.

```vento
{{ async function hello }}
  {{ await Promise.resolve("Hello, world!") }}
{{ /function }}

{{ await hello() }}
```

## Importing/exporting functions

See [Imports and exports](./import-export.md) to learn how to import and export
functions from other templates.
