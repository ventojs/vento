# Raw

Use the `{{ raw }}` tag to disable the tag processing temporarily. This is
useful for generating content (ej Nunjucks, Liquid, Mustache, etc) with
conflicting syntax.

```
{{ raw }}
  In Handlebars, {{ this }} will be HTML-escaped, but
  {{{ that }}} will not.
{{ /raw }}
```
