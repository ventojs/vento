class VentoBaseError extends Error {
  override name = this.constructor.name;
}

export class TemplateError extends VentoBaseError {
  constructor(
    public path: string = "<unknown>",
    public source: string = "<empty file>",
    public position: number = 0,
    cause?: Error,
  ) {
    const { line, column, code } = errorLine(source, position);
    super(
      `Error in template ${path}:${line}:${column}\n\n${code.trim()}\n\n`,
      { cause },
    );
  }
}

export class TransformError extends VentoBaseError {
  constructor(
    message: string,
    public position: number = 0,
    cause?: Error,
  ) {
    super(message, { cause });
  }
}

/** Returns the number and code of the errored line */
export function errorLine(
  source: string,
  position: number,
): { line: number; column: number; code: string } {
  let line = 1;
  let column = 1;

  for (let index = 0; index < position; index++) {
    if (
      source[index] === "\n" ||
      (source[index] === "\r" && source[index + 1] === "\n")
    ) {
      line++;
      column = 1;

      if (source[index] === "\r") {
        index++;
      }
    } else {
      column++;
    }
  }

  return { line, column, code: source.split("\n")[line - 1] };
}
