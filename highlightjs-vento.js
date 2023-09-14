/** @type LanguageFn */
export default function (hljs) {
  return {
    name: "vento",
    subLanguage: "xml",
    contains: [
      hljs.COMMENT("{{#", "#}}"),
      {
        begin: "{{[-]?",
        end: "[-]?}}",
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: "^---\n",
        end: "\n---\n",
        subLanguage: "yaml",
        excludeBegin: true,
        excludeEnd: true,
      },
    ],
  };
}
