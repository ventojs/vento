# Print variables

Put a variable or expression between `{{ }}` to output the result.

For example, to print the variable `name`:

```
{{ name }}
```

Everything you put between `{{ }}` is evaluated as JavaScript code so you can
print the result of an expression:

```
{{ (name + " " + surname).toUpperCase() }}
```

Or a condition:

```
{{ name || "Unknown name" }}
```

Or an async operation (using `await`):

```
{{ await users.getUserName(23) }}
```

## Triming the previous/next content

Use `-` character next to the opening tag or previous to the closing tag to
remove all white spaces and line breaks of the previous or next content.

In the following example, the `-` in the opening tag configure Vento to remove
the white space before the printing tag:

```html
<h1>
  {{- "Hello world" }}
</h1>
```

The result is:

```html
<h1>Hello world
</h1>
```

Use the `-` character in both opening and closing tags to remove the white space
previous and next the printing tag:

```html
<h1>
  {{- "Hello world" -}}
</h1>
```

The result is:

```html
<h1>Hello world</h1>
```

## Pipes

Pipes allows to transform the content before printing it using custom functions
or global functions. Use `|>` to apply functions.

Vento comes with the `escape` filter by default. This filter escapes the html
code. For example:

```
{{ "<h1>Hello world</h1>" |> escape }}
```

This code outputs:

```
&lt;h1&gt;Hello world&lt;/h1&gt;
```
