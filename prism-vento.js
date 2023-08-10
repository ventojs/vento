Prism.languages.vento = {
  "comment": {
    pattern: /(^\{\{#[\s\S]*#\}\}$)/,
    lookbehind: true,
  },
  "delimiter": {
    pattern: /^\{\{-?|-?\}\}$/,
    alias: "punctuation",
  },
  "language-javascript": {
    pattern: /[\s\S]+/,
    inside: Prism.languages.javascript,
  },
};

Prism.hooks.add("before-tokenize", function (env) {
  const ventoPattern = /\{\{[\s\S]+\}\}/g;
  Prism.languages["markup-templating"].buildPlaceholders(
    env,
    "vto",
    ventoPattern,
  );
});

Prism.hooks.add("after-tokenize", function (env) {
  Prism.languages["markup-templating"].tokenizePlaceholders(env, "vto");
});
