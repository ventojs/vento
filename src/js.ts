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

export default function analyze(source: string, visitor: Visitor) {
  const length = source.length;
  const statuses: status[] = [];
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
            statuses.shift();

            if (statuses.length === 0 && visitor("close", index) === false) {
              return;
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
