import type { Environment, Plugin } from "../core/environment.ts";

const UNSAFE = /['"&<>]/g;
const escapeMap: Record<string, string> = {
  "'": "&apos;",
  '"': "&quot;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

export default function (): Plugin {
  return (env: Environment) => {
    env.filters.escape = (value: unknown) => {
      if (!value) return "";
      return value.toString().replace(UNSAFE, (match) => escapeMap[match]);
    };
  };
}
