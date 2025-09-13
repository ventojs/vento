import { SafeString } from "../core/environment.ts";
import type { Environment, Plugin } from "../core/environment.ts";

const UNSAFE = /[<>"&']/g;

export default function (): Plugin {
  return (env: Environment) => {
    env.filters.escape = (value: unknown): string => {
      if (!value) return "";
      if (value instanceof SafeString) return value.toString();

      const str = value.toString();

      let html = "";
      let previous = 0;
      for (let match = UNSAFE.exec(str); match; match = UNSAFE.exec(str)) {
        html += str.slice(previous, match.index);
        previous = match.index + 1;
        switch (str.charCodeAt(match.index)) {
          case 34: // "
            html += "&quot;";
            break;
          case 39: // '
            html += "&apos;";
            break;
          case 38: // &
            html += "&amp;";
            break;
          case 60: // <
            html += "&lt;";
            break;
          case 62: // >
            html += "&gt;";
            break;
          default:
            throw Error("Unreachable escape");
        }
      }

      html += str.slice(previous);
      return html;
    };
  };
}
