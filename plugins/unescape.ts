import type { Environment, Plugin } from "../core/environment.ts";

const NAMED_ENTITIES = /&(apos|quot|amp|lt|gt);/g;
const CHAR_REF = /&#(x[0-9A-F]{1,6}|[0-9]{1,7});/gi;

const entities: Record<string, string> = {
  apos: "'",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
};

export default function (): Plugin {
  return (env: Environment) => {
    env.filters.unescape = (value: unknown) => {
      if (!value) return "";
      return value.toString().replace(NAMED_ENTITIES, (_, name) => {
        return entities[name];
      }).replace(CHAR_REF, (full, number) => {
        const parsed = Number(`0${number}`);
        if (parsed > 0x10FFFF) return full;
        return String.fromCodePoint(parsed);
      });
    };
  };
}
