# Fragments

> [!warning]
> 
> This is a third-party plugin.
> [Source code](https://github.com/wrapperup/vento-plugin-fragments).

Adds support for
[template fragments](https://htmx.org/essays/template-fragments), which allows
you to render out small portions of a template without needing to split off into
a new file. Useful for hypermedia-oriented front-end libraries like
[htmx](https://htmx.org).

## Installation

### Deno

```js
import fragments from "https://deno.land/x/vento_plugin_fragments@0.1.0/mod.ts";

env.use(fragments());
```

### Node

```bash
npm install vento-plugin-fragments
```

Then simply import the plugin.

```js
import fragments from "vento-plugin-fragments";

env.use(fragments());
```

## Usage

Add `{{ fragment }}` tags to mark sections of the template you want to render
individually:

```nunjucks
<html>
    {{ fragment list }}
        {{ for user in users }}
            <li>{{ user }}</li>
        {{ /for }}
    {{ /fragment }}
</html>
```

Then use the `#` query parameter to render out the fragment:

```js
const users = ["Jared", "Kim", "Bob"];

const fragment = await env.run("template.vto#list", { users }).content;
```

Which renders only the fragment:

```html
<li>Jared</li>
<li>Kim</li>
<li>Bob</li>
```
