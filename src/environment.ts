import tokenize, { Token } from "./tokenizer.ts";

import { transformTemplateCode } from "./transformer.ts";
import { TemplateError, TransformError } from "./errors.ts";

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

export interface TemplateSource {
  source: string;
  data?: Record<string, unknown>;
}

export interface Loader {
  load(file: string): TemplateSource | Promise<TemplateSource>;
  resolve(from: string, file: string): string;
}

export interface Options {
  loader: Loader;
  dataVarname: string;
  autoescape: boolean;
  autoDataVarname: boolean;
}

export class Environment {
  cache: Map<string, Template> = new Map();
  options: Options;
  tags: Tag[] = [];
  tokenPreprocessors: TokenPreprocessor[] = [];
  filters: Record<string, Filter> = {};
  utils: Record<string, unknown> = {
    callMethod,
  };

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
    if (typeof source !== "string") {
      throw new Error(
        `The source code of "${path}" must be a string. Got ${typeof source}`,
      );
    }
    const tokens = this.tokenize(source, path);
    let code = this.compileTokens(tokens).join("\n");

    const { dataVarname, autoDataVarname } = this.options;

    if (autoDataVarname) {
      try {
        code = transformTemplateCode(code, dataVarname);
      } catch (cause) {
        if (cause instanceof TransformError) {
          throw new TemplateError(path, source, cause.position, cause);
        }

        throw new Error(`Unknown error while transforming ${path}`, { cause });
      }
    }

    const constructor = new Function(
      "__file",
      "__env",
      "__defaults",
      "__err",
      `return${sync ? "" : " async"} function (${dataVarname}) {
        let __pos = 0;
        try {
          ${dataVarname} = Object.assign({}, __defaults, ${dataVarname});
          const __exports = { content: "" };
          ${code}
          return __exports;
        } catch (cause) {
          const template = __env.cache.get(__file);
          throw new __err(__file, template?.source, __pos, cause);
        }
      }
      `,
    );

    const template: Template = constructor(path, this, defaults, TemplateError);
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
      throw new TemplateError(path, source, position, error);
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
    const path = this.options.loader.resolve(from || "", file);

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
  // @ts-ignore TS doesn't know about globalThis
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
