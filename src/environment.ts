import { isEmpty, toIterator } from "./utils.ts";
import { FileLoader, Loader } from "./loader.ts";
import tokenize, { Token } from "./tokenizer.ts";
import forTag from "./tags/for.ts";
import ifTag from "./tags/if.ts";
import includeTag from "./tags/include.ts";
import setTag from "./tags/set.ts";
import printTag from "./tags/print.ts";

export interface Template {
  (data: Record<string, unknown>): Promise<string>;
  code: string;
  file?: string;
}

export interface Options {
  includes?: string;
}

export type Tag = (
  env: Environment,
  code: string,
  output: string,
  tokens: Token[],
) => string | undefined;

// deno-lint-ignore no-explicit-any
export type Filter = (...args: any[]) => any;

export default class Environment {
  cache = new Map<string, Template>();
  loader: Loader;
  tags: Tag[] = [forTag, ifTag, includeTag, setTag, printTag];
  filters: Record<string, Filter> = {};
  utils = {
    toIterator,
    isEmpty,
  };

  constructor(options: Options = {}) {
    this.loader = new FileLoader(options.includes || "");
  }

  async run(
    file: string,
    data: Record<string, unknown>,
    from?: string,
  ): Promise<string> {
    const template = await this.load(file, from);
    return await template(data);
  }

  compile(
    source: string,
    path?: string,
  ): Template {
    const tokens = tokenize(source);
    const code = this.compileTokens(tokens).join("\n");
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

    const template: Template = constructor(path, this);
    template.file = path;
    template.code = code;
    return template;
  }

  async load(file: string, from?: string): Promise<Template> {
    const path = from ? this.loader.resolve(from, file) : file;

    if (!this.cache.has(path)) {
      const source = await this.loader.load(path);
      const template = this.compile(source, path);
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
      }

      if (type === "tag") {
        for (const tag of this.tags) {
          const compiledTag = tag(this, code, outputVar, tokens);

          if (typeof compiledTag === "string") {
            compiled.push(compiledTag);
            continue tokens;
          }
        }

        throw new Error(`Unknown block: ${code}`);
      }
    }

    return compiled;
  }

  compileFilters(tokens: Token[], output: string) {
    while (tokens.length > 0 && tokens[0][0] === "filter") {
      const [, name, args] = tokens.shift()!;
      if (!this.filters[name]) {
        // It's a prototype's method (e.g. `String.toUpperCase()`)
        output = `(${output}).${name}(${args ? `, ${args}` : ""})`;
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
