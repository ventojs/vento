import iterateTopLevel from "./js.ts";
import tokenize, { Token } from "./tokenizer.ts";

import { createError, SourceError } from "./errors.ts";

export interface TemplateResult {
  content: string;
  [key: string]: unknown;
}

export interface TemplateContext {
  source: string;
  code: string;
  path?: string;
  defaults?: Record<string, unknown>;
}

export interface Template extends TemplateContext {
  (data?: Record<string, unknown>): Promise<TemplateResult>;
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
  strict: boolean;
}

export class Environment {
  cache: Map<string, Template | Promise<Template>> = new Map();
  options: Options;
  tags: Tag[] = [];
  tokenPreprocessors: TokenPreprocessor[] = [];
  filters: Record<string, Filter> = {};
  utils: Record<string, unknown> = {
    callMethod,
    createError,
  };

  constructor(options: Options) {
    this.options = options;
    this.utils.safeString = (str: string) =>
      this.options.autoescape ? new SafeString(str) : str;
  }

  use(plugin: Plugin) {
    plugin(this);
  }

  async run(
    file: string,
    data?: Record<string, unknown>,
    from?: string,
    position?: number,
  ): Promise<TemplateResult> {
    const template = await this.load(file, from, position);
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
    const tokens = this.tokenize(source, path);
    const lastToken = tokens.at(-1)!;

    if (lastToken[0] != "string") {
      throw new SourceError("Unclosed tag", lastToken[2], path, source);
    }

    let code = "";
    try {
      code = this.compileTokens(tokens).join("\n");
    } catch (error) {
      if (error instanceof SourceError) {
        error.file ??= path;
        error.source ??= source;
      }
      throw error;
    }

    const { dataVarname, autoDataVarname, strict } = this.options;

    if (strict && autoDataVarname){
      code = `
        return new Function(
          "__env",
          \`{\${Object.keys(${dataVarname}).join(",")}}\`,
          ${JSON.stringify(`
            const __exports = { content: "" };
            ${code}
            return __exports;
          `)}
        )(__env, ${dataVarname});
      `
    } else if (autoDataVarname) {
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

    try {
      const constructor = new Function(
        "__env",
        `return async function __template(${dataVarname}) {
          let __pos=0;
          try {
            ${dataVarname} = Object.assign({}, __template.defaults, ${dataVarname});
            const __exports = { content: "" };
            ${code}
            return __exports;
          } catch (error) {
            throw __env.utils.createError(error, __template, __pos);
          }
        }`,
      );
      const template = constructor(this);
      template.path = path;
      template.code = constructor.toString();
      template.source = source;
      template.defaults = defaults || {};
      return template;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw createError(error, { source, code, path });
      }
      if (error instanceof SourceError) {
        error.file ??= path;
        error.source ??= source;
      }
      throw error;
    }
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

  async load(
    file: string,
    from?: string,
    position?: number,
  ): Promise<Template> {
    if (!file) {
      throw position !== undefined
        ? new SourceError(`Invalid template (${typeof file})`, position, from)
        : new Error(`Invalid template (${typeof file})`);
    }
    if (typeof file !== "string") {
      throw new TypeError(
        `The template filename must be a string. Got ${typeof file}`,
      );
    }
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
      .catch((error) => {
        throw position !== undefined
          ? new SourceError(
            `Error loading template: ${error.message}`,
            position,
            from,
          )
          : error;
      })
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
    closeToken?: string,
  ): string[] {
    const compiled: string[] = [];
    let openToken: Token | undefined;

    tokens:
    while (tokens.length > 0) {
      const token = tokens.shift()!;
      const [type, code, position] = token;
      openToken ??= token;

      // We found the closing tag, so we stop compiling
      if (closeToken && type === "tag" && closeToken === code) {
        return compiled;
      }

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
        compiled.push(`__pos=${position};`);
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

      throw new SourceError(`Unknown token type "${type}"`, position);
    }

    // If we reach here, it means we have an open token that wasn't closed
    if (closeToken) {
      throw new SourceError(
        `Missing closing tag ("${closeToken}" tag is expected)`,
        openToken![2],
      );
    }

    return compiled;
  }

  compileFilters(tokens: Token[], output: string, autoescape = false): string {
    let unescaped = false;

    while (tokens.length > 0 && tokens[0][0] === "filter") {
      const token = tokens.shift()!;
      const [, code, position] = token;
      const match = code.match(/^(await\s+)?([\w.]+)(?:\((.*)\))?$/);

      if (!match) {
        throw new SourceError(`Invalid filter: ${code}`, position);
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
          }__env.utils.callMethod(${position}, ${output}, "${name}", ${
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

function callMethod(
  position: number,
  // deno-lint-ignore no-explicit-any
  thisObject: any,
  method: string,
  ...args: unknown[]
) {
  if (thisObject === null || thisObject === undefined) {
    return thisObject;
  }

  if (typeof thisObject[method] === "function") {
    return thisObject[method](...args);
  }

  throw new SourceError(
    `Method "${method}" is not a function of ${typeof thisObject} variable`,
    position,
  );
}

function checkAsync(fn: () => unknown): boolean {
  return fn.constructor?.name === "AsyncFunction";
}

export class SafeString extends String {}
