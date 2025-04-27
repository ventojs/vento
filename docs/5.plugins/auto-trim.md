# Auto Trim

By default, Vento doesn't automatically try to trim the whitespace from around
tags. Using the `autoTrim` plugin, you can enable this behavior.

## Usage

`autoTrim` comes included with Vento, so you don't need to install any
additional packages. Simply import it and use it in your instance.

```js
import autoTrim from "vento/plugins/auto_trim.ts";

env.use(autoTrim());
```

By default, the tags that are trimmed are: `set`, `if`, `else`, `for`,
`function`, `async`, `export`, `import`, comments and JavaScript.

If you want to add or remove tags from the list, you can pass an array of tags
to the plugin.

```js
import autoTrim, { defaultTags } from "vento/plugins/auto_trim.ts";

env.use(autoTrim({
  tags: ["tag", ...defaultTags],
}));
```

If enabled, any of the listed tags will be trimmed away, as if it didn't exist
in the markup. It respects newlines, so it only snips out the tag, while
preserving your markup.

For example,

```vento
{{ if true }}
  Hello, {{ name }}!
  {{ set variable = 10 }}
{{ /if }}
```

Will be rendered as:

```
Hello, Name!
```

Instead of the following:

```

Hello, Name!


```
