# Pipes

Pipes are the way to chain functions to transform a value. Vento uses the
[pipeline operator](https://github.com/tc39/proposal-pipeline-operator) (`|>`).
Note: this is not exactly like the last proposal for JavaScript, it's inspired
by
([the previous proposal](https://github.com/valtech-nyc/proposal-fsharp-pipelines)
that was rejected but it's way more simple and fits better for filters.

Pipes can be used to [print a variable](./print.md), [save it](./set.md) or
[before iterating a collection](./for.md#pipes).

Pipes can run three types of functions, in this order of priority:

## Filters

Filters are custom functions that you can configure to transform variables. By
default Vento has the `escape` filter out of the box, to escape HTML code:

```
{{ "<h1>Hello world</h1>" |> escape }}
```

If the filter accepts additional arguments you can pass them between parenthesis:

```
{{ "<h1>Hello world</h1>" |> filter_name(arg1, arg2) }}
```

## Global functions

If the function is a standard function available globally (for example
`JSON.stringify()`), Vento will execute:

```
{{ {name: "Óscar", surname: "Otero"} |> JSON.stringify }}
```

This is equivalent to:

```
{{ JSON.stringify({name: "Óscar", surname: "Otero"}) }}
```

The value is passed as the first argument. Any other argument will go in the
next positions:

```
{{ {name: "Óscar", surname: "Otero"} |> JSON.stringify(null, 2) }}
```

This is equivalent to:

```
{{ JSON.stringify({name: "Óscar", surname: "Otero"}, null, 2) }}
```

## Prototype functions

As a fallback, Vento will execute the function as a prototype of the variable.
In the following example, the variable is a string
[that has the `toUpperCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase)
method, so it can be passed as a Pipe:

```
{{ "Hello world" |> toUpperCase }}
```

This is equivalent to:

```
{{ "Hello world".toUpperCase() }}
```

## Chain pipes

You can chain different functions with the pipe operator and use `await` for
async functions. For example:

```
{{ "https://example.com/data.json" |> await fetch |> await json |> JSON.stringify }}
```

- [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) is a global
  async function so Vento will execute it by passing the url as the argument.
- `json` is a method of the response returned by fetch and it's async.
- [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
  is a global function

The compiled code of this is equivalent to:

```js
JSON.stringify(await (await fetch("https://example.com/data.json")).json());
```
