<h1>
<img align="left" width="40" src="https://raw.githubusercontent.com/ventojs/vento/main/docs/icon.svg"></img>
Vento
</h1>

[![Deno](https://deno.land/badge/vento/version)](https://deno.land/x/vento)
[![NPM](https://img.shields.io/npm/v/ventojs)](https://www.npmjs.com/package/ventojs)
[![Tests](https://github.com/ventojs/vento/workflows/Tests/badge.svg?branch=main)](https://github.com/ventojs/vento/actions/workflows/deno.yml)
[![Discord](https://img.shields.io/badge/join-chat-blue?logo=discord&logoColor=white)](https://discord.gg/YbTmpACHWB)

A minimal, ergonomic template engine inspired by other great engines like Nunjucks, 
Liquid, Mustache, and EJS.

<br>

<p align="center" style="text-align: center">
  <img width="450" src="https://github.com/ventojs/vento/assets/7478134/8e9fc1f2-2ea7-43a1-be08-f190fee681ea">
</p>

## Features

- Minimal, fast runtime. 🔥
- Ergonomic by design. All tags and outputs are written with `{{` and `}}`.
- Write JavaScript anywhere. `{{ await user.getName() }}` is real JS executed at runtime.
- Built-in tags like `if`, `for`, `include`, `layout` and [more](https://vento.js.org).
- Filters, using the `|>` pipeline operator. Inspired by the
  [F# pipeline operator proposal](https://github.com/valtech-nyc/proposal-fsharp-pipelines)
- Async friendly. No need to use special tags.
- Flexible plugin system. Nearly all of Vento's features and tags are implemented as plugins.

## Getting started

See [Getting started](https://vento.js.org/getting-started/) in the docs for examples and guidance.

## Editor support

See [Editor integrations](https://vento.js.org/editor-integrations/) in the
docs.

## Why another template engine?

Because I couldn't find the "perfect" template engine for me (this one
probably isn't either). The issues I found in existing template engines:

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
