# Layout

The `{{ layout }}` tag allows to capture some content in a template and render
it into another template.

For example, let's say you have the following `container.vto` template:

```html
<div class="container">
  {{ content }}
</div>
```

You can pass content to this template easily with the `layout` tag:

```html
{{ layout "container.vto" }}
<h1>Hello world</h1>
{{ /layout }}
```

## Data

In addition to the `content` variable, the layout inherits the same data as the
main file (it works exactly in the same way as [`include`](./include.md)). And
you can add additional data by passing an object after the layout file name.

```hml
{{ layout "container.vto" { size: "big" } }}
<h1>Hello world</h1>
{{ /layout }}
```

Now, the layout content has the `size` variable:

```html
<div class="container size-{{ size }}">
  {{ content }}
</div>
```
