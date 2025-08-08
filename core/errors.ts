import type { Token } from "./tokenizer.ts";
import type { TemplateContext } from "./environment.ts";

export interface ErrorContext {
  type: string;
  message: string;
  source: string;
  position: number;
  file?: string;
}

abstract class VentoError extends Error {
  abstract getContext():
    | ErrorContext
    | undefined
    | Promise<ErrorContext | undefined>;
}

export class TokenError extends VentoError {
  token: Token | number;
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
    return {
      type: this.name,
      message: this.message,
      source: this.source,
      position: typeof this.token === "number" ? this.token : this.token[2],
      file: this.file,
    };
  }
}

export class RuntimeError extends VentoError {
  context: TemplateContext;

  constructor(error: Error, context: TemplateContext) {
    super(error.message);
    this.name = error.name || "JavaScriptError";
    this.context = context;
    this.cause = error;
  }

  getContext() {
    if (this.cause instanceof SyntaxError) {
      return parseSyntaxError(this.cause as SyntaxError, this.context);
    }
    if (this.cause instanceof Error) {
      return parseError(this.cause, this.context);
    }
  }
}

export function createError(error: Error, context: TemplateContext): Error {
  if (error instanceof RuntimeError) return error;

  // If the error is a TokenError, we can enhance it with the context information
  if (error instanceof TokenError) {
    error.file ??= context.path;
    error.source ??= context.source;
    return error;
  }

  // JavaScript syntax errors can be parsed to get accurate position
  return new RuntimeError(error, context);
}

export async function printError(error: unknown): Promise<void> {
  if (error instanceof VentoError) {
    const context = await error.getContext();

    if (context) {
      return prettyPrintError(
        context.type,
        context.message,
        context.source,
        context.position,
        context.file,
      );
    }
  }

  console.error(error);
}

function parseError(
  error: Error,
  context: TemplateContext,
): ErrorContext | undefined {
  const stackMatch = error.stack?.match(/<anonymous>:(\d+):(\d+)/);
  if (!stackMatch) return;
  const row = Number(stackMatch[1]) - 1;
  const col = Number(stackMatch[2]);
  const position = getAccurateErrorPosition(row, col, context);
  if (position == -1) return;

  return {
    type: error.name || "JavaScriptError",
    message: error.message,
    source: context.source,
    position,
    file: context.path,
  };
}

async function parseSyntaxError(
  error: SyntaxError,
  context: TemplateContext,
): Promise<ErrorContext | undefined> {
  const code = `()=>{${context.code}}`;
  const dataUrl = "data:application/javascript;base64," + btoa(code);
  const stack = await import(dataUrl).catch(({ stack }) => stack);
  if (!stack) return;
  const stackMatch = stack?.match(/:(\d+):(\d+)$/m);
  if (!stackMatch) return;
  const row = Number(stackMatch[1]) - 1;
  const col = Number(stackMatch[2]);
  const position = getAccurateErrorPosition(row, col, context);
  if (position == -1) return;

  return {
    type: "SyntaxError",
    message: error.message,
    source: context.source,
    position,
    file: context.path,
  };
}

function getAccurateErrorPosition(
  row: number,
  col: number,
  context: TemplateContext,
): number {
  const { code, tokens, source } = context;
  if (!tokens) return -1;
  const linesAndDelims = code.split(/(\r\n?|[\n\u2028\u2029])/);
  const linesAndDelimsUntilIssue = linesAndDelims.slice(0, row * 2);
  const issueIndex = linesAndDelimsUntilIssue.join("").length + col;
  const posLine = linesAndDelimsUntilIssue.findLast((line) => {
    return /^\/\*__pos:(\d+)\*\/$/.test(line);
  });
  if (!posLine) return -1;
  const position = Number(posLine.slice(8, -2));
  const token = tokens.findLast((token) => {
    if (token[2] == undefined) return false;
    return token[2] <= position;
  });
  if (!token) return -1;
  const isJS = token[1].startsWith(">");
  const tag = isJS ? token[1].slice(1).trimStart() : token[1];
  const issueStartIndex = code.lastIndexOf(tag, issueIndex);
  if (issueStartIndex == -1) return -1;
  const sourceIssueStartIndex = source.indexOf(tag, position);
  return sourceIssueStartIndex + issueIndex - issueStartIndex - 1;
}

function prettyPrintError(
  type: string,
  message: string,
  source: string,
  position: number,
  file?: string,
): void {
  const LINE_TERMINATOR = /\r\n?|[\n\u2028\u2029]/;
  const sourceAfterIssue = source.slice(position);
  const newlineMatch = sourceAfterIssue.match(LINE_TERMINATOR);
  const endIndex = position + (newlineMatch?.index ?? sourceAfterIssue.length);
  const lines = source.slice(0, endIndex).split(LINE_TERMINATOR);
  const displayedLineEntries = [...lines.entries()].slice(-3);
  const endLineIndex = lines.at(-1)!.length + position - endIndex;
  const numberLength = (displayedLineEntries.at(-1)![0] + 1).toString().length;
  const displayedCode = displayedLineEntries.map(([index, line]) => {
    const number = `${index + 1}`.padStart(numberLength);
    const sidebar = ` \x1b[33m${number}\x1b[39m \x1b[2m|\x1b[22m `;
    return sidebar + line;
  }).join("\n");
  const sidebarWidth = numberLength + 4;
  const tooltipIndex = sidebarWidth + endLineIndex;
  const tooltipIndent = " ".repeat(tooltipIndex);
  const tooltip = `${tooltipIndent}\x1b[31m^ ${message}\x1b[39m`;
  console.error(`\x1b[31m${type}\x1b[39m: ${message}`);
  if (file) {
    console.error(`\x1b[2m${getLocation(file, source, position)}\x1b[22m`);
    console.error();
  }
  console.error(displayedCode + "\n" + tooltip);
}

function getLocation(
  file: string,
  source: string,
  position: number,
): string {
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

  return `${file}:${line}:${column}`;
}
