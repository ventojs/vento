# Set

The `{{ set [name] = [value] }}` tag allows to create or modify a global
variable. For example:

```
{{ set message = "Hello world" }}
```

Use pipes to transform the value:

```
{{ set message = "Hello world" |> toUpperCase }}
```

## Block mode

It's also possible to capture the variable value between `{{ set [name] }}` and
`{{ /set }}` tags:

```
{{ set message }}
  Hello world
{{ /set }}
```

Block mode supports pipes too:

```
{{ set message |> toUpperCase }}
  Hello world
{{ /set }}
```

## Differences between `set` and creating the variable with JavaScript

Vento allows to [run JavaScript](./javascript.md), so it's possible to create
new variables using normal JavaScript code:

```
{{> const name = "Óscar" }}
{{ name }}
```

The `set` tag provides the following benefits:

- With `set`, the variable is created globally. This means it's available in the
  included files (using [include](./include.md)).
- You can use Pipes.
- It prevents errors of initializing the variable twice. For example, the
  following code will breaks, because the same variable is initialized twice:
  ```
  {{> const name = "Óscar" }}
  {{> const name = "Laura" }}
  ```
  With `set` this will work fine:

  ```
  {{ set name = "Óscar" }}
  {{ set name = "Laura" }}
  ```
