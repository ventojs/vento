import iterateTopLevel from "./js.ts";
import tokenize, { Token } from "./tokenizer.ts";

import {
  printJSSyntaxError,
  printRuntimeError,
  printTagSyntaxError,
  TokenError,
} from "./errors.ts";

export interface TemplateResult {
  content: string;
  [key: string]: unknown;
}

export interface Template {
  (data?: Record<string, unknown>): Promise<TemplateResult>;
  source: string;
  code: string;
  file?: string;
  defaults?: Record<string, unknown>;
  body?: string;
  tokens?: Token[];
}

export type TokenPreprocessor = (
  env: Environment,
  tokens: Token[],
  path?: string,
) => Token[] | void;

export type Tag = (
  env: Environment,
  token: Token,
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

export interface TemplateSource {
  source: string;
  data?: Record<string, unknown>;
}
export type PrecompiledTemplate = (env: Environment) => Template;

export interface Loader {
  load(file: string): Promise<TemplateSource | PrecompiledTemplate>;
  resolve(from: string, file: string): string;
}

export interface Options {
  loader: Loader;
  dataVarname: string;
  autoescape: boolean;
  autoDataVarname: boolean;
}

export class Environment {
  cache: Map<string, Template | Promise<Template>> = new Map();
  options: Options;
  tags: Tag[] = [];
  tokenPreprocessors: TokenPreprocessor[] = [];
  filters: Record<string, Filter> = {};
  utils: Record<string, unknown> = {
    callMethod,
    safeString(str: string): SafeString {
      return new SafeString(str);
    },
    printRuntimeError,
  };

  constructor(options: Options) {
    this.options = options;
  }

  use(plugin: Plugin) {
    plugin(this);
  }

  async run(
    file: string,
    data?: Record<string, unknown>,
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
        return (await cached)(data);
      }

      const template = this.compile(source, file);
      this.cache.set(file, template);

      return await template(data);
    }

    const template = this.compile(source, file);
    return await template(data);
  }

  compile(
    source: string,
    path?: string,
    defaults?: Record<string, unknown>,
  ): Template {
    if (typeof source !== "string") {
      throw new TypeError(
        `The source code of "${path}" must be a string. Got ${typeof source}`,
      );
    }
    const rawTokens = this.tokenize(source, path);
    const tokens = [...rawTokens];
    const lastToken = tokens.at(-1)!;

    if (lastToken[0] != "string") {
      throw new TokenError("Unclosed tag", lastToken, path);
    }

    let code: string;
    try {
      code = this.compileTokens(rawTokens).join("\n");
    } catch (error) {
      if (error instanceof TokenError) {
        error.file = path;
        throw error;
      }

      if (!(error instanceof Error)) throw error;
      const parsedTokens = tokens.slice(0, -rawTokens.length);
      const context = { path, source, tokens: parsedTokens, body: "" };
      printTagSyntaxError(error, context);
      throw error;
    }

    const { dataVarname, autoDataVarname } = this.options;

    if (autoDataVarname) {
      const generator = iterateTopLevel(code);
      const [, , variables] = generator.next().value;
      while (!generator.next().done);
      variables.delete(dataVarname);

      if (variables.size > 0) {
        code = `
          var {${[...variables].join(",")}} = ${dataVarname};
          {\n${code}\n}
        `;
      }
    }

    let template, context;
    try {
      const constructor = new Function(
        "__env",
        `return async function __template(${dataVarname}) {
          try {
            ${dataVarname} = Object.assign({}, __template.defaults, ${dataVarname});
            const __exports = { content: "" };
            ${code}
            return __exports;
          } catch (cause) {
            __env.utils.printRuntimeError(cause, __template.context);
            throw cause;
          }
        }`,
      );
      template = constructor(this);
      const body = constructor.toString();
      context = { path, body, tokens, source };
    } catch (syntaxError) {
      if (!(syntaxError instanceof SyntaxError)) throw syntaxError;
      context = { path, body: code, tokens, source };
      const promise = printJSSyntaxError(syntaxError, context);
      template = async function () {
        await promise;
        throw syntaxError;
      };
    }

    template.file = path;
    template.code = code;
    template.source = source;
    template.defaults = defaults || {};
    template.context = context;
    return template;
  }

  tokenize(source: string, path?: string): Token[] {
    let tokens = tokenize(source);

    for (const tokenPreprocessor of this.tokenPreprocessors) {
      const result = tokenPreprocessor(this, tokens, path);

      if (result !== undefined) {
        tokens = result;
      }
    }

    return tokens;
  }

  async load(file: string, from?: string): Promise<Template> {
    const path = this.options.loader.resolve(from || "", file);
    let cached = this.cache.get(path);

    if (cached) {
      return cached;
    }

    // Remove query and hash params from path before loading
    const cleanPath = path
      .split("?")[0]
      .split("#")[0];

    cached = this.options.loader.load(cleanPath)
      .then((result) => {
        if (typeof result === "function") {
          return result(this);
        }
        const { source, data } = result;
        return this.compile(source, path, data);
      });

    this.cache.set(path, cached);

    return await cached;
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

      const token = tokens.shift()!;
      const [type, code, pos] = token;

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
        compiled.push(`/*__pos:${pos}*/`);
        for (const tag of this.tags) {
          const compiledTag = tag(this, token, outputVar, tokens);

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

      throw new TokenError(`Unknown token type "${type}"`, token);
    }

    return compiled;
  }

  compileFilters(tokens: Token[], output: string, autoescape = false): string {
    let unescaped = false;

    while (tokens.length > 0 && tokens[0][0] === "filter") {
      const token = tokens.shift()!;
      const [, code] = token;

      const match = code.match(/^(await\s+)?([\w.]+)(?:\((.*)\))?$/);

      if (!match) {
        throw new TokenError(`Invalid filter: ${code}`, token);
      }

      const [_, isAsync, name, args] = match;

      if (!Object.hasOwn(this.filters, name)) {
        if (name === "safe") {
          unescaped = true;
        } else if (isGlobal(name)) {
          // If a global function
          output = `${isAsync ? "await " : ""}${name}(${output}${
            args ? `, ${args}` : ""
          })`;
        } else {
          // It's a prototype's method (e.g. `String.toUpperCase()`)
          output = `${
            isAsync ? "await " : ""
          }__env.utils.callMethod(${output}, "${name}", ${args ? args : ""})`;
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
}

function isGlobal(name: string) {
  if (name == "name") return false;
  if (Object.hasOwn(globalThis, name)) {
    return true;
  }

  if (name.includes(".")) {
    const [obj, prop] = name.split(".");
    // @ts-ignore TS doesn't know about globalThis
    return Object.hasOwn(globalThis[obj], prop);
  }
}

// deno-lint-ignore no-explicit-any
function callMethod(thisObject: any, method: string, ...args: unknown[]) {
  if (thisObject === null || thisObject === undefined) {
    return thisObject;
  }

  if (typeof thisObject[method] === "function") {
    return thisObject[method](...args);
  }

  throw new Error(
    `"${method}" is not a valid filter, global object or a method of a ${typeof thisObject} variable`,
  );
}

function checkAsync(fn: () => unknown): boolean {
  return fn.constructor?.name === "AsyncFunction";
}

export class SafeString extends String {}
