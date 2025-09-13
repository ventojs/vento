import { SafeString } from "../core/environment.ts";
import type { Environment, Plugin } from "../core/environment.ts";

const UNSAFE = /[<>"&']/g;
const ESCAPES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '\'': '&apos;',
  '"': '&quot;',
  '&': '&amp;',
}

export default function (): Plugin {
  return (env: Environment) => {
    env.filters.escape = (value: unknown): string => {
      if (!value) return "";
      if (value instanceof SafeString) return value.toString();

      const str = value.toString();

      return str.replace(UNSAFE, match => ESCAPES[match])
    };
  };
}
