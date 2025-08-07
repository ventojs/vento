import { SafeString } from "../core/environment.ts";
import type { Environment, Plugin } from "../core/environment.ts";

const UNSAFE = /[<>"&']/;

export default function (): Plugin {
  return (env: Environment) => {
    env.filters.escape = (value: any): string => {
      if (!value) return "";
      if (value instanceof SafeString) return value.toString();

      const str = value.toString();

      const match = UNSAFE.exec(str);

      if (match === null) {
        return str;
      }

      let html = "";

      for (let i = match.index; i < str.length; i++) {
        switch (str.charCodeAt(i)) {
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
            html += str[i];
        }
      }

      return html;
    };
  };
}
