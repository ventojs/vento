---
logo: /favicon.svg
---

# 🌬 Vento

Vento is the [Galician](https://en.wikipedia.org/wiki/Galician_language) word
for _wind_ but also a new JavaScript-based template engine. It's inspired by
other engines, such as [Nunjucks](https://mozilla.github.io/nunjucks/),
[Liquid](https://liquidjs.com/), [Eta](https://eta.js.org/), and
[Mustache](https://mustache.github.io/).

## Why another template engine?

All these template engines mentioned above are great but they also have some
drawbacks and none of them meets all my requirements, so I've created Vento.

Some of Vento's main selling points are:

- All logic is done in JavaScript; there's no need to learn many engine-specific
  APIs. Compared to engines like Liquid or Nunjucks that restrict authors to
  their own flow control syntax, larger blocks of logic become a breeze to write
  in Vento. Additionally, there's much less of a need to learn language-specific
  features; want to uppercase a string? Use JavaScript's `toUpperCase()` method;
  no need to look up whether it was `| upper` or `| upcase`.
- Vento's JavaScript embedding combines a robust compiler with great
  performance. Unlike many other JavaScript-based templating languages, Vento
  uses an elaborate delimiter-matching algorithm to handle the vast majority of
  embedded JavaScript correctly (for example, `{{ '}}' }}`), while retaining its
  fast compilation speeds and even faster render speeds.
- Vento is async-friendly. Your templates are directly compiled into JavaScript
  functions, and therefore support asynchronicity out-of-the-box.
- Vento's tag syntax is more developer-friendly; it reduces the cognitive load
  by using `{{ … }}` for both tags and interpolation. Additionally, closing tags
  hit the sweet spot for being short but readable; instead of the longer
  `{% endfor %}` or more cryptic `<% } %>`, it uses a compact but expressive
  `{{ /for }}`.

### Nunjucks

- It's not well maintained. The last version was released in Jun 2022. And the
  previous version in 2020.
- It's not async-friendly. For example, you have some tags to work with sync
  values (like `for` and `if`) and others for async values (like `asyncEach` and
  `ifAsync`). Some features don't work in async contexts.
- To me, it's very uncomfortable to have to type the delimiters `{%` and `%}`
  all the time (especially the `%` character).
- By default, all variables are escaped, so you have to remember to use the
  `safe` filter everywhere. This is not very convenient for my use case (static
  site generators), where I can control all the content and the HTML generated.

### Liquid

- It's not possible to invoke functions in a liquid template. For example
  `{{ date.format("YY-mm-dd") }}` fails.
- It has the same problem as Nunjucks with the `%` character in the delimiters.

### EJS/Eta

- It has the same problem with the `%` character. And I don't like the opening
  and closing delimiters (`<%` and `%>`).
- I like it can run javascript, but it's very inconvenient to do a simple
  `forEach` or `if`.

### Mustache

- Perhaps too simple and the syntax can be a bit confusing.
- Partials. It's not easy to include them dynamically.
- The data context is a bit confusing to me.
- Very uncomfortable to work with filters.

## Vento syntax

First, let's take a look to the following example:

```vto
<header>
  {{ if printName }}
  <h1>{{ (await getUser(34)).name |> toUpperCase }}</h1>
  {{ /if }}
</header>
```

- Everything is between `{{` and `}}` tags. Unlike Nunjucks or Liquid, there's
  no distinction between tags `{% tag %}` and printing variables `{{ var }}`.
- Vento, like Eta/EJS synstax, allows to use JavaScript code inside the tags.
  For example `(await getUser(34)).name` is real JavaScript executed at runtime.
- Like Nunjucks, Liquid or Mustache, there are some specific tags like `if` for
  common things like conditions, loops, etc. The closed tag is done by
  prepending the `/` character (like Mustache).
- It's async friendly, you can use `await` everywhere.
- Filters are applied using the pipeline operator.
