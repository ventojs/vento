import lume from "lume/mod.ts";
import wiki from "wiki/mod.ts";

import "npm:prismjs@1.29.0/components/prism-markup-templating.js";
import "../prism-vento.js";

export default lume({ location: new URL("https://vento.js.org") })
  .use(wiki())
  .copy("CNAME");
