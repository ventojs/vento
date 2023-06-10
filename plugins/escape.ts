import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.filters.escape = escape;
  };
}

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#x60;",
};

function escape(str: string) {
  return str.replace(/[&<>"'`]/g, (match) => escapeMap[match]);
}
