Prism.languages.vto = {
  "delimiter": {
    pattern: /\{{2}[->]?|-?\}{2}/,
    alias: "punctuation",
    lookbehind: true,
  },
  "comment": /^#[\s\S]*#$/,
  "javascript": {
    pattern: /\s*\S[\s\S]*/,
    alias: "language-javascript",
    inside: Prism.languages.javascript,
  },
};

Prism.hooks.add("before-tokenize", function (env) {
  const ventoPattern = /\{{2}[\s\S]+\}{2}/g;
  Prism.languages["markup-templating"].buildPlaceholders(
    env,
    "vto",
    ventoPattern,
  );
});

Prism.hooks.add("after-tokenize", function (env) {
  Prism.languages["markup-templating"].tokenizePlaceholders(env, "vto");
});
