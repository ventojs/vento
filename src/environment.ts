import { isEmpty, toIterator } from "./utils.ts";
import { FileLoader, Loader } from "./loader.ts";
import tokenize from "./tokenizer.ts";
import compile from "./compiler.ts";
import forTag from "./tags/for.ts";
import ifTag from "./tags/if.ts";
import includeTag from "./tags/include.ts";
import setTag from "./tags/set.ts";

export interface Template {
  file: string;
  code: string;
  fn: (data: Record<string, unknown>) => Promise<string>;
}

export interface Options {
  includes?: string;
  filters?: Record<string, (value: unknown) => unknown>;
}

export default class Environment {
  #cache = new Map<string, Template>();
  loader: Loader;
  tags = {
    for: forTag,
    if: ifTag,
    include: includeTag,
    set: setTag,
  };
  filters = {
    upper: (value: string) => value.toUpperCase(),
    lower: (value: string) => value.toLowerCase(),
    capitalize: (value: string) =>
      Promise.resolve(value.charAt(0).toUpperCase() + value.slice(1)),
  };
  utils = {
    toIterator,
    isEmpty,
  };

  constructor(options: Options = {}) {
    this.loader = new FileLoader(options.includes || "");

    if (options.filters) {
      this.filters = { ...this.filters, ...options.filters };
    }
  }

  async run(
    file: string,
    data: Record<string, unknown>,
    from?: string,
  ): Promise<string> {
    const template = await this.getTemplate(file, from);
    return await template.fn(data);
  }

  async getTemplate(file: string, from?: string): Promise<Template> {
    const path = from ? this.loader.resolve(from, file) : file;

    if (!this.#cache.has(path)) {
      const source = await this.loader.load(path);
      const tokens = tokenize(source);
      const code = compile(tokens, "__output").join("\n");
      console.log(code);
      const constructor = new Function(
        "__file",
        "__env",
        `
          return async function (__data = {}) {
            let __output = "";
            with (__data) {
              ${code}
            }
            return __output;
          }
        `,
      );
      console.log(code);

      const template: Template = {
        file,
        code,
        fn: constructor(file, this),
      };

      this.#cache.set(file, template);
    }

    return this.#cache.get(file)!;
  }
}
