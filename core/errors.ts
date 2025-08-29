import type { TemplateContext } from "./environment.ts";

export interface ErrorContext {
  /* The type of error, e.g., "SourceError", "SyntaxError", etc. */
  type: string;
  /* The error message */
  message: string;
  /* The source code (.vto) where the error occurred */
  source?: string;
  /* The token position in the source code */
  position?: number;
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
  abstract getContext(): ErrorContext | Promise<ErrorContext>;
}

export class SourceError extends VentoError {
  position?: number;
  file?: string;
  source?: string;

  constructor(
    message: string,
    position?: number,
    file?: string,
    source?: string,
  ) {
    super(message);
    this.name = "SourceError";
    this.position = position;
    this.file = file;
    this.source = source;
  }

  getContext() {
    return {
      type: this.name,
      message: this.message,
      position: this.position,
      file: this.file,
      source: this.source,
    };
  }
}

export class RuntimeError extends VentoError {
  #context: TemplateContext;
  position?: number;

  constructor(error: Error, context: TemplateContext, position?: number) {
    super(error.message);
    this.name = error.name || "JavaScriptError";
    this.#context = context;
    this.cause = error;
    this.position = position;
  }

  async getContext() {
    const { code, source, path } = this.#context;

    // If we don't have the position, we cannot provide a context
    // Try to get the context from a SyntaxError
    if (this.position === undefined) {
      try {
        return (await getSyntaxErrorContext(
          this.cause as SyntaxError,
          this.#context,
        )) ??
          {
            type: this.name || "JavaScriptError",
            message: this.message,
            source,
            code,
            file: path,
          };
      } catch {
        return {
          type: this.name || "JavaScriptError",
          message: this.message,
          source,
          code,
          file: path,
        };
      }
    }

    // Capture the exact position of the error in the compiled code
    for (const frame of getStackFrames(this.cause)) {
      if (
        frame.file !== "<anonymous>" &&
        path &&
        ![path + ".js", path + ".mjs"].some((p) => frame.file.endsWith(p))
      ) {
        continue;
      }

      return {
        type: this.name || "JavaScriptError",
        message: this.message,
        source,
        position: this.position,
        code,
        line: frame.line,
        column: frame.column,
        file: path,
      };
    }

    // As a fallback, return the error with the available context
    return {
      type: this.name || "JavaScriptError",
      message: this.message,
      source,
      position: this.position,
      code,
      file: path,
    };
  }
}

/** Create or complete VentoError with extra info from the template */
export function createError(
  error: Error,
  context: TemplateContext,
  position?: number,
): VentoError {
  if (error instanceof RuntimeError) return error;

  // If the error is a SourceError, we can fill the missing context information
  if (error instanceof SourceError) {
    error.file ??= context.path;
    error.source ??= context.source;
    error.position ??= position;
    return error;
  }

  // JavaScript syntax errors can be parsed to get accurate position
  return new RuntimeError(error, context, position);
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
  const { type, message, source, position, code, line, column, file } = context;
  const output: string[] = [];

  // Print error type and message
  output.push(`${format.error(type)}: ${message}`);

  // If we don't know the position, we cannot print the source code
  if (position === undefined || source === undefined) {
    if (file) {
      output.push(format.dim(file));
    }
    return output.join("\n");
  }

  const sourceLines = codeToLines(source);
  const [sourceLine, sourceColumn] = getSourceLineColumn(sourceLines, position);

  // Print file location if available
  if (file) {
    output.push(format.dim(`${file}:${sourceLine}:${sourceColumn}`));
  }

  const pad = sourceLine.toString().length;

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
  output.push(`${indent} ${" ".repeat(sourceColumn - 1)}${format.error("^")}`);
  output.push(`${indent} ${format.dim(codeLines[line - 1]?.trimEnd() || "")}`);
  output.push(
    `${indent} ${" ".repeat(column)} ${format.error(`^ ${message}`)}`,
  );

  return output.join("\n");
}

/**
 * Extracts the context from a SyntaxError
 * It does not work on Node.js and Bun due to the lack of position information
 * in the stack trace of a dynamic import error.
 */
async function getSyntaxErrorContext(
  error: SyntaxError,
  context: TemplateContext,
): Promise<ErrorContext | undefined> {
  const { source, code } = context;
  const url = URL.createObjectURL(
    new Blob([code], { type: "application/javascript" }),
  );
  const err = await import(url).catch((e) => e);
  URL.revokeObjectURL(url);

  for (const frame of getStackFrames(err)) {
    if (!frame.file.startsWith("blob:")) {
      continue;
    }

    return {
      type: "SyntaxError",
      message: error.message,
      source,
      position: searchPosition(frame, code) ?? 0,
      code,
      line: frame.line,
      column: frame.column,
      file: context.path,
    };
  }
}

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

const POSITION_VARIABLE = /^__pos=(\d+);$/;

/** Search the closest token to an error */
function searchPosition(
  frame: StackFrame,
  code: string,
): number | undefined {
  const posLine = codeToLines(code)
    .slice(0, frame.line - 1)
    .findLast((line) => POSITION_VARIABLE.test(line.trim()));
  if (posLine) {
    return Number(posLine.trim().slice(6, -1));
  }
}

/** Get the line and column number of a position in the code */
function getSourceLineColumn(
  lines: string[],
  position: number,
): [number, number] {
  if (position < 0) {
    return [1, 1]; // Position is before the start of the source
  }
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
// deno-lint-ignore no-explicit-any
function* getStackFrames(error: any): Generator<StackFrame> {
  // Firefox specific
  const { columnNumber, lineNumber, fileName } = error;
  if (columnNumber !== undefined && lineNumber !== undefined && fileName) {
    yield {
      file: normalizeFile(fileName),
      line: lineNumber,
      column: columnNumber,
    };
  }

  const { stack } = error;

  if (!stack) {
    return;
  }

  const matches = stack.matchAll(/([^(\s,]+):(\d+):(\d+)/g);
  for (const match of matches) {
    const [_, file, line, column] = match;

    // Skip Node, Bun & Deno internal stack frames
    if (
      file.startsWith("node:") || file.startsWith("ext:") || file === "native"
    ) {
      continue;
    }

    yield {
      file: normalizeFile(file),
      line: Number(line),
      column: Number(column),
    };
  }
}

function normalizeFile(file?: string): string {
  if (!file) return "<anonymous>";
  // Firefox may return "Function" for anonymous functions
  if (file === "Function") return "<anonymous>";
  return file;
}
