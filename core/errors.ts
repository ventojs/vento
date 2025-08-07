import type { Token } from "./tokenizer.ts";

export class TokenError extends Error {
  token: Token;
  file?: string;

  constructor(message: string, token: Token, file?: string) {
    super(message);
    this.name = "TokenError";
    this.token = token;
    this.file = file;
  }
}

export type ErrorContext = {
  path?: string;
  source: string;
  body: string;
  tokens?: Token[];
};

export function printVentoSyntaxError(
  error: Error,
  context: ErrorContext,
): void {
  const token = context.tokens!.findLast((token) => token[2] != undefined);
  const position = token![2]!;
  prettyPrintError("VentoSyntaxError", error, context.source, position);
}

export function printTagSyntaxError(
  error: Error,
  context: ErrorContext,
): void {
  const token = context.tokens?.at(-1)!;
  if (!token) throw error;
  const position = token[2]! + 2;
  prettyPrintError("TagSyntaxError", error, context.source, position);
}

export async function printJSSyntaxError(
  error: SyntaxError,
  context: ErrorContext,
): Promise<void> {
  const code = `()=>{${context.body}}`;
  const dataUrl = "data:application/javascript;base64," + btoa(code);
  const stack = await import(dataUrl).catch(({ stack }) => stack);
  if (!stack) throw error;
  const stackMatch = stack?.match(/:(\d+):(\d+)$/m);
  if (!stackMatch) throw error;
  const row = Number(stackMatch[1]) - 1;
  const col = Number(stackMatch[2]);
  const position = getAccurateErrorPosition(row, col, context);
  if (position == -1) throw error;
  prettyPrintError("SyntaxError", error, context.source, position);
}

export function printRuntimeError(
  error: Error,
  context: ErrorContext,
): void {
  const stackMatch = error.stack?.match(/<anonymous>:(\d+):(\d+)/);
  if (!stackMatch) throw error;
  const row = Number(stackMatch[1]) - 1;
  const col = Number(stackMatch[2]);
  const position = getAccurateErrorPosition(row, col, context);
  if (position == -1) throw error;
  prettyPrintError("RuntimeError", error, context.source, position);
}

function getAccurateErrorPosition(
  row: number,
  col: number,
  context: ErrorContext,
): number {
  const { body, tokens, source } = context;
  if (!tokens) return -1;
  const linesAndDelims = body.split(/(\r\n?|[\n\u2028\u2029])/);
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
  const issueStartIndex = body.lastIndexOf(tag, issueIndex);
  if (issueStartIndex == -1) return -1;
  const sourceIssueStartIndex = source.indexOf(tag, position);
  return sourceIssueStartIndex + issueIndex - issueStartIndex - 1;
}

function prettyPrintError(
  type: string,
  error: Error,
  source: string,
  position: number,
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
  const tooltip = `${tooltipIndent}\x1b[31m^ ${error.message}\x1b[39m`;
  console.log(`\x1b[31m${type}\x1b[39m: ${error.message}`);
  console.log(displayedCode + "\n" + tooltip);
  console.log("\x1b[2m\nOriginal error:\x1b[22m");
  throw error;
}
