const variables = new Set([
  // JS reserved words, and some "dangerous" words like `let`, `async`, `of` or
  // `undefined`, which aren't technically reserved but don't name your
  // variables that.
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",

  // Variables that are already defined globally
  ...Object.getOwnPropertyNames(globalThis),
]);

// Remove `name` from the reserved variables
// because it's widely used in templates
// and it can cause issues if it's reserved.
variables.delete("name");

export default variables;
