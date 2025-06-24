type breakpoints =
  | "new-filter"
  | "open-bracket"
  | "close"
  | "unclosed";

type status =
  | "single-quote"
  | "double-quote"
  | "regex"
  | "regex-bracket"
  | "literal"
  | "bracket"
  | "square-bracket"
  | "comment"
  | "line-comment";

type Visitor = (type: breakpoints, index: number) => false | void;

const alpha = /^[a-zA-Z_$]$/;
const alphanum = /^[\w$]$/;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#keywords
const reservedKeywords = new Set([
  "abstract",
  "arguments",
  "as",
  "async",
  "await",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "from",
  "function",
  "get",
  "goto",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "let",
  "long",
  "native",
  "new",
  "null",
  "of",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "set",
  "short",
  "static",
  "super",
  "synchronized",
  "switch",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "volatile",
  "while",
  "with",
  "yield",
]);

export default function analyze(
  source: string,
  visitor: Visitor,
  keywords = new Set<string>(),
) {
  const length = source.length;
  const statuses: status[] = [];
  const scopes: Set<string>[] = [new Set()];
  let index = 0;

  while (index < length) {
    const char = source.charAt(index++);

    switch (char) {
      case "{": {
        switch (statuses[0]) {
          // String interpolation `${...}`
          case "literal":
            if (
              source.charAt(index - 2) === "$" &&
              source.charAt(index - 3) !== "\\"
            ) {
              statuses.unshift("bracket");
            }
            break;

          // Open bracket
          case undefined:
          case "square-bracket":
          case "bracket":
            if (!statuses.length && visitor("open-bracket", index) === false) {
              return;
            }
            if (char === "{") {
              scopes.push(new Set());
            }
            statuses.unshift("bracket");
            break;
        }
        break;
      }

      // Detect end brackets
      case "}": {
        switch (statuses[0]) {
          // Close a bracket
          case "bracket":
            {
              statuses.shift();
              scopes.shift();

              if (statuses.length === 0 && visitor("close", index) === false) {
                return;
              }
            }
            break;
        }
        break;
      }

      case '"': {
        switch (statuses[0]) {
          // Close double quotes
          case "double-quote":
            statuses.shift();
            break;

          // Open double quotes
          case undefined:
          case "square-bracket":
          case "bracket":
            statuses.unshift("double-quote");
            break;
        }
        break;
      }

      case "'": {
        switch (statuses[0]) {
          // Close single quotes
          case "single-quote":
            statuses.shift();
            break;

          // Open single quotes
          case undefined:
          case "square-bracket":
          case "bracket":
            statuses.unshift("single-quote");
            break;
        }
        break;
      }

      case "`": {
        switch (statuses[0]) {
          // Close literal
          case "literal":
            statuses.shift();
            break;

          // Open literal
          case undefined:
          case "square-bracket":
          case "bracket":
            statuses.unshift("literal");
            break;
        }
        break;
      }

      case "[": {
        switch (statuses[0]) {
          // Open a square bracket in a regex
          case "regex":
            if (source.charAt(index - 2) !== "\\") {
              statuses.unshift("regex-bracket");
            }
            break;

          // Open a square bracket
          case undefined:
          case "square-bracket":
          case "bracket":
            if (!statuses.length && visitor("open-bracket", index) === false) {
              return;
            }
            statuses.unshift("square-bracket");
            break;
        }
        break;
      }

      case "]": {
        switch (statuses[0]) {
          // Close a square bracket in a regex
          case "regex-bracket":
            if (source.charAt(index - 2) !== "\\") {
              statuses.shift();
            }
            break;

          // Close a square bracket
          case "square-bracket":
            statuses.shift();

            if (statuses.length === 0 && visitor("close", index) === false) {
              return;
            }
            break;
        }
        break;
      }

      case "/": {
        switch (statuses[0]) {
          // Close a comment
          case "comment":
            if (source.charAt(index - 2) === "*") {
              statuses.shift();
            }
            break;

          // Close a regular expression
          case "regex":
            if (source.charAt(index - 2) !== "\\") {
              statuses.shift();
            }
            break;

          case undefined:
          case "square-bracket":
          case "bracket":
            // Open a new comment
            if (source.charAt(index) === "*") {
              statuses.unshift("comment");
              break;
            }

            // Open a new line comment
            if (source.charAt(index - 2) === "/") {
              statuses.unshift("line-comment");
              break;
            }

            // Open a new regex
            if (
              ["(", "=", ":", ",", "?", "&", "!"].includes(
                prevChar(source, index - 1),
              )
            ) {
              statuses.unshift("regex");
              break;
            }
            break;
        }
        break;
      }

      case "\n": {
        switch (statuses[0]) {
          // Close a line comment
          case "line-comment":
            statuses.shift();
            break;
        }
        break;
      }

      case "|": {
        switch (statuses[0]) {
          // New pipeline
          case "bracket":
            if (
              source.charAt(index) === ">" &&
              visitor("new-filter", index + 1) === false
            ) {
              return;
            }
            break;
        }
        break;
      }

      default: {
        switch (statuses[0]) {
          case undefined:
          case "square-bracket":
          case "bracket": {
            // It's a keyword
            const prev = source.charAt(index - 2);
            if (alpha.test(char) && !alphanum.test(prev) && prev !== ".") {
              let keyword = char;

              while (index < length) {
                const char = source.charAt(index);
                if (!alphanum.test(char)) {
                  break;
                }
                keyword += char;
                index++;
              }

              // If the keyword is not reserved and not a defined variable, add it to the keywords set
              if (
                !reservedKeywords.has(keyword) &&
                scopes.every((scope) => !scope.has(keyword)) &&
                !Object.hasOwn(globalThis, keyword)
              ) {
                keywords.add(keyword);
              }
            }
            break;
          }
        }
      }
    }
  }

  if (statuses.length > 0) {
    visitor("unclosed", index);
  }
}

// Get the previous character in a string ignoring spaces, line breaks and tabs
function prevChar(source: string, index: number) {
  while (index > 0) {
    const char = source.charAt(--index);
    if (char !== " " && char !== "\n" && char !== "\r" && char !== "\t") {
      return char;
    }
  }
  return "";
}
