import tokenize, { Token } from "./tokenizer.ts";

import type { Loader } from "./loader.ts";

export interface Template {
  (data?: Record<string, unknown>): Promise<string>;
  code: string;
  file?: string;
}

export type Tag = (
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
) => string | undefined;

// deno-lint-ignore no-explicit-any
export type Filter = (...args: any[]) => any;

export type Plugin = (env: Environment) => void;

export interface Options {
  loader: Loader;
  dataVarname?: string;
}

export class Environment {
  cache = new Map<string, Template>();
  options: Options;
  tags: Tag[] = [];
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
  ): Promise<string> {
    const template = await this.load(file, from);
    return await template(data);
  }

  async runString(
    source: string,
    data?: Record<string, unknown>,
    file?: string,
  ): Promise<string> {
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

  compile(
    source: string,
    path?: string,
    defaults?: Record<string, unknown>,
  ): Template {
    try {
      const tokens = tokenize(source);
      const code = this.compileTokens(tokens).join("\n");
      const constructor = new Function(
        "__file",
        "__env",
        "__defaults",
        `return async function (__data) {
          try {
            __data = Object.assign({}, __defaults, __data);
            const ${this.options.dataVarname} = __data;
            let __output = "";
            with (__data) {
              ${code}
            }
            return __output;
          } catch (cause) {
            throw new Error(\`Error rendering template: \${__file}\`, { cause });
          }
        }
        `,
      );
      // console.log(code);
      const template: Template = constructor(path, this, defaults);
      template.file = path;
      template.code = code;
      return template;
    } catch (cause) {
      throw new Error(`Error compiling template: ${path || source}`, { cause });
    }
  }

  async load(file: string, from?: string): Promise<Template> {
    const path = from ? this.options.loader.resolve(from, file) : file;

    if (!this.cache.has(path)) {
      const { source, data } = await this.options.loader.load(path);
      const template = this.compile(source, path, data);

      this.cache.set(file, template);
    }

    return this.cache.get(file)!;
  }

  compileTokens(
    tokens: Token[],
    outputVar = "__output",
    stopAt?: string[],
  ): string[] {
    const compiled: string[] = [];

    tokens:
    while (tokens.length > 0) {
      if (stopAt && tokens[0][0] === "tag" && stopAt.includes(tokens[0][1])) {
        break;
      }

      const [type, code] = tokens.shift()!;

      if (type === "string") {
        compiled.push(`${outputVar} += \`${code}\`;`);
        continue;
      }

      if (type === "tag") {
        for (const tag of this.tags) {
          const compiledTag = tag(this, code, outputVar, tokens);

          if (typeof compiledTag === "string") {
            compiled.push(compiledTag);
            continue tokens;
          }
        }

        // Unknown tag, just print it
        const expression = this.compileFilters(tokens, code);
        compiled.push(`${outputVar} += (${expression}) ?? "";`);
        continue;
      }

      throw new Error(`Unknown token type "${type}"`);
    }

    return compiled;
  }

  compileFilters(tokens: Token[], output: string) {
    while (tokens.length > 0 && tokens[0][0] === "filter") {
      const [, name, args] = tokens.shift()!;
      if (!this.filters[name]) {
        // It's a prototype's method (e.g. `String.toUpperCase()`)
        output = `(${output})?.${name}?.(${args ? args : ""})`;
      } else {
        // It's a filter (e.g. filters.upper())
        output = `await __env.filters.${name}(${output}${
          args ? `, ${args}` : ""
        })`;
      }
    }

    return output;
  }
}
