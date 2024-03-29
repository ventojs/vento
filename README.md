<h1>
<img align="left" width="40" src="https://raw.githubusercontent.com/ventojs/vento/main/docs/favicon.svg"></img>
Vento
</h1>

[![Deno](https://deno.land/badge/vento/version)](https://deno.land/x/vento)
[![NPM](https://img.shields.io/npm/v/ventojs)](https://www.npmjs.com/package/ventojs)
[![Tests](https://github.com/ventojs/vento/workflows/Tests/badge.svg?branch=main)](https://github.com/ventojs/vento/actions/workflows/deno.yml)
[![Discord](https://img.shields.io/badge/join-chat-blue?logo=discord&logoColor=white)](https://discord.gg/YbTmpACHWB)

A minimal, ergonomic template engine inspired by other great engines like
Nunjucks, Liquid, Mustache, and EJS.

<br>

<p align="center" style="text-align: center">
  <img width="450" src="https://github.com/ventojs/vento/assets/7478134/8e9fc1f2-2ea7-43a1-be08-f190fee681ea">
</p>

## Features

- Minimal, fast runtime. 🔥
- Ergonomic by design. All tags and outputs are written with `{{` and `}}`.
- Write JavaScript anywhere. `{{ await user.getName() }}` is real JS executed at
  runtime.
- Built-in tags like `if`, `for`, `include`, `layout` and
  [more](https://vento.js.org).
- Filters, using the `|>` pipeline operator. Inspired by the
  [F# pipeline operator proposal](https://github.com/valtech-nyc/proposal-fsharp-pipelines)
- Async friendly. No need to use special tags.
- Flexible plugin system. Nearly all of Vento's features and tags are
  implemented as plugins.

## Getting started

See [Getting started](https://vento.js.org/getting-started/) in the docs for
examples and guidance.

## Editor support

See [Editor integrations](https://vento.js.org/editor-integrations/) in the
docs.
