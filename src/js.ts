type breakpoints =
  | "new-filter"
  | "open-bracket"
  | "close"
  | "unclosed";

type status =
  | "single-quote"
  | "double-quote"
  | "regex"
  | "literal"
  | "bracket"
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
      // Detect start brackets
      case "{": {
        const status = statuses[0];

        if (status === "literal" && source.charAt(index - 2) === "$") {
          statuses.unshift("bracket");
        } else if (
          status !== "comment" && status !== "single-quote" &&
          status !== "double-quote" && status !== "literal" &&
          status !== "regex" && status !== "line-comment"
        ) {
          if (
            statuses.length === 0 && visitor("open-bracket", index) === false
          ) {
            return;
          }
          statuses.unshift("bracket");
        }
        break;
      }

      // Detect end brackets
      case "}": {
        const status = statuses[0];

        if (status === "bracket") {
          statuses.shift();

          if (statuses.length === 0 && visitor("close", index) === false) {
            return;
          }
        }
        break;
      }

      // Detect double quotes
      case '"': {
        const status = statuses[0];
        if (status === "double-quote") {
          statuses.shift();
        } else if (
          status !== "comment" &&
          status !== "single-quote" &&
          status !== "literal" &&
          status !== "regex" &&
          status !== "line-comment"
        ) {
          statuses.unshift("double-quote");
        }
        break;
      }

      // Detect single quotes
      case "'": {
        const status = statuses[0];
        if (status === "single-quote") {
          statuses.shift();
        } else if (
          status !== "comment" &&
          status !== "double-quote" &&
          status !== "literal" &&
          status !== "regex" &&
          status !== "line-comment"
        ) {
          statuses.unshift("single-quote");
        }
        break;
      }

      // Detect literals
      case "`": {
        const status = statuses[0];
        if (status === "literal") {
          statuses.shift();
        } else if (
          status !== "comment" &&
          status !== "double-quote" &&
          status !== "single-quote" &&
          status !== "regex" &&
          status !== "line-comment"
        ) {
          statuses.unshift("literal");
        }
        break;
      }

      // Detect comments and regex
      case "/": {
        const status = statuses[0];
        if (
          status === "single-quote" || status === "double-quote" ||
          status === "literal" || status === "line-comment"
        ) {
          break;
        }

        // We are in a comment: close or ignore
        if (status === "comment") {
          if (source.charAt(index - 2) === "*") {
            statuses.shift();
          }
          break;
        }

        // We are in a regex: close or ignore
        if (status === "regex") {
          if (source.charAt(index - 2) !== "\\") {
            statuses.shift();
          }
          break;
        }

        // Start a new comment
        if (source.charAt(index) === "*") {
          statuses.unshift("comment");
          break;
        }

        // Start a new line comment
        if (source.charAt(index - 2) === "/") {
          statuses.unshift("line-comment");
          break;
        }

        // Start a new regex
        const prev = prevChar(source, index - 1);
        if (prev === "(" || prev === "=" || prev === ":" || prev === ",") {
          statuses.unshift("regex");
        }
        break;
      }

      // Detect end of line comments
      case "\n": {
        const status = statuses[0];
        if (status === "line-comment") {
          statuses.shift();
        }
        break;
      }

      // Detect filters
      case "|": {
        const status = statuses[0];
        if (
          status === "bracket" && source.charAt(index) === ">" &&
          visitor("new-filter", index + 1) === false
        ) {
          return;
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
