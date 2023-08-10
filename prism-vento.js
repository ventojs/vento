Prism.languages.vento = {
  "delimiter": {
    pattern: /\{{2}-?|-?\}{2}/,
    alias: "punctuation",
  },
  "comment": /^#[\s\S]*#$/,
  "language-javascript": {
    pattern: /^[\s\S]+$/,
    inside: Prism.languages.javascript,
  },
};

Prism.hooks.add("before-tokenize", function (env) {
  const ventoPattern = /\{{2}[\s\S]+\}{2}/g;
  Prism.languages["markup-templating"].buildPlaceholders(
    env,
    "vento",
    ventoPattern,
  );
});

Prism.hooks.add("after-tokenize", function (env) {
  Prism.languages["markup-templating"].tokenizePlaceholders(env, "vento");
});
