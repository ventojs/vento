import lume from "@lumeland/lume";
import theme from "@lumeland/theme-simple-wiki";
import checkUrls from "@lumeland/plugin-check-urls";

const site = lume({ location: new URL("https://vento.js.org") });
site.use(theme());
site.use(checkUrls())

export default site;

