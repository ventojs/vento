import tokenize, { Token } from "./tokenizer.ts";

import type { Loader } from "./loader.ts";
import { transformTemplateCode } from "./transformer.ts";

export interface TemplateResult {
  content: string;
  [key: string]: unknown;
}

export interface Template {
  (data?: Record<string, unknown>): Promise<TemplateResult>;
  source: string;
  code: string;
  file?: string;
}

export interface TemplateSync {
  (data?: Record<string, unknown>): TemplateResult;
  source: string;
  code: string;
  file?: string;
}

export type TokenPreprocessor = (
  env: Environment,
  tokens: Token[],
  path?: string,
) => Token[] | void;

export type Tag = (
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
) => string | undefined;

export type FilterThis = {
  data: Record<string, unknown>;
  env: Environment;
};

// deno-lint-ignore no-explicit-any
export type Filter = (this: FilterThis, ...args: any[]) => any;

export type Plugin = (env: Environment) => void;

export interface Options {
  loader: Loader;
  dataVarname: string;
  autoescape: boolean;
  useWith: boolean;
}

export class Environment {
  cache = new Map<string, Template>();
  options: Options;
  tags: Tag[] = [];
  tokenPreprocessors: TokenPreprocessor[] = [];
  filters: Record<string, Filter> = {};
  utils: Record<string, unknown> = {};

  constructor(options: Options) {
    this.options = options;
  }

  use(plugin: Plugin) {
    plugin(this);
  }

  async run(
    file: string,
    data: Record<string, unknown>,
    from?: string,
  ): Promise<TemplateResult> {
    const template = await this.load(file, from);
    return await template(data);
  }

  async runString(
    source: string,
    data?: Record<string, unknown>,
    file?: string,
  ): Promise<TemplateResult> {
    if (file) {
      const cached = this.cache.get(file);

      if (cached) {
        return await cached(data);
      }

      const template = this.compile(source, file);
      this.cache.set(file, template);

      return await template(data);
    }

    const template = this.compile(source, file);
    return await template(data);
  }

  runStringSync(
    source: string,
    data?: Record<string, unknown>,
  ): TemplateResult {
    const template = this.compile(source, "", {}, true);
    return template(data);
  }

  compile(
    source: string,
    path?: string,
    defaults?: Record<string, unknown>,
    sync?: false,
  ): Template;
  compile(
    source: string,
    path?: string,
    defaults?: Record<string, unknown>,
    sync?: true,
  ): TemplateSync;
  compile(
    source: string,
    path?: string,
    defaults?: Record<string, unknown>,
    sync = false,
  ): Template | TemplateSync {
    const tokens = this.tokenize(source, path);
    let code = this.compileTokens(tokens).join("\n");

    const { dataVarname, useWith } = this.options;

    if (useWith) {
      code = transformTemplateCode(code, dataVarname);
    }

    const constructor = new Function(
      "__file",
      "__env",
      "__defaults",
      `return${sync ? "" : " async"} function (${dataVarname}) {
        let __pos = 0;
        try {
          ${dataVarname} = Object.assign({}, __defaults, ${dataVarname});
          const __exports = { content: "" };
          ${code}
          return __exports;
        } catch (cause) {
          const template = __env.cache.get(__file);
          throw __env.createError(__file, template?.source || "", __pos, cause);
        }
      }
      `,
    );

    const template: Template = constructor(path, this, defaults);
    template.file = path;
    template.code = code;
    template.source = source;
    return template;
  }

  tokenize(source: string, path?: string): Token[] {
    const result = tokenize(source);
    let { tokens } = result;
    const { position, error } = result;

    if (error) {
      throw this.createError(path || "unknown", source, position, error);
    }

    for (const tokenPreprocessor of this.tokenPreprocessors) {
      const result = tokenPreprocessor(this, tokens, path);

      if (result !== undefined) {
        tokens = result;
      }
    }

    return tokens;
  }

  async load(file: string, from?: string): Promise<Template> {
    const path = from ? this.options.loader.resolve(from, file) : file;

    if (!this.cache.has(path)) {
      // Remove query and hash params from path before loading
      const cleanPath = path
        .split("?")[0]
        .split("#")[0];

      const { source, data } = await this.options.loader.load(cleanPath);
      const template = this.compile(source, path, data);

      this.cache.set(path, template);
    }

    return this.cache.get(path)!;
  }

  compileTokens(
    tokens: Token[],
    outputVar = "__exports.content",
    stopAt?: string[],
  ): string[] {
    const compiled: string[] = [];

    tokens:
    while (tokens.length > 0) {
      if (stopAt && tokens[0][0] === "tag" && stopAt.includes(tokens[0][1])) {
        break;
      }

      const [type, code, pos] = tokens.shift()!;

      if (type === "comment") {
        continue;
      }

      if (type === "string") {
        if (code !== "") {
          compiled.push(`${outputVar} += ${JSON.stringify(code)};`);
        }
        continue;
      }

      if (type === "tag") {
        compiled.push(`__pos = ${pos};`);
        for (const tag of this.tags) {
          const compiledTag = tag(this, code, outputVar, tokens);

          if (typeof compiledTag === "string") {
            compiled.push(compiledTag);
            continue tokens;
          }
        }

        // Unknown tag, just print it
        const expression = this.compileFilters(
          tokens,
          code,
          this.options.autoescape,
        );
        compiled.push(`${outputVar} += (${expression}) ?? "";`);
        continue;
      }

      throw new Error(`Unknown token type "${type}"`);
    }

    return compiled;
  }

  compileFilters(tokens: Token[], output: string, autoescape = false): string {
    let unescaped = false;

    while (tokens.length > 0 && tokens[0][0] === "filter") {
      const [, code] = tokens.shift()!;

      const match = code.match(/^(await\s+)?([\w.]+)(?:\((.*)\))?$/);

      if (!match) {
        throw new Error(`Invalid filter: ${code}`);
      }

      const [_, isAsync, name, args] = match;

      if (!this.filters[name]) {
        if (name === "safe") {
          unescaped = true;
        } else if (isGlobal(name)) {
          // If a global function
          output = `${isAsync ? "await " : ""}${name}(${output}${
            args ? `, ${args}` : ""
          })`;
        } else {
          // It's a prototype's method (e.g. `String.toUpperCase()`)
          output = `${isAsync ? "await " : ""}(${output})?.${name}?.(${
            args ? args : ""
          })`;
        }
      } else {
        // It's a filter (e.g. filters.upper())
        const { dataVarname } = this.options;
        output = `${
          (isAsync || checkAsync(this.filters[name])) ? "await " : ""
        }__env.filters.${name}.call({data:${dataVarname},env:__env}, ${output}${
          args ? `, ${args}` : ""
        })`;
      }
    }

    // Escape by default
    if (autoescape && !unescaped) {
      output = `__env.filters.escape(${output})`;
    }

    return output;
  }

  createError(
    path: string,
    source: string,
    position: number,
    cause: Error,
  ): Error {
    if (!source) {
      return cause;
    }

    const [line, column, code] = errorLine(source, position);

    return new Error(
      `Error in the template ${path}:${line}:${column}\n\n${code.trim()}\n\n> ${cause.message}\n`,
      { cause },
    );
  }
}

function isGlobal(name: string) {
  // @ts-ignore TS doesn't know about globalThis
  if (globalThis[name]) {
    return true;
  }

  if (name.includes(".")) {
    const [obj, prop] = name.split(".");
    // @ts-ignore TS doesn't know about globalThis
    return typeof globalThis[obj]?.[prop] === "function";
  }
}

/** Returns the number and code of the errored line */
export function errorLine(
  source: string,
  pos: number,
): [number, number, string] {
  let line = 1;
  let column = 1;

  for (let index = 0; index < pos; index++) {
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

  return [line, column, source.split("\n")[line - 1]];
}

function checkAsync(fn: () => unknown): boolean {
  return fn.constructor?.name === "AsyncFunction";
}
