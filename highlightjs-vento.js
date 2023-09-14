/** @type LanguageFn */
export default function (hljs) {
  return {
    name: "VTO",
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
    ],
  };
}
