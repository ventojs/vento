# If

Use `{{ if [expression] }}` to test a condition. Any code you want to test will
be evaluated as a JavaScript expression.

```vento
{{ if it.user }}
  The user is {{ it.user }}.
{{ /if }}
```

## If/else

The `{{ else }}` tag is supported too.

```vento
{{ if it.user }}
  The user is {{ it.user }}.
{{ else }}
  No user found!
{{ /if }}
```

## If/else if

Use `{{ else if [expression] }}` to evaluate more conditions.

```vento
{{ if !it.user }}
  No user found!
{{ else if !it.user.name }}
  The user doesn't have name.s
{{ else }}
  The user is {{ it.user.name }}.
{{ /if }}
```
