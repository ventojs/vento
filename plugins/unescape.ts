import type { Environment } from "../src/environment.ts";

export default function () {
  return (env: Environment) => {
    env.filters.unescape = unescape;
  };
}

const unescapeMap: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x60;": "`",
};

function unescape(str: string) {
  return str.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;|&#x60;)/g,
    (match) => unescapeMap[match],
  );
}
