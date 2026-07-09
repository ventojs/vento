import { SafeString } from "../core/environment.ts";
import type { Environment, Plugin } from "../core/environment.ts";

export default function (): Plugin {
  return (env: Environment) => {
    env.filters.empty = (value: unknown): boolean => {
      if (!value) return true;
      if (typeof value == "string" || value instanceof SafeString) {
        return value.toString().trim() === "";
      }
      if (typeof value != "object") return false;
      if (Array.isArray(value)) return value.length === 0;
      if (isPlainObject(value)) return Object.keys(value).length === 0;
      return false;
    };
  };
}

const objectConstructor = {}.constructor;

/** Check if the argument passed is a plain object */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null &&
    (obj.constructor === objectConstructor || obj.constructor === undefined)
}
