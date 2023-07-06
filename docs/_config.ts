import lume from "lume/mod.ts";
import wiki from "https://deno.land/x/lume_theme_simple_wiki@v0.2.0/mod.ts";

export default lume({ location: new URL("https://vento.js.org") })
  .use(wiki())
  .copy("CNAME");
