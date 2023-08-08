# Function

Functions are similar to regular JavaScript functions and allow to define reusable chunks of content. For example:

```
{{ function hello }}
  Hello world
{{ /function }}

{{ hello() }}
```

You can specify arguments to the function in the same way as on JavaScript:

```
{{ function hello(name = "World") }}
  Hello {{ name }}
{{ /function }}

{{ hello() }}

{{ hello("Vento") }}
```

Like in JavaScript, Vento functions can access to scoped variables of the template, even if they are not passed to the function:

```
{{ set name = "World" }}

{{ function hello }}
  Hello {{ name }}
{{ /function }}

{{ hello() }}
```

## Async functions

Use the `async` keyword to create asynchronous functions:

```
{{ async function hello }}
  {{ await Promise.resolve("Hello world") }}
{{ /function }}

{{ await hello() }}
```

## Import / Export functions

[See Imports documentation](./import-export.md) to learn how to export and import functions from other templates.
