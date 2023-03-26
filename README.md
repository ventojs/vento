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
  - The variables are not escaped by default, there's the `escape` filter for
    that.

- I don't like:
  - It's not possible to invoke functions in a liquid template. For example
    `{{ user.getName() }}` fails.
  - It has the same problem as Nunjucks with the `%` character in the
    delimiters.

### EJS

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

## What this new template engine has to offer?

First, let's take a look at this syntax example:

```
{{ if printName }}
  {{= user.getName("full") |> toUpperCase }}
{{ /if }}
```

- Everything is between `{{` and `}}` tags. Unlike Nunjucks or Liquid, there's
  no distinction between tags `{% tag %}` and printing variables `{{ var }}`.
  The way to print a variable is by adding a `=` sign (like EJS).
- The closed tag is done by prepending the `/` character (like Mustache).
- Everything is async. No matter if `user.getName()` returns a Promise or not.
  Unlike Nunjucks, there are no special tags for async operations.
- Like EJS, you can use real JavaScript code everywhere. `user.getName("full")`
  is real JS code that will be executed at runtime.
- Filters are applied using the
  [pipeline operator](https://github.com/tc39/proposal-pipeline-operator)
  (`|>`). Note: this is not exactly like the last proposal for JavaScript, it's
  inspired by
  ([the previous proposal](https://github.com/valtech-nyc/proposal-fsharp-pipelines)
  that was rejected but it's way more simple and fits better for filters.
- Filters can run prototype methods. In this example `users.getName("full")`
  returns a string, so the `toUpperCase` is a method of the `String` object.
  It's the same as `users.getName("full").toUpperCase()`.
