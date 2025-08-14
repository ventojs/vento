import type { Token } from "./tokenizer.ts";
import type { TemplateContext } from "./environment.ts";

export interface ErrorContext {
  /* The type of error, e.g., "TokenError", "SyntaxError", etc. */
  type: string;
  /* The error message */
  message: string;
  /* The source code (.vto) where the error occurred */
  source: string;
  /* The token that caused the error */
  token: Token;
  /* The compiled code where the error occurred */
  code?: string;
  /* The line number in the compiled code where the error occurred */
  line?: number;
  /* The column number in the compiled code where the error occurred */
  column?: number;
  /* The file path where the error occurred */
  file?: string;
}

export abstract class VentoError extends Error {
  abstract getContext():
    | ErrorContext
    | undefined
    | Promise<ErrorContext | undefined>;
}

export class TokenError extends VentoError {
  token: Token | number;
  tokens?: Token[];
  source?: string;
  file?: string;

  constructor(
    message: string,
    token: Token | number,
    source?: string,
    file?: string,
  ) {
    super(message);
    this.name = "TokenError";
    this.token = token;
    this.source = source;
    this.file = file;
  }

  getContext() {
    if (!this.source || this.token === undefined) {
      return;
    }

    const token = typeof this.token === "number"
      ? this.tokens?.find((t) => t[2] === this.token)
      : this.token;

    if (!token) return;

    return {
      type: this.name,
      message: this.message,
      source: this.source,
      token,
      file: this.file,
    };
  }
}

export class RuntimeError extends VentoError {
  #context: TemplateContext;

  constructor(error: Error, context: TemplateContext) {
    super(error.message);
    this.name = error.name || "JavaScriptError";
    this.#context = context;
    this.cause = error;
  }

  getContext() {
    if (this.cause instanceof SyntaxError) {
      return getSyntaxErrorContext(this.cause as SyntaxError, this.#context);
    }
    if (this.cause instanceof Error) {
      return getErrorContext(this.cause, this.#context);
    }
  }
}

/** Create or complete VentoError with extra info from the template */
export function createError(
  error: Error,
  context: TemplateContext,
): VentoError {
  if (error instanceof RuntimeError) return error;

  // If the error is a TokenError, we can enhance it with the context information
  if (error instanceof TokenError) {
    error.file ??= context.path;
    error.source ??= context.source;
    error.tokens ??= context.tokens;
    return error;
  }

  // JavaScript syntax errors can be parsed to get accurate position
  return new RuntimeError(error, context);
}

export interface ErrorFormat {
  number: (n: string) => string;
  dim: (line: string) => string;
  error: (msg: string) => string;
}

const colors: ErrorFormat = {
  number: (n: string) => `\x1b[33m${n}\x1b[39m`,
  dim: (line: string) => `\x1b[2m${line}\x1b[22m`,
  error: (msg: string) => `\x1b[31m${msg}\x1b[39m`,
};

const plain: ErrorFormat = {
  number: (n: string) => n,
  dim: (line: string) => line,
  error: (msg: string) => msg,
};

const formats: Record<string, ErrorFormat> = {
  colors,
  plain,
};

/** Prints an error to the console in a formatted way. */
export async function printError(
  error: unknown,
  format: ErrorFormat | keyof typeof formats = plain,
): Promise<void> {
  if (error instanceof VentoError) {
    const context = await error.getContext();
    const fmt = typeof format === "string" ? formats[format] || plain : format;

    if (context) {
      console.error(stringifyError(context, fmt));
      return;
    }
  }

  console.error(error);
}

/** Converts an error context into a formatted string representation. */
export function stringifyError(
  context: ErrorContext,
  format = plain,
): string {
  const { type, message, source, token, code, line, column, file } = context;

  const sourceLines = codeToLines(source);
  const [sourceLine, sourceColumn] = getSourceLineColumn(sourceLines, token[2]);

  const pad = sourceLine.toString().length;
  const output: string[] = [];

  // Print error type and message
  output.push(`${format.error(type)}: ${message}`);

  // Print file location if available
  if (file) {
    output.push(format.dim(`${file}:${sourceLine}:${sourceColumn}`));
  }

  // Print the latest lines of the source code before the error
  for (let line = Math.max(sourceLine - 3, 1); line <= sourceLine; line++) {
    const sidebar = ` ${format.number(`${line}`.padStart(pad))} ${
      format.dim("|")
    } `;
    output.push(sidebar + sourceLines[line - 1].trimEnd());
  }

  // If we don't have the compiled code, return the tag position
  const indent = ` ${" ".repeat(pad)} ${format.dim("|")}`;

  // If we don't have the compiled code, print the tag position
  if (!code || line === undefined || column === undefined) {
    output.push(
      `${indent} ${" ".repeat(sourceColumn - 1)}${
        format.error(`^ ${message}`)
      }`,
    );
    return output.join("\n");
  }

  // Print the compiled code with the error position
  const codeLines = codeToLines(code);
  output.push(`${indent} ${format.dim(codeLines[line - 1].trimEnd())}`);
  output.push(
    `${indent} ${" ".repeat(column)} ${format.error(`^ ${message}`)}`,
  );

  return output.join("\n");
}

/** Extracts the content of a generic error */
function getErrorContext(
  error: Error,
  context: TemplateContext,
): ErrorContext | undefined {
  const { code, tokens, source } = context;
  if (!tokens) return;

  for (const frame of parseStack(error.stack)) {
    if (frame.file === "<anonymous>") {
      const lines = codeToLines(code);
      const token = searchToken(frame, tokens, lines);
      if (!token) return;

      return {
        type: error.name || "JavaScriptError",
        message: error.message,
        source,
        token,
        code,
        line: frame.line,
        column: frame.column,
        file: context.path,
      };
    }
  }
}

/** Extracts the context from a SyntaxError */
async function getSyntaxErrorContext(
  error: SyntaxError,
  context: TemplateContext,
): Promise<ErrorContext | undefined> {
  const { tokens, source } = context;
  if (!tokens) return;

  const code = `()=>{${context.code}}`;
  const url = URL.createObjectURL(
    new Blob([code], { type: "application/javascript" }),
  );
  const stack = await import(url).catch(({ stack }) => stack);
  URL.revokeObjectURL(url);

  for (const frame of parseStack(stack)) {
    const lines = codeToLines(code);
    const token = searchToken(frame, tokens, lines);
    if (!token) return;

    return {
      type: "SyntaxError",
      message: error.message,
      source,
      token,
      code,
      line: frame.line,
      column: frame.column,
      file: context.path,
    };
  }
}

const POSITION_COMMENT = /^\/\*__pos:(\d+)\*\/$/;
const LINE_TERMINATOR = /(\r\n?|[\n\u2028\u2029])/;

/** Convert the source code into an array of lines */
function codeToLines(code: string): string[] {
  const doubleLines = code.split(LINE_TERMINATOR);
  const lines: string[] = [];

  for (let i = 0; i < doubleLines.length; i += 2) {
    lines.push(`${doubleLines[i]}${doubleLines[i + 1] ?? ""}`);
  }

  return lines;
}

/** Search the closest token in the position of an error */
function searchToken(
  frame: StackFrame,
  tokens: Token[],
  lines: string[],
): Token | undefined {
  const posLine = lines
    .slice(0, frame.line - 1)
    .findLast((line) => POSITION_COMMENT.test(line.trim()));

  if (posLine) {
    const position = Number(posLine.trim().slice(8, -2));
    return tokens.findLast((token) => token[2] <= position);
  }
}

/** Get the line and column number of a position in the code */
function getSourceLineColumn(
  lines: string[],
  position: number,
): [number, number] {
  let index = 0;

  for (const [line, content] of lines.entries()) {
    const length = content.length;

    if (position < index + length) {
      return [line + 1, position - index + 1];
    }
    index += content.length;
  }

  throw new Error(
    `Position ${position} is out of bounds for the provided source lines.`,
  );
}

interface StackFrame {
  file: string;
  line: number;
  column: number;
}

/** Returns every combination of file, line and column of an error stack */
function* parseStack(stack?: string): Generator<StackFrame> {
  if (!stack) return;
  const matches = stack.matchAll(/([^(\s,]+):(\d+):(\d+)/g);
  for (const match of matches) {
    const [_, file, line, column] = match;
    yield {
      file,
      line: Number(line),
      column: Number(column),
    };
  }
}
