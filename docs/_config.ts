import lume from "lume/mod.ts";
import wiki from "https://deno.land/x/lume_theme_simple_wiki@v0.1.1/mod.ts";

const site = lume();
site.use(wiki());

export default site;
