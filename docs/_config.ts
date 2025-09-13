import lume from "lume/mod.ts";
import wiki from "wiki/mod.ts";
import checkUrls from "lume/plugins/check_urls.ts";

import "npm:prismjs@1.30.0/components/prism-markup-templating.js";
import "npm:prismjs@1.30.0/components/prism-lua.js";
import "../prism-vento.js";

export default lume({ location: new URL("https://vento.js.org") })
  .use(wiki())
  .use(checkUrls())
  .copy("CNAME");
