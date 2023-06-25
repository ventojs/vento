# For

Use `{{ for [value] of [collection] }}` tag to iterate over arrays,
dictionaries, numbers, strings, etc. For example:

```
{{ for number of [1, 2, 3] }}
  {{ number }}
{{ /for }}
```

Vento will evaluate any code in the `[collection]` as JavaScript code, so you
can place any expression you like:

```
{{ for pair_number of [1, 2, 3].map((n) => n%2) }}
  {{ pair_number }}
{{ /for }}
```

## Get the key and value

Use the `{{ for [key], [value] of [collection] }}` syntax to get the key and the
value of the entries:

```
<dl>
{{ for key, value of { name: "Óscar", surname: "Otero" } }}
  <dt>{{ key }}</dt>
  <dd>{{ value }}</dd>
{{ /for }}
</dl>
```

## Async iterators

Use `for await` for async iterators:

```
{{ for await item of getItems() }}
  {{ item }}
{{ /for }}
```

## Type casting

If the collection is not iterable, Vento will try to convert it to an iterable
object.

### Numbers

Any integer number will be converted to an array. The following example:

```
{{ for count of 10 }}
  {{ count }}
{{ /for }}
```

is equivalent to:

```
{{ for count of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }}
  {{ count }}
{{ /for }}
```

### Strings

Any string will be converted to an array with one element per character. The
following example:

```
{{ for letter of "Hello" }}
  {{ letter }}
{{ /for }}
```

is equivalent to:

```
{{ for letter of ["H", "e", "l", "l", "o"] }}
  {{ letter }}
{{ /for }}
```

### NULL and undefined values

Any NULL or undefined variable is converted to an empty array so the code won't
fail:

```
{{ for item of undefined }}
  {{ item }}
{{ /for }}
```

is equivalent to:

```
{{ for item of [] }}
  {{ item }}
{{ /for }}
```

## Pipes

You can use Pipes to transform the iterable object before iterating it. For
example to filter by even numbers:

```
{{ for evenNumber of [1, 2, 3] |> filter((n) => n % 2 === 0) }}
  {{ evenNumber }}
{{ /for }}
```
